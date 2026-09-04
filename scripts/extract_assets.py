"""
Extrae del catálogo técnico los activos que no se pueden transcribir a mano:

  1. Las fotografías de producto -> public/img/productos/<SKU>.webp
  2. Los swatches de viraje de color (son vectores, no texto) -> extracted.json

Los datos técnicos NO se auto-parsean: el PDF tiene 2-3 columnas por página y un
parser de bloques SKU sería frágil y silenciosamente incorrecto. Esos datos se
transcriben a mano en src/data/products/ tras leer el catálogo.

Uso:
    uv run --with pymupdf --with pillow python scripts/extract_assets.py
"""

from __future__ import annotations

import io
import json
import re
import sys
import unicodedata
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_IMG = ROOT / "public" / "img" / "productos"
OUT_JSON = ROOT / "src" / "data" / "extracted.json"

# Área (pt^2) para considerar que una imagen es foto de producto: por encima de
# los íconos de dispositivo compatible y por debajo de los fondos a sangre.
MIN_PHOTO_AREA = 3000.0
MAX_PHOTO_AREA = 200000.0
# El folleto maqueta el texto a la izquierda y la foto a la derecha en la misma
# banda horizontal, así que la distancia vertical pesa mucho más que la lateral.
MAX_MATCH_DISTANCE = 320.0
DX_WEIGHT = 0.22
# Los swatches de color son cuadraditos de ~7pt junto a "Color inicial:/final:".
SWATCH_MAX_SIDE = 30.0
SWATCH_MIN_SIDE = 3.0

# --------------------------------------------------------------------------
# Correcciones verificadas contra el PDF renderizado.
#
# El catálogo lista buena parte de los accesorios y de las familias de SKU en
# tablas, sin encabezado "SKU:", así que la heurística no los ve. Acá se apunta
# cada uno a la imagen que le corresponde (xref del PDF), verificada por
# posición en la página.
# --------------------------------------------------------------------------
MANUAL_IMAGES: dict[str, tuple[int, int]] = {
    # SKU: (página 1-based, xref)
    "CDWAH": (8, 1050),
    "CDWAH-U": (8, 1046),
    "CDWU-H": (5, 27),
    "LUMENIA L1": (10, 90),
    "LUMENIA L2": (10, 94),
    "LUMENIA L122": (10, 102),
    "LSF1": (10, 98),
    "SWE-1.7": (13, 124),
    "SWE-2.0": (13, 124),
    "SWE-2.7": (13, 124),
    "SWE-3.0": (13, 124),
    "IT27-3YS": (22, 221),
    "IT27-4YS": (22, 221),
    "IT27-5YS": (22, 221),
    "IT27-7YS": (22, 221),
    "IT27-18YS": (22, 221),
    "KH2X025-P1/P": (30, 320),
    "KH2X12-P1/P": (30, 320),
    # La heurística cruza estos dos: en la página 52 la etiquetadora está a la
    # derecha de la incubadora, pero su bloque de texto arranca más arriba.
    "CG3": (52, 703),
    "IC10/20": (52, 719),
}

# IT28 comparte página con la tabla de la familia IT27, que también declara
# viraje; el emulador de tres puntos vira de turquesa a negro.
MANUAL_COLORS: dict[str, dict[str, str]] = {
    "IT28": {"inicial": "#009FB5", "final": "#1C1D1C"},
}


def find_pdf() -> Path:
    """El nombre del PDF llega con la codificación rota desde OneDrive."""
    candidates = sorted(ROOT.glob("*.pdf"))
    if not candidates:
        sys.exit("No se encontró el catálogo PDF en la raíz del proyecto.")
    return candidates[0]


def safe_name(sku: str) -> str:
    """SKU -> nombre de archivo. 'KH2X15-3.5Y/P' -> 'kh2x15-3.5y-p'."""
    text = unicodedata.normalize("NFD", sku)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = text.lower().replace("/", "-")
    text = re.sub(r"[^a-z0-9.\-]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")


