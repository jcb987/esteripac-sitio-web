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

### 2026-09-04 · Fase 3 — se encontró y clonó el blueprint del agente

**Qué pasó**

El link que dio el humano (`tododeia.com/community/whatsapp-closer-agentkit`)
resolvió a `github.com/Hainrixz/whatsapp-closer-agentkit`. No es una librería:
es un blueprint MIT que Claude Code lee y ejecuta fase por fase dentro de su
propia carpeta, generando un backend Python a medida (Railway, Claude API,
Meta Cloud API/Zernio, Google Calendar, Supabase como CRM). Encaja casi
perfecto: usa `usted` como una de sus tres opciones de tratamiento, y su regla
de "no inventa ningún precio que no esté en el material" es exactamente la
política de precios de Esteripac.

**Qué hice**

- Cloné el repo como hermano de este: `../whatsapp-closer-agentkit/` (fuera de
  este git, tiene el suyo propio).
- Leí su README, `blueprint/00-mapa.md`, `knowledge/README.md` y el arranque
  de `blueprint/20-entrevista.md` para entender la arquitectura real antes de
  prometer nada.
- Escribí `scripts/export_catalog_markdown.ts` en ESTE repo: exporta las 91
  fichas del catálogo a Markdown, agrupadas por proceso, con la política de
  "no inventar precio" explícita al inicio. Lo corrí y copié el resultado a
  `../whatsapp-closer-agentkit/knowledge/negocio/catalogo-esteripac.md`
  (97 KB, 101 bloques — algunos productos aparecen en más de un proceso a
  propósito). Verificado que ese archivo queda ignorado por el git del otro
  repo (`knowledge/` no se sube nunca).
- Documenté toda la arquitectura en `context/proyecto.md` §13.
- `npm test` (14/14) y `npm run build` siguen pasando.

**Lo más importante que debes saber**

**No se puede correr `/start` ni ningún otro comando del kit desde una sesión
tuya rooteada en ESTE repo.** Esos comandos son skills de
`whatsapp-closer-agentkit/.claude/skills/` y Claude Code solo los registra
cuando la sesión arranca con esa carpeta como raíz. Lo comprobé: ninguno
aparecía en mi lista de skills disponibles en esta sesión. El humano tiene
que abrir una terminal nueva, `cd whatsapp-closer-agentkit`, correr `claude`,
y ahí sí `/start`.

**Lo que sigue sin decidir** (está detallado en `proyecto.md` §13, sección
"Pendiente antes de correr /start"):
1. Meta Cloud API vs. Zernio como proveedor de WhatsApp.
2. Migrar el número de pruebas del cliente (hoy es la app normal de WhatsApp
   Business, que no permite automatización) a esa API.
3. `ANTHROPIC_API_KEY` para el modelo del agente.
4. `knowledge/closer/` (metodología de venta, manejo de objeciones) está
   vacío — el propio kit espera que lo escriba el dueño del negocio con
   `/playbook`, no que se invente. Esto NO lo resolví yo a propósito.

**Si el humano vuelve a pedir "sigamos con WhatsApp" en este repo:** no hay
más que hacer del lado del sitio hasta que vuelva de la sesión en
`whatsapp-closer-agentkit/`. Si el catálogo cambia mientras tanto, hay que
volver a correr `scripts/export_catalog_markdown.ts` y copiar el resultado.

---

### 2026-09-04 · Fase 3 iniciada — agente de WhatsApp — SIN CÓDIGO TODAVÍA

**Contexto de esta entrada**

El humano quiere arrancar la Fase 3 (agente de IA real conectado a WhatsApp).
No alcancé a escribir código: se cerró la sesión por límite de contexto justo
en la etapa de decisiones de arquitectura. Esta entrada es el traspaso.

**Decisiones ya tomadas — respétalas**

- **Backend: Railway, NO Vercel.** Yo sugerí Vercel porque vi que estaba
  conectado a la cuenta vía MCP, pero el humano corrigió: el plan Hobby de
  Vercel prohíbe uso comercial en sus ToS, y esto es para un cliente de pago.
  Railway además es mejor para un webhook que debe estar siempre activo (sin
  cold-starts). **No propongas Vercel para el backend de WhatsApp.**
- **Alcance del agente: TODO.** No es solo Q&A del catálogo — debe actuar
  como un closer de ventas: responder preguntas técnicas Y guiar al cliente
  hacia la conversión (idealmente hacia "Conviértase en cliente"). Más
  ambicioso que un bot de consulta pasivo.
