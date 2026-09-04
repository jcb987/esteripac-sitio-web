# Bitácora de Claude Code → para Codex

> **Solo Claude Code escribe en este archivo. Codex: léelo, no lo edites.**
> Si necesitas responderme algo, escríbelo en `de-codex.md`; yo lo leo ahí.
>
> Entradas nuevas **arriba**. Formato: fecha · qué cambió · qué revisar.

---

## Carril activo

> Anota acá antes de empezar una tanda; borra al terminar.
> Si está ocupado, Codex trabaja en otro carril o espera.

_(libre)_

---

## Entradas

### 2026-09-04 · Carpeta de contexto y control de versiones

**Qué hice**

- Creé esta carpeta `context/` con el esquema de un solo escritor por archivo
  que pidió el cliente: `de-claude.md` (yo escribo, tú lees) y `de-codex.md`
  (tú escribes, yo leo). `proyecto.md` es la especificación compartida.
- Moví el antiguo `context.md` de la raíz a `context/proyecto.md` y le quité
  las secciones de bitácora, que ahora viven acá.
- Actualicé los punteros `CLAUDE.md` y `AGENTS.md` de la raíz.
- Inicialicé el repositorio git (antes no existía) con el primer commit de la
  fase 1 completa.

**Qué necesitas saber**

- El proyecto ya no tiene `context.md` en la raíz. Todo está en `context/`.
- Lee `context/proyecto.md` completo antes de tocar código. Las secciones §5
  (pipeline de datos) y §6 (hechos verificados) son las que más te van a
  ahorrar trabajo — y las que más fácil se rompen si se ignoran.

---

### 2026-09-04 · Fase 1 completa — sitio construido desde cero

**Qué construí**

Sitio estático completo: 9 páginas, catálogo de 91 fichas, navegación por
proceso, buscador con filtros, plantilla única de ficha de producto.

Estado verificado al cerrar: `tsc --noEmit` limpio · build ~91 kB gzip ·
14/14 pruebas · sin errores de consola ni scroll horizontal a 375px ni 1440px.

**Cómo saqué los datos del catálogo**

El PDF de Terragene (56 páginas, en la raíz del repo) se procesó en dos vías
deliberadamente separadas:

- **A mano:** todas las especificaciones técnicas → `src/data/products/*.ts`.
- **Por script:** fotos y virajes de color → `scripts/extract_assets.py`, que
  escribe `src/data/extracted.json` y `public/img/productos/`.

**Intenté** auto-parsear las especificaciones y no funciona: el folleto está
maquetado a 2–3 columnas y el orden del texto en el PDF no coincide con el
orden visual. Un parser produce datos plausibles pero silenciosamente
equivocados — por ejemplo, atribuye el sello FDA de un bloque al producto de
al lado. Por eso la transcripción es manual y está respaldada por pruebas.

**Errores que ya encontré y corregí — no los revivas**

Todos están documentados en `proyecto.md` §6. Los repito acá porque son
exactamente los que un agente nuevo "corrige" al revés:

1. **Sellos FDA: son 27, no 18.** Leer el PDF en orden de texto da 18. Los
   verifiqué por posición en página. La lista con su número de página está en
   `src/data/catalogo-fuente.ts` y hay una prueba que la exige.
2. **`IT28` vira de turquesa `#009FB5` a negro.** El extractor tomaba el
   viraje amarillo de la tabla `IT27` que está debajo en la misma página.
   Corregido con `MANUAL_COLORS` en el script.
3. **`CG3` es la etiquetadora (pistola), `IC10/20` es la incubadora (cilindro
   negro).** La heurística de proximidad los cruzaba. Corregido con
   `MANUAL_IMAGES`.
4. **Las imágenes se nombran por SKU, no por slug** (`photon` → `bph.webp`).
   Escribí rutas a mano en el hero de la home y rompí una imagen en silencio.
   Ahora se resuelven con `getProduct(slug)?.image`. **No escribas rutas de
   imagen literales.**
5. **La matriz de compatibilidad de la p. 41 es una grilla de checks**: hay que
   leerla como imagen, el texto extraído no dice qué celda está marcada. La
   transcribí en `proyecto.md` §6.

**Decisiones de arquitectura que conviene respetar**

- `src/lib/catalog.ts` es la única puerta de acceso al catálogo. Las páginas
  nunca importan el arreglo de productos. Es lo que va a permitir que la fase 2
  mueva el catálogo detrás de una API autenticada cambiando un solo archivo.
- `src/lib/whatsapp.ts` es el único sitio que arma enlaces `wa.me`.
- `src/config/site.ts` es el único sitio con datos de contacto. El número de
  WhatsApp de hoy es temporal.
- `ProductSpecSheet` + `SpecRow` son la plantilla única de ficha. No crees otra
  fila de especificación: la consistencia entre las 91 fichas es estructural,
  no depende de disciplina.
- `AuthContext` ya está montado devolviendo sesión anónima, y `ProductActions`
  ya tiene escrita la bifurcación `isAuthenticated ? … : CTA consultivo` donde
  irá el precio en la fase 2.

**Lo que queda pendiente del cliente**

Está en `proyecto.md` §9. Lo único con riesgo real antes de publicar es la
confirmación con Terragene sobre el uso de las fotografías del catálogo.

**Herramientas del entorno, por si te sirve**

- Chrome con `browser-harness` **no funciona** en esta máquina sin intervención
  del usuario: Windows Application Control bloquea el ejecutable y Chrome pide
  aprobar el debugging remoto a mano.
- Para revisar el sitio visualmente usé Playwright headless:
  `uv run --with playwright python …` contra `npm run preview` en el 4173.
  Funciona bien y no toca el Chrome del usuario.
- Los heredocs de bash se truncan alrededor de las ~150 líneas en este entorno.
  Para archivos largos, escribe con la herramienta de escritura de archivos.
