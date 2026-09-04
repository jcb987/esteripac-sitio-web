# Proyecto — Sitio web Esteripac S.A.S.

> Especificación del proyecto. La leen Claude Code y Codex.
> **Léela completa antes de tocar código.**
>
> Este archivo es estable: describe cómo es el proyecto, no qué se hizo ayer.
> El relato del día a día va en `de-claude.md` y `de-codex.md`.
> Si cambias algo estructural del proyecto, actualiza este archivo en el mismo
> turno y anúncialo en tu bitácora.

---

## 1. Qué es esto

Sitio web de **Esteripac S.A.S.**, distribuidor colombiano de indicadores
biológicos y químicos para esterilización, desinfección e higiene. Vende a
hospitales, clínicas odontológicas y laboratorios. Distribuye las marcas de
Terragene: **Chemdye®, Bionova®, Integron®, Cintape®**.

Proyecto de **Corbi** (agencia de automatización con IA). Cliente real, primer
proyecto insignia. Sitio actual del cliente: `esteripac.co`.

**El comprador es institucional**, no un consumidor: jefe de compras de una
clínica, coordinador de laboratorio, personal de un Departamento de
Procesamiento Estéril (DPE). No busca una página bonita: busca resolver un
proceso técnico rápido, confiar en que el proveedor es serio, y una vez es
cliente, volver a pedir sin fricción. Buena parte de las consultas se hacen
**desde el celular, dentro de la institución, en medio del proceso que se está
evaluando**. Por eso el sitio es mobile-first de verdad.

### Fases del proyecto

| Fase | Alcance | Estado |
|---|---|---|
| **1** | Sitio estático de alta conversión. Sin backend, sin precios, sin carrito. | **Terminada** |
| **2** | Portal B2B: login real, verificación con NIT, precios, carrito de recompra restringido. | Pendiente |
| **3** | Agente de IA de WhatsApp conectado de verdad. | Pendiente |

**El código de la fase 1 debe dejar las fases 2 y 3 como cambios aditivos, no
como refactor.** Ver §7.

---

## 2. Reglas duras — no negociables

1. **No inventar datos.** Productos, SKU, precios, especificaciones,
   condiciones o normas que no estén en el catálogo real del fabricante no
   existen. Si un dato falta, el campo va `null` y la interfaz muestra
   "Consultar". Hay pruebas automáticas que fallan si alguien inventa un SKU.
2. **Propiedad intelectual.** Los datos técnicos (SKU, condiciones, normas,
   microorganismo, población) son hechos objetivos y se usan tal cual. Los
   **párrafos descriptivos y de marketing del PDF son texto de marca de
   Terragene** (un proveedor) y NO se copian literalmente. Toda descripción de
   producto y de proceso está redactada con voz propia de Esteripac. Si agregas
   productos, redacta original.
3. **Sin precios públicos y sin carrito.** Es decisión del negocio: la venta es
   consultiva. No agregues precios ni "agregar al carrito" en la fase 1.
4. **El botón de contacto apunta siempre, conceptualmente, al agente de IA de
   WhatsApp.** Nunca a "hablar con un asesor" ni a un formulario genérico como
   flujo por defecto.
5. **Un solo lugar arma enlaces de WhatsApp:** `src/lib/whatsapp.ts`. No
   escribas `wa.me` en ningún otro archivo.
6. **Un solo lugar tiene datos de contacto:** `src/config/site.ts`.
7. **Español de Colombia**, trato de usted. Registro técnico y sobrio.

---

## 3. Estado actual — fase 1 terminada y verificada

- **91 fichas de catálogo** cubriendo **90 SKU** (85 productos físicos + 6
  soluciones digitales).
- **89 fotografías** de producto y **37 virajes de color** extraídos del
  catálogo del fabricante.
- **9 páginas**: Home, Soluciones, Familia, Proceso, Catálogo, Ficha de
  producto, Conviértase en cliente, Formación, Contacto (+ 404).
- `tsc --noEmit` limpio · build ~91 kB gzip · **14/14 pruebas de integridad** ·
  sin errores de consola ni scroll horizontal a 375px ni a 1440px.

### Comandos

```bash
npm run dev            # servidor de desarrollo
npm run build          # format:check && tsc --noEmit && vite build
npm run typecheck      # solo tipos
npm test               # vitest run — pruebas de integridad del catálogo
npm run format         # aplica el formato del proyecto
npm run format:check   # verifica sin escribir (corre dentro del build)
npm run preview        # sirve dist/
```

