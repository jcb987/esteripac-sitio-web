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
| **3** | Agente de IA de WhatsApp conectado de verdad. | **Backend construido; activación externa pendiente** — ver §13 |

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


---

## 13. Fase 3 — Agente de IA por WhatsApp

### Dónde vive

**Repositorio aparte, no dentro de este.** Es Python + Railway, con su propio
ciclo de vida de despliegue; nada que ver con el Vite/TS de este sitio.

```
Esteripac/
  Whatsapp Esteripac/          este repo (el sitio)
  whatsapp-closer-agentkit/    el backend del agente — repo git independiente
```

Clonado de <https://github.com/Hainrixz/whatsapp-closer-agentkit> (MIT). No es
una librería que se instala: es un *blueprint* que Claude Code lee y ejecuta
dentro de esa carpeta, fase por fase, generando código Python a medida.

### Cómo se construye — IMPORTANTE

**No se construye desde una sesión de Claude Code que tenga como raíz este
repo.** Los comandos (`/start`, `/armar-cerrador`, `/configurar`, `/playbook`,
`/conectar`, `/probar`, `/revisar`, `/publicar`, `/bandeja`, `/soltar`) son
skills de ESE proyecto (`.claude/skills/` dentro de `whatsapp-closer-agentkit`)
y solo se registran cuando la sesión arranca con esa carpeta como raíz.

Para construirlo: abrir una terminal nueva, `cd` a
`whatsapp-closer-agentkit/`, correr `claude`, y adentro `/start`. Ese kit tiene
su propio estado de reanudación (`.wca-estado.json`), así que sobrevive a
cortes de sesión igual que este proyecto sobrevive con `context/`.

### Decisiones ya tomadas

- **Railway, no Vercel.** El plan Hobby de Vercel prohíbe uso comercial en sus
  ToS; esto es para un cliente de pago. Railway es además el default del
  propio blueprint.
- **Alcance: catálogo + closer de ventas.** No es un bot de Q&A pasivo — debe
  calificar al que escribe, resolver objeciones con un playbook, y empujar
  hacia "Conviértase en cliente". Como Esteripac no publica precios, "cerrar"
  acá significa llevar a la apertura de cuenta institucional, no negociar un
  número — encaja de fábrica con la regla del kit de "no inventa ningún precio
  que no esté en el material".
- **Modo final automático.** El agente responderá sin aprobación mensaje por
  mensaje. Durante el primer despliegue sigue en borrador únicamente para
  comprobar Railway/PostgreSQL y conectar Meta; `config/cerrador.yaml` se crea
  después de esa conexión, cuando ya se pueda probar el canal real.
- **Filtro de entrada.** Acompaña a compradores institucionales y recoge NIT,
  institución, referencia y cantidad. Una persona que intenta venderle
  productos o servicios a Esteripac recibe un cierre cortés y no se deriva a
  la oficina. Sí se derivan reclamos, negociación de precio, enojo, solicitudes
  de una persona y consultas confirmadas fuera del catálogo.
- **El cliente no cambia de chat al derivarse.** El paso 6 calla el agente y
  avisa internamente a la oficina con motivo y enlace al mismo chat. La oficina
  entra a esa conversación; no se entrega otro número al comprador.
- **Trato de usted.** Coincide con la Q3 del kit (tratamiento formal), que ya
  es la convención de este sitio.
- **Proveedor:** Meta Cloud API directa. Railway aloja el backend; no es un
  proveedor de WhatsApp. Se descartó agregar una pasarela mientras Meta cubra
  el caso de uso, para evitar otro costo y otro punto de falla.
- **Modelo:** Claude Haiku 4.5, elegido por calidad conversacional y costo. El
  contexto del catálogo se selecciona localmente por consulta para no enviar
  sus 91 fichas completas en cada turno.
- **Número de pruebas:** un WhatsApp Business (app) que el cliente ya tiene.
  Antes de automatizar hay que confirmar en Meta si puede usar **Coexistence**;
  no se inicia una migración destructiva del número sin esa comprobación.

### El catálogo como base de conocimiento

El backend lee `knowledge/negocio/` (catálogo, precios, políticas) y
`knowledge/closer/` (metodología de venta, objeciones). Los PDF originales y
los datos sensibles no se suben a git. La exportación técnica
`catalogo-esteripac.md` sí se versiona en el repo de producción para que
Railway disponga de la misma fuente verificada; no contiene precios ni datos
de clientes.