- **Número de pruebas:** el humano va a usar un WhatsApp Business (la app,
  no la API todavía) que él mismo tiene, como número de pruebas. Antes de
  automatizar hay que migrarlo o conectarlo a una API real (ver pendiente
  abajo) — la app de WhatsApp Business normal NO permite automatización.

**Pendiente urgente — pregúntaselo al humano apenas retomes**

1. **Repo de GitHub de referencia.** El humano dijo textualmente: "Mira te
   tengo un proyecto en github que te puede servir como base si quieres y
   coges ideas de ahi" — pero la sesión se cortó antes de que me pasara el
   link. **Pídeselo explícitamente antes de diseñar nada:** puede ahorrar
   trabajo o fijar un patrón que ya prefiere.
2. **Proveedor de la API de WhatsApp — sin decidir.** El humano "solo tiene
   el número de WhatsApp", nada de infraestructura de API todavía. Falta
   elegir entre Meta Cloud API directo (oficial, gratis, requiere
   verificación de negocio en Meta Business) vs. un BSP (Twilio, 360dialog,
   Gupshup — más rápido de levantar, tiene costo mensual). No asumas ninguno.
3. **Motor de IA del agente.** No se discutió qué modelo/API usa el agente
   (Claude API es lo natural dado el resto del stack, pero no está
   confirmado) ni cómo se le da el catálogo como base de conocimiento (los
   91 productos son pocos — probablemente caben completos en el prompt sin
   necesitar RAG/vectores, pero valídalo con el humano).
4. **Dónde vive el código del backend.** ¿Carpeta nueva dentro de este mismo
   repo (ej. `server/`) o repositorio aparte? No se decidió.

**Estado del repo: sin cambios desde el último commit**

```
669d4fe [claude] Fija el formato del código para el trabajo con dos herramientas
```

Nada de fase 3 está commiteado. `WHATSAPP_AGENT` en `src/config/site.ts` sigue
con el número placeholder `573000000000`.

**Qué necesitas saber del hilo de la conversación**

El humano probó primero que Claude Code y Codex se pasaran contexto
correctamente (funcionó — ver entradas anteriores) y pidió dos prompts
genéricos reutilizables para replicar el sistema en otros proyectos (se los
di, no se guardaron en este repo porque no aplican solo a Esteripac). Después
de eso pasó directo a pedir que pusiéramos WhatsApp a funcionar de verdad.

---

### 2026-09-04 · Formato fijado — leer antes de tu próxima tanda

**Qué hice**

- Agregué `.prettierrc.json` y `.prettierignore`, y fijé `prettier@3` como
  dependencia de desarrollo para que los dos usemos exactamente la misma
  versión.
- Formateé los 15 archivos que se desviaban. Cambio mecánico: solo reacomodo
  de líneas, ninguna modificación de lógica ni de datos.
- `npm run build` ahora corre `format:check` antes de `tsc`. Nuevos scripts:
  `npm run format` y `npm run format:check`.
- Commiteé tu entrada de bitácora, que había quedado sin commitear.

**Por qué**

El proyecto no tenía configuración de formato. Medí el impacto: con los valores
por defecto de Prettier, **41 de 41 archivos** salían reformateados. Eso
significa que la primera vez que tocaras un archivo mío, tu formateador podía
reescribirlo entero — diff ilegible, imposible de revisar y con conflictos
garantizados. Es el fallo más probable de un flujo con dos herramientas y no
lo habíamos cubierto.

**Qué necesitas saber**

- **No cambies `.prettierrc.json`.** Está calibrado al estilo que ya tiene el
  código (comillas simples, ancho 100, comas finales). Si tu build falla por
  formato, corre `npm run format`, no ajustes la configuración.
- El `git pull`/lectura de archivos de tu lado va a mostrar esos 15 archivos
  cambiados. Es solo formato, no revises línea por línea.
- **Cierra cada tanda con commit.** En el primer traspaso no lo pediste porque
  el prompt no lo decía; ya lo corregí en `context/prompts.md`. Lo dejo
  anotado acá para que no dependa de que el humano se acuerde de pedirlo.

**Estado de verificación**

- `npm test` → 14/14 · `npm run build` → OK (91.10 kB gzip, sin cambios)

---

### 2026-09-04 · Prompts de arranque

**Qué hice**

- Agregué `context/prompts.md` con los prompts para abrir sesión: primer
  contacto de Codex, sesiones siguientes, y plantilla para asignar una tarea.

**Qué necesitas saber**

- Los prompts son cortos a propósito y apuntan a los archivos de esta carpeta
  en vez de repetir el contexto. Si alguna vez un prompt y un archivo se
  contradicen, manda el archivo: el prompt es el que quedó viejo.

---

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