**El formato está fijado en `.prettierrc.json` y `npm run build` lo verifica.**
Es lo que impide que las dos herramientas se reformateen el código mutuamente:
sin un estilo declarado, cada una aplica sus valores por defecto y el primer
archivo que toca la otra sale reescrito entero en el diff. Si el build falla
por formato, corre `npm run format` — nunca cambies `.prettierrc.json` para
que tu estilo gane.

Regenerar imágenes y virajes desde el PDF (rara vez hace falta):

```bash
uv run --with pymupdf --with pillow python scripts/extract_assets.py
```

---

## 4. Stack y estructura

React 18 + TypeScript + Vite 6 + React Router 6 + Tailwind CSS 4
(`@tailwindcss/vite`, tokens con `@theme`). Vitest. Sin backend.

```
scripts/extract_assets.py     Extrae fotos y swatches del PDF (one-off)
public/img/productos/         89 .webp, nombrados por SKU (no por slug)
src/
  config/site.ts              ÚNICO lugar con contacto y nº de WhatsApp
  routes.ts                   Constructores de rutas tipados
  data/
    types.ts                  Product, ProductSeed, ProcessSlug, Brand…
    processes.ts              Taxonomía de navegación por proceso
    products/*.ts             Las 91 fichas, ESCRITAS A MANO
    products/index.ts         Ensambla e hidrata → PRODUCTS
    extracted.json            GENERADO por el script. No editar a mano.
    catalogo-fuente.ts        Listas de verificación (SKU oficiales, sellos FDA)
    catalog.test.ts           14 pruebas de integridad
  lib/
    catalog.ts                Única puerta de acceso al catálogo
    whatsapp.ts               agentUrl() — único generador de enlaces wa.me
    slug.ts
  features/account/           Stub de autenticación para la fase 2
  components/{layout,product,catalog,ui}/
  pages/
```

### Navegación: se entra POR PROCESO, no por categoría plana

Es la decisión de producto más importante del sitio. Un comprador busca "cómo
controlo esterilización por vapor", no "quiero ver todos los productos".

```
/                                        Home
/soluciones                              Las 4 familias
/soluciones/:familia                     monitoreo-limpieza | monitoreo-higiene
                                         monitoreo-esterilizacion | dispositivos-digitales
/soluciones/:familia/:proceso            vapor · peroxido-hidrogeno · oxido-etileno
                                         formaldehido · calor-seco · lavado
                                         desinfeccion · endoscopios · proteinas-residuales
/catalogo?q=&proceso=&marca=&tipo=&categoria=
/producto/:slug
/conviertase-en-cliente  /formacion  /contacto
/portal/*                                RESERVADO para la fase 2
```

Los filtros viven en la querystring a propósito: un coordinador puede mandar
por WhatsApp el enlace ya filtrado.

### La ficha de producto es UNA plantilla

`src/components/product/ProductSpecSheet.tsx` renderiza las 91 entradas, en
este orden y sin excepciones:

Nombre · SKU · Marca · Categoría · Proceso · Tipo de indicador · Viraje de
color · Condiciones de uso · Nivel de desafío · Datos biológicos ·
Conformidad normativa · Aprobado por FDA · Dispositivos compatibles ·
Presentación · Productos relacionados · Documentación descargable

Los bloques que no aplican se ocultan, pero los que sí aparecen **conservan
siempre la misma posición relativa**: comparar dos referencias nunca debe
obligar a cambiar de estructura mental. `SpecRow` es el único componente que
dibuja una fila — no crees otro.

---

## 5. Pipeline de datos — LEE ESTO ANTES DE TOCAR EL CATÁLOGO

Los datos vienen de un PDF de 56 páginas en la raíz del repo:
*Soluciones para el Área de la Salud* (Terragene, R01 octubre 2025).
El nombre del archivo tiene la codificación rota por OneDrive; el script lo
resuelve con un glob, no lo referencies por nombre literal.

**Hay una división deliberada:**

| Qué | Cómo | Dónde |
|---|---|---|
| Datos técnicos (SKU, condiciones, normas, compatibilidad) | **Escritos a mano** tras leer el catálogo | `src/data/products/*.ts` |
| Fotos y virajes de color | **Generados** por script | `src/data/extracted.json` + `public/img/` |

**No intentes auto-parsear las especificaciones del PDF.** El folleto está
maquetado a 2-3 columnas y el orden del texto en el PDF no coincide con el
orden visual: un parser de bloques SKU produce datos plausibles pero
silenciosamente equivocados. Ya se intentó. La transcripción manual está
verificada contra la fuente por las pruebas.