def skus_on_page(page: pymupdf.Page) -> list[tuple[str, pymupdf.Rect]]:
    """Devuelve (sku, rect_de_la_etiqueta) para cada 'SKU: XXX' de la página.

    Una etiqueta puede declarar variantes separadas por '|' — se registran todas
    apuntando al mismo bloque, porque comparten la misma fotografía.
    """
    found: list[tuple[str, pymupdf.Rect]] = []
    for line_rect, line_text in text_lines(page):
        match = re.match(r"^SKU:\s*(.+)$", line_text.strip())
        if not match:
            continue
        raw = match.group(1)
        # 'PRO1 ENDO + Hisopos SWE' -> el SKU es lo anterior al '+'
        raw = raw.split("+")[0]
        for part in raw.split("|"):
            sku = part.strip().rstrip(".")
            if sku:
                found.append((sku, line_rect))
    return found


def text_lines(page: pymupdf.Page) -> list[tuple[pymupdf.Rect, str]]:
    lines: list[tuple[pymupdf.Rect, str]] = []
    data = page.get_text("dict")
    for block in data["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            text = "".join(span["text"] for span in line["spans"])
            lines.append((pymupdf.Rect(line["bbox"]), text))
    return lines


def photos_on_page(page: pymupdf.Page) -> list[tuple[pymupdf.Rect, int]]:
    """Imágenes suficientemente grandes para ser foto de producto, con su xref."""
    photos: list[tuple[pymupdf.Rect, int]] = []
    seen: set[tuple[int, int]] = set()
    for info in page.get_image_info(xrefs=True):
        xref = info.get("xref", 0)
        rect = pymupdf.Rect(info["bbox"])
        if xref == 0 or not (MIN_PHOTO_AREA <= rect.get_area() <= MAX_PHOTO_AREA):
            continue
        key = (xref, int(rect.x0))
        if key in seen:
            continue
        seen.add(key)
        photos.append((rect, xref))
    return photos


def match_photos(
    skus: list[tuple[str, pymupdf.Rect]],
    photos: list[tuple[pymupdf.Rect, int]],
) -> dict[str, int]:
    """Asigna a cada SKU la foto más cercana, sin reutilizar una foto dos veces.

    Se resuelven primero los pares más cercanos, de modo que un SKU con foto
    propia no se quede con la del vecino.
    """
    pairs = []
    for sku, sku_rect in skus:
        anchor_y = sku_rect.y0
        for photo_rect, xref in photos:
            centre_y = (photo_rect.y0 + photo_rect.y1) / 2
            dx = max(0.0, photo_rect.x0 - sku_rect.x1)
            distance = abs(centre_y - anchor_y) + dx * DX_WEIGHT
            if distance <= MAX_MATCH_DISTANCE:
                pairs.append((distance, sku, xref))

    pairs.sort(key=lambda item: item[0])
    assigned: dict[str, int] = {}
    used: set[int] = set()
    for _, sku, xref in pairs:
        if sku in assigned or xref in used:
            continue
        assigned[sku] = xref
        used.add(xref)
    return assigned


def swatches_on_page(page: pymupdf.Page) -> list[tuple[pymupdf.Rect, str, str]]:
    """(rect_de_la_etiqueta, 'inicial'|'final', hex) para cada swatch de color."""
    labels: list[tuple[pymupdf.Rect, str]] = []
    for rect, text in text_lines(page):
        stripped = text.strip().lower()
        if stripped.startswith("color inicial"):
            labels.append((rect, "inicial"))
        elif stripped.startswith("color final"):
            labels.append((rect, "final"))

    fills: list[tuple[pymupdf.Rect, str]] = []
    for drawing in page.get_drawings():
        fill = drawing.get("fill")
        rect = drawing["rect"]
        if not fill:
            continue
        if not (SWATCH_MIN_SIDE < rect.width < SWATCH_MAX_SIDE):
            continue
        if not (SWATCH_MIN_SIDE < rect.height < SWATCH_MAX_SIDE):
            continue
        hex_value = "#%02X%02X%02X" % tuple(round(c * 255) for c in fill[:3])
        if hex_value in ("#FFFFFF", "#000000"):
            continue
        fills.append((rect, hex_value))

    out: list[tuple[pymupdf.Rect, str, str]] = []
    for label_rect, kind in labels:
        best: tuple[float, str] | None = None
        for fill_rect, hex_value in fills:
            # El swatch va a la derecha de la etiqueta, en su misma línea.
            dy = abs((fill_rect.y0 + fill_rect.y1) / 2 - (label_rect.y0 + label_rect.y1) / 2)
            dx = fill_rect.x0 - label_rect.x1
            if dy > 9 or not (-4 < dx < 90):
                continue
            score = dy * 3 + abs(dx)
            if best is None or score < best[0]:
                best = (score, hex_value)
        if best:
            out.append((label_rect, kind, best[1]))
    return out


def main() -> None:
    pdf_path = find_pdf()
    doc = pymupdf.open(pdf_path)
    OUT_IMG.mkdir(parents=True, exist_ok=True)

    report: dict[str, dict] = {}

    for index in range(doc.page_count):
        page = doc[index]
        skus = skus_on_page(page)
        if not skus:
            continue

        assigned = match_photos(skus, photos_on_page(page))
        swatches = swatches_on_page(page)

        for sku, sku_rect in skus:
            entry = report.setdefault(sku, {"page": index + 1, "image": None, "colors": {}})

            xref = assigned.get(sku)
            if xref and entry["image"] is None:
                filename = f"{safe_name(sku)}.webp"
                if save_webp(doc, xref, OUT_IMG / filename):
                    entry["image"] = f"/img/productos/{filename}"

            # El swatch pertenece al SKU cuyo bloque lo contiene: el más cercano
            # por encima de la etiqueta de color.
            for label_rect, kind, hex_value in swatches:
                owner = nearest_sku_above(label_rect, skus)
                if owner == sku:
                    # El primero que aparece bajo el encabezado es el del
                    # producto; los de más abajo pertenecen a otro bloque.
                    entry["colors"].setdefault(kind, hex_value)

    apply_overrides(doc, report)

    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    with_image = sum(1 for e in report.values() if e["image"])
    with_colors = sum(1 for e in report.values() if e["colors"])
    print(f"SKU detectados : {len(report)}")
    print(f"Con fotografía : {with_image}")
    print(f"Con viraje     : {with_colors}")
    print(f"Reporte        : {OUT_JSON.relative_to(ROOT)}")


def apply_overrides(doc: pymupdf.Document, report: dict[str, dict]) -> None:
    for sku, (page_number, xref) in MANUAL_IMAGES.items():
        filename = f"{safe_name(sku)}.webp"
        if not save_webp(doc, xref, OUT_IMG / filename):
            continue
        entry = report.setdefault(sku, {"page": page_number, "image": None, "colors": {}})
        entry["image"] = f"/img/productos/{filename}"

    for sku, colors in MANUAL_COLORS.items():
        if sku in report:
            report[sku]["colors"] = colors


def nearest_sku_above(
    label_rect: pymupdf.Rect, skus: list[tuple[str, pymupdf.Rect]]
) -> str | None:
    """SKU cuyo encabezado está más cerca por encima de la etiqueta de color,
    dentro de la misma columna."""
    best: tuple[float, str] | None = None
    for sku, sku_rect in skus:
        dy = label_rect.y0 - sku_rect.y0
        dx = abs(label_rect.x0 - sku_rect.x0)
        if dy < 0 or dx > 60:
            continue
        if best is None or dy < best[0]:
            best = (dy, sku)
    return best[1] if best else None


def save_webp(doc: pymupdf.Document, xref: int, target: Path) -> bool:
    try:
        raw = doc.extract_image(xref)
    except Exception:
        return False

    image = Image.open(io.BytesIO(raw["image"])).convert("RGB")
    image.thumbnail((900, 900), Image.LANCZOS)
    image.save(target, "WEBP", quality=82, method=6)
    return True


if __name__ == "__main__":
    main()