`scripts/export_catalog_markdown.ts`, en **este** repo, exporta las 91 fichas
del catálogo tipado a Markdown, agrupadas por proceso, con la política de
precios explícita al inicio del archivo. Es la única fuente de productos que
el agente puede citar — nada que no esté ahí existe para él.

```bash
npx tsx scripts/export_catalog_markdown.ts > salida.md
cp salida.md ../whatsapp-closer-agentkit/knowledge/negocio/catalogo-esteripac.md
```

**Vuelve a correrlo y confirma el cambio versionado cada vez que cambie algo
en `src/data/products/`.** Así el sitio y el agente no divergen.

El playbook comercial guía hacia una solicitud de cuenta institucional, recoge
institución, NIT, responsable, proceso, referencia, cantidad, ciudad y urgencia,
y escala reclamos, enojo o peticiones de una persona. El agente ya opera en modo
automático sobre mensajes reales de Meta.

### Estado de la implementación

El backend ya está construido en `../whatsapp-closer-agentkit`: webhook
firmado y deduplicado de Meta, conversación persistente en PostgreSQL,
memoria reciente, búsqueda determinista del catálogo, Claude Haiku 4.5,
bandeja protegida de conversaciones y leads, envío idempotente, opt-out,
ventana de 24 horas y despliegue por Docker en Railway. El despliegue ya está
conectado a Meta y los pasos 3, 4 y 5 operan en automático. El panel permanece
como observabilidad, no como cola de aprobación obligatoria.

La escalación interna usa **Slack**. `config/negocio.yaml` declara
`canal_interno: slack`; sólo falta cargar `SLACK_WEBHOOK_URL` como secreto en
Railway. Se eligió sobre avisar a otro WhatsApp porque no consume una plantilla
de Meta, no depende de la ventana de 24 horas y entrega un enlace clicable al
chat del cliente.

La compuerta del backend quedó verde en Linux en el commit `4ee2f71`: los 23
chequeos pasaron sin errores, avisos ni salteados, incluidas 263 pruebas, el
contrato con sus seis pasos, las cuatro comprobaciones de firmas y el censo de
51 campos (47 afirmados por pruebas y 4 no mutables por diseño). La fuente de
verdad es la CI Linux `34078084299`. La CI reconstruye antes de auditar
`config/playbook-base.yaml` y `pruebas/salida-caso-01.json`; ambos siguen
ignorados porque son artefactos generados, no fuentes que deban versionarse.
El golden del wire schema y su manifiesto usan LF canónico para que sus hashes
sean idénticos en Windows y Linux.

El contrato de salida incorpora un bloque `comercial` estructurado con
institución, NIT, SKU confirmado, cantidad, ciudad, frecuencia estimada y
consentimiento de reposición. El bloque siempre está presente y cada valor es
nullable: sólo se completa con algo que el contacto haya dicho o confirmado.
`cantidad` y `frecuencia_estimada` conservan el texto y la unidad declarados;
el paso 5 los persiste en columnas de `leads_locales` sin borrar con nulos un
dato válido de un turno anterior.

Cuando `institucion`, `nit` y `sku_confirmado` están presentes a la vez, el paso
6 envía al canal interno un aviso positivo con motivo `lead_completo` y el CRM
usa la etapa `listo_para_cerrar`. La guarda persistente
`conversaciones.lead_completo_avisado_en` evita repetir el aviso en cada turno;
es independiente de `escalado_en`, por lo que no silencia al agente ni bloquea
una escalación posterior por queja, precio o pedido de atención humana. La
guarda sólo se fija si el canal confirmó el envío, para que una credencial
ausente no haga perder la oportunidad definitivamente.

### Dónde vive el contexto y la memoria

No existe un único archivo llamado «contexto del bot». Hay tres capas:

1. **Conocimiento estable, versionado en Git:** catálogo técnico en
   `knowledge/negocio/catalogo-esteripac.md`, reglas de venta en
   `config/playbook.yaml`, identidad en `config/marca.yaml` y datos generales
   en `config/negocio.yaml`. La búsqueda local selecciona las fichas relevantes
   para no enviar las 91 a Claude en cada turno.
2. **Memoria operativa, en PostgreSQL de Railway:** `contactos`,
   `conversaciones`, `mensajes`, `leads_locales`, `pendientes` y `eventos`.
   Guarda todo el historial; por economía y pertinencia, el modelo recibe los
   12 mensajes recientes. En desarrollo existe `wca.db`, ignorado por Git, pero
   ese SQLite local no es la base de producción.