`ProductSeed` (lo que se escribe a mano) omite `image`, `colorShift` y
`commercial`; `products/index.ts` los inyecta. Si declaras `image` o
`colorShift` en el seed, tu valor gana sobre el del extractor — se usa para los
casos que el script no resuelve bien.

### Verificación automática

`npm test` compara los datos contra `src/data/catalogo-fuente.ts`, que es la
tabla de presentación del catálogo copiada como lista dura. Falla si:

- falta alguno de los 90 SKU oficiales, o aparece uno inventado
- un SKU está duplicado en dos fichas, o hay slugs repetidos
- el sello FDA está en una ficha que no lo declara (o falta en una que sí)
- un `relatedProducts` o `compatibleDevices` apunta a un slug inexistente
- una `image` apunta a un archivo que no existe en `public/`
- aparece un precio, disponibilidad o ciclo de consumo
- un indicador biológico se queda sin datos biológicos
- un `indicatorType` se asigna a algo que no es indicador químico

**Si tocas datos del catálogo, corre `npm test` antes de dar por terminado.**

---

## 6. Hechos verificados — no los deshagas

Estos costaron trabajo de verificación contra el PDF renderizado. Si algo
parece "mal" comparado con una lectura rápida del texto del PDF, es porque el
texto del PDF engaña. Revisa acá antes de "corregir".

- **27 productos tienen sello FDA, no 18.** Leer el PDF en orden de texto da
  18; el orden de lectura no coincide con la maqueta a dos columnas. Los 27 se
  verificaron por posición en página y están listados con su número de página
  en `catalogo-fuente.ts`.
- **Matriz de compatibilidad** (catálogo p. 41, es una grilla de checks que hay
  que leer como imagen):
  - `BT10 BT20 BT30 BT91` → solo incubadora `IC10/20`
  - `BT96 BT102 BT110 BT220 BT222 BT224` → `IC10/20FR`, `IC10/20FRLCD`, `MiniBio`
  - `BT98` → solo `Hyper` · `BT225` → solo `Photon`
  - `PRO1 MICRO` y `PRO1 ENDO` → `IC10/20`, `IC10/20FR`, `IC10/20FRLCD`, `MiniPro`
- **`IT28` vira de turquesa `#009FB5` a negro `#1C1D1C`.** El extractor tomaba
  por error el viraje amarillo de la tabla `IT27` que está debajo en la misma
  página. Corregido en `MANUAL_COLORS` dentro del script.
- **`CG3` es la etiquetadora (pistola) y `IC10/20` es la incubadora (cilindro
  negro).** La heurística de proximidad los cruzaba. Corregido en
  `MANUAL_IMAGES`.
- **Los archivos de imagen se nombran por SKU, no por slug**
  (`photon` → `bph.webp`). Nunca escribas rutas de imagen a mano: resuélvelas
  con `getProduct(slug)?.image`. Ya hubo un bug por esto en la home.
- **La compatibilidad equipo↔indicador se declara UNA sola vez**, del lado del
  indicador. La ficha del equipo la resuelve al revés con
  `getIndicatorsForDevice()`. No la dupliques en los dispositivos.

---

## 7. Preparado para la fase 2 — respeta estos puntos

El portal B2B debe entrar como cambio aditivo. Ya está preparado así:

1. **`src/features/account/AuthContext.tsx`** devuelve siempre sesión anónima.
   El provider ya está montado en `App`. La fase 2 reemplaza el cuerpo de ese
   archivo; sus consumidores no cambian.
2. **`ProductActions` es el único slot de acciones de la ficha.** Hoy renderiza
   el CTA del asistente. Ahí entra "Agregar a recompra" bajo `isAuthenticated`.
   La bifurcación `isAuthenticated ? … : CTA consultivo` ya está escrita.
3. **`commercial: { price: null, availability: null, reorderCycleDays: null }`**
   en el tipo `Product` documenta el contrato que la fase 2 hidratará tras
   autenticar con NIT.
4. **Las páginas nunca importan el arreglo de productos.** Todo pasa por
   `src/lib/catalog.ts`. Mover el catálogo detrás de una API es cambiar ese
   archivo y ninguno más. **Mantén esta regla.**
5. **`src/routes.ts`** tiene constructores tipados. Agregar rutas autenticadas
   no debe tocar ningún `<Link>`.

---

## 8. Diseño

Técnico y sobrio. **No genérico, no "hecho con IA".** Sin gradientes, sin
frases pegajosas de landing, sin contadores animados, sin layouts de plantilla
de agencia.

Paleta (marca Corbi), definida como tokens en `src/styles/theme.css`:

