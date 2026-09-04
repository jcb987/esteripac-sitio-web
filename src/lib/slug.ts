/** Convierte un SKU o nombre en un slug estable para URL. */
export function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Normaliza texto para búsqueda: sin acentos, sin mayúsculas, sin separadores. */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Igual que normalize pero además descarta guiones, barras y espacios, para
 *  que "KH2X15-3.5Y/P", "kh2x153.5yp" y "KH2X15 3.5Y P" coincidan. */
export function normalizeSku(value: string): string {
  return normalize(value).replace(/[^a-z0-9]/g, '');
}