3. **Memoria comercial:** `leads_locales` conserva etapa, score, temperatura,
   resumen, próximo paso y fecha, más institución, NIT, SKU confirmado,
   cantidad, ciudad, frecuencia estimada y consentimiento de reposición.
   Opcionalmente se puede reflejar en una tabla `leads` de Supabase, pero esa
   integración no está configurada y una tabla de Supabase no equivale por sí
   sola a un CRM comercial completo.

### CRM y recordatorios de reposición — pendiente explícito

Hoy ya se capturan de forma estructurada los datos mínimos del comprador y se
pueden guardar «próximo paso» y «próxima fecha», pero **todavía no existe un
flujo de reposición que despierte solo y vuelva a contactar al cliente**. El
recordatorio de citas existente no debe confundirse con reposiciones; además,
su scheduler persistente está detenido sobre PostgreSQL en el blueprint actual.

La solución profesional debe usar como fuente de verdad el CRM que Esteripac
ya tenga. Si no tiene uno, hay que decidir entre ampliar el panel como CRM
ligero o integrar uno antes de automatizar reposiciones. Como mínimo debe
guardar institución, NIT, responsable, SKU confirmado, última compra,
cantidad, frecuencia acordada o estimada, próxima fecha, consentimiento,
responsable interno, estado y resultado del seguimiento.

Un proceso programado consultará los seguimientos vencidos, generará un
borrador personalizado y lo enviará sólo después de aprobación —al menos
durante la validación—. Fuera de la ventana de 24 horas debe utilizar una
plantilla aprobada por Meta; siempre respeta opt-out y nunca inventa consumo,
stock, precio o fecha de entrega.

### Git, GitHub y fuente de despliegue

- **Git ya existe localmente:** ambos repos tienen historial y commits.
- **GitHub no es técnicamente obligatorio:** Railway admite desplegar una
  carpeta local mediante `railway up`, además de repositorios GitHub e imágenes
  Docker. Documentación oficial: <https://docs.railway.com/services>.
- **Producción ya tiene repositorio GitHub privado:**
  <https://github.com/jcb987/esteripac-whatsapp-agent>. `origin` apunta allí;
  el blueprint de Hainrixz quedó como `upstream` con push deshabilitado.
  Railway se conectará a `origin/main`, de modo que cada despliegue quede
  asociado a un commit revisable.

Flujo acordado para Railway:

1. `New Project` → `Deploy from GitHub Repo` y escoger
   `jcb987/esteripac-whatsapp-agent`.
2. Elegir `Add Variables` antes del primer despliegue real.
3. `New` → `Database` → `PostgreSQL`.
4. Referenciar `DATABASE_URL` del servicio PostgreSQL desde el backend y cargar
   los demás secretos directamente en Railway, nunca en Git ni en el chat.
5. Railway construye el `Dockerfile`; en `Settings` → `Networking` se genera
   el dominio público.
6. Comprobar `https://<dominio>/salud`; después se registra
   `/webhook/meta` en Meta y se valida primero en modo borrador.

También es viable crear y subir el proyecto desde la carpeta local con
`railway up --new --name esteripac-whatsapp`, pero no es el flujo elegido para
producción. Referencias: <https://docs.railway.com/cli/up> y
<https://docs.railway.com/quick-start>.

Pendientes externos para hacerlo real:

1. Crear el servicio y PostgreSQL en Railway desde el GitHub privado; cargar
   `ANTHROPIC_API_KEY`, `PANEL_TOKEN` y `SLACK_WEBHOOK_URL` directamente allí.
2. Configurar la app Business de Meta, verificar el negocio y confirmar
   Coexistence para el número actual.
3. Cargar en Railway, nunca en Git ni en el chat, los cuatro secretos de Meta,
   registrar el webhook y probar el canal primero en borrador.
4. Confirmar que los avisos llegan al canal de Slack de la oficina y aprobar
   el playbook del filtro.
5. Sólo entonces crear `config/cerrador.yaml` y activar el modo automático.

---

## 14. Cuentas — cuáles ya son de Esteripac y cuáles hay que migrarles

**Checklist vivo, no una entrada de fecha.** Actualizalo cuando cambie el
estado real de una cuenta; no agregues una entrada nueva en la bitácora para
esto, editá esta lista directamente.