| Token | Valor | Uso |
|---|---|---|
| `navy-900` | `#16233A` | Color principal, headers, botones primarios |
| `gold-500` | `#FFB703` | Acento, badges, énfasis — **con avaricia** |
| `navy-50` | `#F4F6F9` | Fondo de secciones alternas |
| blanco | | Fondo base |

Los neutros se derivan del navy (matiz frío), no son grises puros: es lo que
evita que se lea como plantilla. Tipografía **IBM Plex Sans** (títulos, tracking
cerrado) + **Inter** (cuerpo). Cifras tabulares en las tablas de especificación.

El dorado se usa solo en: sello FDA, subrayado de sección activa, hover del CTA
primario. Si lo ves en más lugares, sobra.

**Mobile-first real.** La ficha en móvil abre con nombre · SKU · sellos · y una
barra de acción fija al borde inferior (67px de alto, no más). Las
especificaciones son una tabla de dos columnas que no colapsa.

---

## 9. Pendientes del cliente

No bloquean la demo, pero condicionan el lanzamiento:

- [ ] **Número de WhatsApp definitivo** del agente de IA. Hoy hay un número
      temporal de pruebas en `src/config/site.ts` (`WHATSAPP_AGENT`).
      Migrar = cambiar una línea.
- [ ] **NIT y razón social exacta** de Esteripac.
- [ ] **Confirmación con Terragene del uso de las fotografías.** Es lo único
      con riesgo real antes de publicar. Esteripac es distribuidor autorizado y
      usar imagen de producto del proveedor es práctica estándar, pero está sin
      confirmar por escrito.
- [ ] PDFs de IFU, certificados y COA para poblar `documents[]` (hoy `[]` en
      todas las fichas; la interfaz ya los contempla).
- [ ] Registros INVIMA por producto.
- [ ] Agenda real de capacitaciones (la de `/formacion` está marcada en
      pantalla como ejemplo).

---

## 10. Cómo trabajamos dos agentes sobre este repo

### Antes que nada: control de versiones

**Este repositorio todavía no está bajo git.** Con dos agentes escribiendo
sobre los mismos archivos, sin git un error de uno pisa el trabajo del otro sin
posibilidad de recuperación. Si aún no se ha hecho:

```bash
git init && git add -A && git commit -m "Fase 1: sitio Esteripac"
```

`.gitignore` ya existe y excluye `node_modules` y `dist`.

### Reglas de convivencia

1. **Un solo agente escribe a la vez sobre un mismo archivo.** Antes de empezar
   una tanda, anota tu carril al inicio de tu propia bitácora
   (`de-claude.md` o `de-codex.md`). Al terminar, bórralo.
2. **Reparte por carril, no por tarea suelta.** Carriles naturales que casi no
   se pisan:
   - *Datos*: `src/data/**`, `scripts/**`
   - *Interfaz*: `src/components/**`, `src/pages/**`, `src/styles/**`
   - *Infraestructura*: `src/lib/**`, `src/routes.ts`, `src/config/**`,
     `package.json`, configs
3. **`npm test && npm run build` antes de dar cualquier cosa por terminada.**
   Es el contrato compartido: si pasa, el otro agente puede seguir encima sin
   revisar tu trabajo línea por línea. El build incluye la verificación de
   formato.
4. **Cierra cada tanda con un commit**, con el nombre del agente en el mensaje
   (`[claude]` / `[codex]`). Trabajo sin commitear es trabajo que el otro
   agente puede pisar sin enterarse.
5. **Si tocas algo de este archivo, actualízalo en el mismo turno.** Este
   documento es el punto de encuentro; desactualizado, hace más daño que bien.
6. **No deshagas nada de §6 sin releer el PDF.** Si crees que un dato está mal,
   verifica contra el catálogo renderizado, no contra el texto extraído.

### Los archivos de esta carpeta

| Archivo | Quién escribe | Quién lee |
|---|---|---|
| `proyecto.md` (este) | Ambos, con cuidado y solo si cambia la estructura | Ambos |
| `de-claude.md` | **Solo Claude Code** | Codex |
| `de-codex.md` | **Solo Codex** | Claude Code |

La regla es simple: **nunca escribas en la bitácora del otro.** Si necesitas
responderle algo a Codex, lo escribes en `de-claude.md`; él lo lee ahí. Así
ningún archivo tiene dos escritores y no hay forma de que uno pise al otro.

En la raíz del repo, `CLAUDE.md` y `AGENTS.md` son punteros cortos hacia esta
carpeta: Claude Code lee el primero automáticamente y Codex el segundo.

---