Regla general: **toda cuenta que factura, guarda datos de clientes reales, o
controla algo que Esteripac necesita poder operar sin depender de Corbi,
tiene que quedar a nombre de Esteripac.** Mientras el proyecto era una prueba
tenía sentido usar cuentas personales para no frenar el avance; con el bot
recibiendo mensajes reales de clientes reales, cada una de éstas es una
dependencia real, no un detalle administrativo.

### ✅ Ya está bien — a nombre de Esteripac

- **Meta Business Manager / WhatsApp.** App "Esteripac" vive bajo el
  portafolio empresarial **"Esteripac SAS"**, no en el Facebook personal de
  nadie. Separación correcta desde el inicio. **Pendiente igual:** confirmar
  que alguien de Esteripac tenga login de admin ahí, no solo vos — si hoy sos
  el único admin del Business Manager, es un solo punto de falla.

### ⚠️ Bajo cuenta personal de Jerónimo/Corbi — pendiente migrar

- **Anthropic (`ANTHROPIC_API_KEY`).** Cuenta personal, decisión consciente
  para la etapa de pruebas. Migrar: Esteripac crea su propia organización en
  Anthropic con su propia tarjeta, genera una clave nueva, se reemplaza el
  valor en Railway y se borra la vieja. No hay "transferencia" real, es
  generar y reemplazar.
- **Railway.** Backend y sitio corren en el Railway personal del humano,
  facturado a su tarjeta (hoy en crédito de prueba, ver saldo en el
  dashboard). Mismo criterio que Anthropic: cuenta nueva de Esteripac,
  recrear los servicios o transferir el proyecto, actualizar DNS/dominios si
  los hay.
- **GitHub.** Los dos repos (`esteripac-whatsapp-agent`, privado, y
  `esteripac-sitio-web`, público) viven bajo `github.com/jcb987` — usuario
  personal, no una organización de Esteripac. Migrar: crear una organización
  de GitHub de Esteripac (gratis para repos privados con pocos
  colaboradores) y transferir los repos ahí, o al menos agregar a alguien de
  Esteripac como colaborador con permisos de administrador mientras se
  decide.
- **Slack.** Workspace "Esteripac" creado hoy con el correo personal del
  humano. **Decisión ya tomada con el cliente:** se transfiere después, a
  propósito — se prefirió no frenar la prueba esperando un correo de
  Esteripac. Migrar: agregar a alguien de Esteripac como miembro y después
  como **Owner** (no solo miembro) desde la configuración del workspace.
- **OpenAI (Whisper, transcripción de audio).** **Decidido: se usa, no
  Gemini/Google Cloud** — el código ya está escrito
  (`agente/medios.py:transcribir()`), solo falta la clave. Evaluamos
  alternativas gratis (Gemini: entrena con los datos salvo que pagues; Google
  Cloud Speech-to-Text: privacidad real pero cuenta y código nuevos) y no
  compensan frente a lo que ya funciona. Cuesta centavos (~USD 0,006/min de
  audio), pero **es plata real de Esteripac, no un detalle**: la cuenta y el
  saldo (mínimo USD 5) tienen que salir de una tarjeta de Esteripac, no de la
  del humano — mismo criterio que Anthropic y Railway, no "porque es barato
  entonces no importa de quién sea la cuenta".

### ❓ Sin confirmar — hay que revisarlo, no asumir

- **Vercel (el segundo sitio, `Pagina web Esteripac` → `esteripac.vercel.app`).**
  Lo desplegó Codex con `npx vercel deploy --prod`; no verifiqué bajo qué
  cuenta de Vercel quedó. Antes de decidir qué hacer con el sitio duplicado
  (ver bitácora), hay que confirmar esto — si es una cuenta personal, aplica
  el mismo criterio; si además terminan usando Vercel en producción, revisar
  primero si el plan Hobby sigue prohibiendo uso comercial en sus ToS (fue la
  razón original para preferir Railway).

### 🔜 Todavía no existen, van a aparecer

- **Mercado Pago** (si se activa cobro real): tiene que ser la cuenta de
  Mercado Pago de Esteripac desde el día uno, nunca la de Corbi — acá no hay
  "migrar después", es un problema legal/fiscal si el dinero pasa por una
  cuenta que no es la del comercio real.
- **Facturación electrónica DIAN.** Depende de qué use Esteripac hoy (Siigo,
  Alegra, o nada todavía) — sin confirmar.
- **Dominio propio**, si algún día quieren `esteripac.com` en vez de los
  subdominios de Railway/Vercel — no se ha hablado.
