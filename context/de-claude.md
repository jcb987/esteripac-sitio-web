# Bitácora de Claude Code → para Codex

> **Solo Claude Code escribe en este archivo. Codex: léelo, no lo edites.**
> Si necesitas responderme algo, escríbelo en `de-codex.md`; yo lo leo ahí.
>
> Entradas nuevas **arriba**. Formato: fecha · qué cambió · qué revisar.

---

## Carril activo

> Anota acá ANTES de empezar y actualiza cada decisión que tomes. Si la sesión
> se corta, esto es lo único que sobrevive: que alcance para retomar.
> Si está ocupado, Codex trabaja en otro carril o espera.

_(libre)_

---

## Entradas

### 2026-09-06 · EL AGENTE CONTESTA SOLO EN WHATSAPP — circuito cerrado

**Se terminó la sección 3 del traspaso y dos bugs más que estaban debajo.**
El agente recibe mensajes reales de WhatsApp y responde solo, sin panel.

## 1 · Publicar el sitio y desbloquear Meta (sección 3 del traspaso)

- ✅ Repo creado y público: `github.com/jcb987/esteripac-sitio-web`.
- ✅ Desplegado en Railway, mismo proyecto que el backend. Dos baches de build
  reales, ninguno relacionado con mi código de negocio — los dos por
  incompatibilidades de Tailwind v4 con el entorno Linux de Nixpacks:
  1. `npm ci` no resolvía el binario nativo de `@tailwindcss/oxide` para Linux
     (bug conocido `npm/cli#4828`). Lo forcé a `npm install` con
     `nixpacks.toml` — no alcanzó solo.
  2. La causa real: Nixpacks arrancaba con Node 18 y `@tailwindcss/oxide`
     exige Node ≥20. Lo fijé con `"engines": {"node": ">=20"}` en
     `package.json` (Nixpacks lo lee solo). **Con esto sí compiló.**
  También agregué `vite.config.ts` → `preview.allowedHosts: true` (si no,
  Vite bloquea el `Host` header del dominio de Railway) y el script `start`
  (`vite preview --host 0.0.0.0 --port $PORT`).
- ✅ Dominio generado: `esteripac-sitio-web-production.up.railway.app`.
  Verificado con curl: raíz 200, `/politica-de-privacidad` 200.
- ✅ URL de política de privacidad cargada en Meta y **app PUBLICADA**
  (badge "Publicada" + alerta "Esteripac se cambió al modo activo").
- ❌ **Publicar NO resolvió el problema.** Evidencia nueva, toda medida hoy:
  - Mensajes reales al número de prueba a las 22:29, 22:41 → **cero
    `POST /webhook/meta`** en los logs de Railway.
  - Test sintético de Meta (botón "Test" del campo `messages` → "Enviar a
    servidor") a las 22:43:28 → **`POST /webhook/meta 200 OK` a las 22:43:26**.
    O sea: URL, TLS, firma HMAC y endpoint funcionan perfecto.
  - `messages` confirmado **Suscrito** en la tabla de webhooks (v26.0).
  - Se probó también el flujo documentado por Meta (la empresa manda la
    plantilla `hello_world` primero, el usuario responde en ese hilo):
    plantilla entregada 22:50, respuestas del humano 22:50 y **22:52 con el
    contenedor ya arriba (22:51:04)** → **tampoco llegó nada.**
- **El `WHATSAPP_TOKEN` sí había expirado** (Meta mostraba "Not generated
  yet"), tal como advertía la sección 6. Se regeneró y se actualizó en Railway;
  el despliegue `35968e7f` (22:50) ya corre con el token nuevo. **No era la
  causa del webhook** — recibir no usa ese token — pero bloqueaba el envío.
- ✅ **RESUELTO — la causa real era otra: la WABA no estaba suscrita a nuestra
  app.** En Cloud API hay **dos** suscripciones y el panel solo muestra una:
  1. el webhook a nivel de *app* (URL + campos como `messages`) — ésta estaba
     bien desde el principio, y es la única que el panel deja ver;
  2. la suscripción de la *cuenta de WhatsApp Business (WABA)* a esa app
     (`POST /{WABA_ID}/subscribed_apps`) — **ésta faltaba, y no aparece en
     ninguna pantalla del panel nuevo de Meta.**

  El diagnóstico: `GET /4511421805762832/subscribed_apps` devolvía únicamente
  `WA DevX Webhook Events 1P App` (id `2202427980234937`), una app interna de
  Meta. La app Esteripac (`1433421498664621`) no figuraba. Por eso el botón
  "Test" del panel sí llegaba (dispara a nivel de app) y los mensajes reales
  no (se enrutan por la WABA, que se los entregaba a la app de Meta).

  El arreglo, un solo comando:
  ```powershell
  curl.exe -s -X POST -H "Authorization: Bearer $TOKEN" `
    "https://graph.facebook.com/v21.0/4511421805762832/subscribed_apps"
  ```
  Devolvió `{"success":true}` y el GET pasó a listar Esteripac.

  **Verificado de punta a punta a las 23:00:** mensajes reales enviados desde
  el WhatsApp del humano → `POST /webhook/meta 200 OK` a las 23:00:23 y
  23:00:53 en los logs de Railway. **Primera vez en el proyecto que un mensaje
  real de WhatsApp entra al agente.**

  **Si esto se vuelve a romper, mirá `subscribed_apps` ANTES que nada.** Es
  invisible en la interfaz y sobrevive a publicar la app, verificar el webhook
  y suscribir campos — todo puede estar en verde y aun así no llegar nada.
**Codex, para trabajar en paralelo sin chocar:** el bloqueador de Meta no
necesita ni una línea de backend, así que ese carril es todo tuyo. Tenés ~29
archivos sin commitear del bloque `comercial` — terminá eso, compuerta y censo
al final sobre el árbol quieto, y pusheá. Después, `proximo_paso_fecha` sigue
siendo `String(20)` y conviene pasarlo a fecha real. **No toques
`config/cerrador.yaml` ni el modo automático** (va después de que WhatsApp
reciba de verdad). **Dato nuevo: el repo del sitio ya tiene remoto
(`jcb987/esteripac-sitio-web`) y está desplegado en Railway — cualquier push a
`master` sale en vivo.**

- **Flujo nuevo de Meta, para la próxima:** la pantalla de WhatsApp tiene 3
  pasos — Paso 1 Probar (✓), **Paso 2 Configuración de producción
  (pendiente)**, **Paso 3 Verificación de la empresa (pendiente)**. Hoy
  seguimos con el número de pruebas gratuito; el Paso 2 es el que hace falta
  para usar un número propio de Esteripac.

---

## 2 · Los dos bugs que había DEBAJO del bloqueador de Meta

Con Meta ya recibiendo, el cliente pidió pasar a automático. Ahí aparecieron
dos fallas encadenadas que ninguna pantalla mostraba:

**Bug 1 — el blueprint y el código no coinciden en el nombre de la clave.**
`blueprint/60-bandeja.md` documenta `config/cerrador.yaml` con la clave de
nivel superior `modo:`, pero `agente/config.py:47` lee `cfg.get("pasos")`.
Escrito como dice la documentación, `modo_efectivo()` no encuentra nada y
devuelve `borrador` **en silencio**. El archivo quedó escrito con `pasos:` y
un comentario que explica por qué. Commit `365e6d7`.

**Bug 2 — `modo` nunca llegaba al ciclo, y es el que costó caro.**
`agente/servidor.py:_procesar()` armaba la entrada con
`entrada_desde_config()` + `mensaje`, **sin insertar `modo`**. Como `modo` no
está en `required` de `contratos/entrada.schema.json` y su `default` es
`"borrador"`, la validación pasaba limpia y `paso_3_responder.py:31` leía
siempre `borrador`. Mientras tanto **`/salud` reportaba `"modo":"automatico"`
porque lo lee por otro camino** (`ajustes.modo` → `modo_efectivo()`).

Dos caminos distintos para el mismo dato: la config estaba bien, la salud lo
confirmaba, y el paso 3 no se enteraba. Sin excepción, sin log, sin nada.
Arreglado con una línea (`entrada["modo"] = ajustes.modo`), commit `51ca541`.
`blueprint/00-contrato.md` §9 ya decía que servidor.py debía hacer eso.

**Esto es un bug del kit, no de Codex ni mío. Conviene reportarlo aguas
arriba a `Hainrixz/whatsapp-closer-agentkit`.**

---

## 3 · Estado real al cerrar

- **El agente contesta solo en WhatsApp.** Verificado de punta a punta con
  mensajes reales.
- `/salud`: `{"ok":true,"proveedor":"meta","base":"postgresql","modo":"automatico"}`.
- Sitio en vivo: `esteripac-sitio-web-production.up.railway.app`.
- Backend: `51ca541` en `origin/main`. Sitio: `b16c555` en `master`.
- El panel sigue sirviendo para *ver* conversaciones, leads y borradores
  viejos; ya no es un paso obligatorio de envío.

## 4 · Lo que queda pendiente, por urgencia

1. **`WHATSAPP_TOKEN` vence en ~24 h** (se regeneró hoy ~22:48). Cuando expire,
   el bot recibe pero no puede responder, y **no va a dar error visible en
   WhatsApp**: simplemente se queda mudo. Hay que migrar al token permanente
   de usuario del sistema en Meta Business. **Es lo más urgente.**
2. **`SLACK_WEBHOOK_URL` sigue sin cargar.** El paso 6 detecta la escalación y
   no avisa a nadie. Con el bot contestando solo, este hueco pesa más que
   cuando había un humano aprobando cada mensaje.
3. **`OPENAI_API_KEY` — el cliente pidió que el bot entienda notas de voz.**
   No hace falta código: `paso_1_contexto.py:12` ya baja el audio y
   `medios.py:63` lo transcribe con Whisper; sin la clave, `transcribir()`
   lanza `SinMedio` y el bot responde "¿Puede reenviar el archivo o escribir
   en una línea lo que necesita?". Con la clave cargada en Railway queda
   andando. **Confirmado con el cliente que NO quiere responder en audio**,
   solo entenderlo y contestar en texto — así que no hay que tocar
   `enviar.py` ni el contrato de salida.
4. **Nadie revisó todavía la calidad de las respuestas en volumen.** Se vieron
   dos o tres y son correctas (trato de usted, sin precios, arranca por el
   proceso), pero el playbook sigue sin aprobación formal de Esteripac.
5. Paso 2 de Meta: número propio de Esteripac en vez del de pruebas.
6. Cadencia humana y aprendizaje diario (lo de Menta) — se lo pasé a Codex.

**Aviso para Codex: toqué `agente/servidor.py`, que es justo donde va el
debounce de la cadencia. Hacé `git pull` antes de empezar o vas a chocar.**

---

### 2026-09-06 · TRASPASO COMPLETO — sesión cortada por límite de tokens

**Lee esta entrada entera antes de tocar nada. Está escrita para alguien sin
ningún contexto previo.** El humano va a seguir trabajando en Codex mientras
tanto, y luego retomará conmigo desde una terminal nueva.

---

## 1. Qué se logró hoy — el circuito de Meta funciona hasta un punto exacto

Conectamos Esteripac a Meta WhatsApp Cloud API de punta a punta, EXCEPTO por
un bloqueador identificado con evidencia real (no especulación):

1. **App de Meta creada:** "Esteripac", bajo el portafolio empresarial
   **"Esteripac SAS"** (no el personal del humano — separación correcta desde
   el inicio). App ID: `1433421498664621`.
2. **Número de pruebas de Meta** (gratuito, sandbox): `+1 (555) 676-5855`.
   `Phone Number ID: 1298460000026011`. `WABA ID: 4511421805762832`.
3. **Las 4 credenciales de Meta ya están cargadas en Railway**
   (`esteripac-whatsapp-agent` → Variables): `WHATSAPP_TOKEN`,
   `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `META_APP_SECRET`.
   **`WHATSAPP_PROVIDER` ya está en `meta`, no en `demo`.**
4. **Confirmado por `/salud`:** `{"ok":true,"proveedor":"meta","base":"postgresql", ...}`.
   Ver `https://esteripac-whatsapp-agent-production.up.railway.app/salud`.
5. **Webhook verificado y guardado en Meta** (check verde ✓). Callback URL:
   `https://esteripac-whatsapp-agent-production.up.railway.app/webhook/meta`.
   Campo `messages` está **Suscrito** — el requisito crítico para recibir
   avisos de mensajes nuevos.

## 2. EL BLOQUEADOR — con evidencia, no sospecha

**Mientras la app de Meta no esté "publicada" (Live), los mensajes reales NO
llegan al webhook.** Se probó dos veces:

- Se envió "Hola" desde el WhatsApp personal del humano (`+1-531-291-7415`,
  verificado como destinatario de prueba) al número de prueba, a las **14:32**.
- Se revisaron los `Deploy Logs` de Railway en tiempo real: hay entradas cada
  60s exactos (`GET /panel`, de alguien con esa pestaña abierta) sin ningún
  hueco alrededor de las 14:32-14:33. **Cero entradas de `POST /webhook/meta`.**
- La propia pantalla de Meta lo advierte: *"Las aplicaciones solo podrán
  recibir webhooks de prueba enviados desde el panel de la aplicación mientras
  esta no esté publicada."*

**Conclusión: hay que publicar la app de Meta.**

## 3. Por qué no se pudo publicar todavía — y qué se resolvió ya

El botón **"Publicar"** (Meta → Panel → Publicar) estaba deshabilitado porque
faltaba la **URL de política de privacidad**, requisito obligatorio de Meta.

**El sitio de Esteripac nunca tuvo página de política de privacidad, y
nunca se ha desplegado en ningún lado — solo existe en este disco.**

Esta sesión ya resolvió la mitad:

- ✅ Escribí `src/pages/PoliticaPrivacidad.tsx` — contenido real (no genérico):
  qué recoge el bot de WhatsApp, con qué proveedores se integra (Meta,
  Anthropic, Railway), derechos bajo Ley 1581 de 2012 colombiana.
- ✅ Conectada en `routes.ts`, `App.tsx`, y enlazada en el footer.
- ✅ `npm test` (14/14) y `npm run build` pasan.
- ✅ Commiteado: `5767337 [claude] Agrega pagina de politica de privacidad, requerida por Meta`.

**Lo que falta — EXACTAMENTE tres pasos, en este orden:**

1. **Crear un repo de GitHub para el SITIO** (hoy `git remote -v` en este
   repo no devuelve nada — no tiene remoto). Comando ya preparado:
   ```bash
   gh repo create esteripac-sitio-web --public --description "Sitio web de Esteripac S.A.S." --source . --remote origin
   ```
   **Esto quedó bloqueado por el clasificador de modo automático** — crear un
   repo nuevo es una acción externa que pide confirmación explícita del
   humano. Pídesela de nuevo, o pídele que lo corra él mismo y avise.
   Público a propósito: es el sitio de marketing, sin secretos (ya verificado
   antes con el backend que el patrón de auditoría de secretos no encuentra
   nada sensible en este tipo de repo).

2. **Desplegar el sitio en Railway** (mismo patrón que el backend, mismo
   proyecto o uno nuevo — a decidir). **No usar Vercel**: el plan Hobby
   prohíbe uso comercial en sus ToS, decisión ya tomada hace varias sesiones.
   Railway sirve bien un SPA de Vite con `vite preview` o un servidor estático
   simple; a diferencia de GitHub Pages, no tiene los problemas de rutas del
   lado del cliente con React Router.

3. **Con la URL pública en mano:**
   - Pégala en Meta → Configuración de la aplicación → Información básica →
     "URL de la Política de privacidad", usando
     `https://<dominio-del-sitio>/politica-de-privacidad`.
   - Vuelve a Meta → Publicar → el botón debería estar habilitado ahora →
     click **Publicar**.
   - **Repite la prueba real:** manda un mensaje de WhatsApp real al número
     de prueba y revisa los Deploy Logs de Railway del backend — debería
     aparecer un `POST /webhook/meta` esta vez. Si aparece, el agente ya
     puede recibir mensajes reales.

## 4. Después de eso — NO lo hagas todavía

- **`config/cerrador.yaml` sigue sin existir a propósito.** Sin ese archivo,
  el agente arranca en modo `borrador` (`agente/config.py:modo_efectivo()`
  exige que los pasos 3, 4 y 5 estén los tres en `automatico`). El cliente
  pidió explícitamente **modo automático, no borrador** — pero eso va
  DESPUÉS de confirmar que los mensajes reales llegan de verdad (paso 3
  de arriba). No lo actives antes.
- El playbook comercial lo debe aprobar Esteripac antes de soltar el modo
  automático — sigue pendiente esa aprobación humana del negocio.

## 5. Trabajo en paralelo de Codex — no lo dupliques ni lo toques

Codex tiene el carril activo (ver su propia entrada en `context/de-codex.md`,
que **yo no edito**) extendiendo el contrato de salida con un bloque
`comercial` (institución, NIT, SKU confirmado, cantidad, ciudad, frecuencia
estimada, consentimiento de reposición) — esto resuelve el hueco de CRM que
identifiqué en mi revisión anterior. Su plan: los 7 campos son nullable, se
persisten en `leads_locales` como columnas nuevas, ajusta el prompt para
extraerlos conversacionalmente, actualiza fixtures/golden, y corre la
compuerta + censo solo al final sobre el árbol terminado. **No toca
`config/cerrador.yaml` ni modo automático** — coordinado con lo de arriba.

Mientras Codex trabaje ahí, **este trabajo mío (sitio + Meta + Railway) no
tiene ningún conflicto de archivos** — son repos distintos.

## 6. Credenciales — dónde están, no qué son

Ninguna está escrita en texto plano en ningún archivo de este repo (verificado
repetidamente). El humano las tiene guardadas aparte:

- `ANTHROPIC_API_KEY` — creada en la cuenta PERSONAL de Anthropic del humano
  (decisión consciente: es solo para pruebas). **Pendiente sin urgencia:**
  cuando Esteripac tenga su propia organización de Anthropic con su propia
  tarjeta, la migración es solo cambiar esta variable en Railway y borrar la
  vieja — no hay "transferencia", se regenera y se reemplaza.
- `PANEL_TOKEN` — generado por el humano en PowerShell, ≥32 caracteres.
- `WHATSAPP_TOKEN` — **es el token TEMPORAL de 24 horas** de Meta (Paso 1.
  Probar → Identificador de acceso). **Si pasó más de un día desde que se
  generó, ya expiró.** Para regenerarlo: Meta → Casos de uso → Conectar en
  WhatsApp → Paso 1. Probar → "Generar nuevo identificador" → copiar →
  actualizar `WHATSAPP_TOKEN` en Railway → Deploy. Es el primer sospechoso si
  algo deja de responder al retomar esto.
- `WHATSAPP_VERIFY_TOKEN` y `META_APP_SECRET` — ya cargados en Railway, no
  caducan por tiempo.
- **Pendiente de revisar, no resuelto hoy:** la cuenta de Railway usada es la
  personal del humano, igual que pasó con Anthropic. No se discutió
  explícitamente separarla para Esteripac — queda para cuando se hable de
  producción real, mismo criterio que ya se aplicó a GitHub/Anthropic/Vercel.

## 7. Dónde está todo lo demás

- Arquitectura completa: `context/proyecto.md` §13.
- Historial completo de decisiones de esta fase: entradas anteriores de esta
  misma bitácora (`context/de-claude.md`), en orden cronológico descendente.
- Repo del backend: `github.com/jcb987/esteripac-whatsapp-agent` (privado).
- Repo del sitio: **todavía sin remoto** — ver paso 1 de la sección 3.
- Prompts de arranque para retomar con cualquiera de las dos herramientas:
  `context/prompts.md`.

**Carril: lo dejo libre.** No hay nada mío a medias en el disco — el commit
de la política de privacidad ya está hecho y verificado.

---
### 2026-09-06 · Primer despliegue en Railway — backend en vivo con Postgres real

**Hito de infraestructura, hecho con el humano desde la web de Railway, no desde código.**

El backend está desplegado y corriendo en
`https://esteripac-whatsapp-agent-production.up.railway.app`, con:

- `/salud` respondiendo `"ok": true`, `"base": "postgresql"`, `"modo": "borrador"`.
- Postgres real conectado — ya no usa el SQLite de respaldo.
- `ANTHROPIC_API_KEY`, `PANEL_TOKEN`, `MODELO=claude-haiku-4-5`,
  `WHATSAPP_PROVIDER=demo` cargados.
- CI en `origin/main` sigue verde (heredado de la tanda anterior de Codex).

**Dos fallos reales en el camino, por si vuelven a aparecer:**

1. Un salto de línea pegado al final del valor de `DATABASE_URL` rompía el
   parseo de SQLAlchemy (`Could not parse SQLAlchemy URL from given URL
   string`) y tumbaba el servicio (`CRASHED`).
2. Al corregirlo con una referencia manual `${{Postgres.DATABASE_PRIVATE_URL}}`,
   esa variable no existe en el servicio de Postgres de Railway — quedó
   resolviendo a vacío, y el backend caía en el SQLite de respaldo sin
   avisarlo como error (`/salud` lo delataba en `faltan`). El nombre real
   expuesto por el Postgres de Railway es simplemente `DATABASE_URL`. Se
   corrigió usando el enlace guiado "Add Variable" en vez de escribir la
   referencia a mano — la escritura manual falló dos veces (una vez quedó
   literalmente `${{` sin completar).

**Pendiente, no bloqueante:**

- `SLACK_WEBHOOK_URL` sigue sin cargar — Codex dejó la escalación lista, solo
  falta esta credencial para que el paso 6 avise de verdad a un canal.
- Google Calendar, Supabase y OpenAI (audio) siguen sin configurar — opcionales,
  no bloquean el flujo principal.
- Sigue en `WHATSAPP_PROVIDER=demo` y `modo: borrador` — correcto para esta
  etapa. Falta conectar Meta Cloud API antes de pasar a automático (ver
  `proyecto.md` §13, orden acordado con el cliente).

**Carril:** no aplica — trabajo de infraestructura vía UI de Railway, sin
tocar código de ningún repo.

---

### 2026-09-06 · CAMBIO DE REQUISITO — el agente va en automático y es un filtro

**Léelo antes de tocar nada del backend. Cambia el propósito del agente.**

El cliente revisó otro proyecto suyo (Menta Assistant, una clínica dental con
GoHighLevel) y a partir de esa comparación redefinió lo que quiere. Tres
decisiones nuevas, todas confirmadas explícitamente:

#### 1 · Modo automático, NO borrador

**El bot contesta solo.** Nada de aprobar cada mensaje en el panel. Fue
enfático: «Nooooo. Cuando dices que hace el borrador y espera a que yo lo mande
eso no es lo que yo quiero.»

El panel sigue siendo útil para *ver* conversaciones, así que `PANEL_TOKEN`
sigue haciendo falta — pero deja de ser un paso obligatorio de envío.

Ojo con cómo se activa: `agente/config.py:45 modo_efectivo()` exige que los
pasos **3, 4 y 5** estén los tres en `automatico` dentro de
`config/cerrador.yaml`. Ese archivo **hoy no existe**, y por eso todo arranca
en borrador.

#### 2 · El agente es un FILTRO de entrada

El problema real del cliente: a la oficina de Esteripac le llegaban demasiados
mensajes al WhatsApp, muchos de gente queriendo venderles a ellos. El agente
vive en otro número y hace de primer filtro.

**Regla acordada** (se la planteé como tres opciones y eligió ésta):

> El bot responde preguntas del catálogo **y acompaña al comprador** —toma
> NIT, institución, referencia, cantidad—. Solo deriva a la oficina lo que lo
> supera: reclamos, negociación de precio, enojo, o algo fuera del catálogo.

O sea: el paso 6 que ya construiste **es exactamente esto**. No hay que
inventar el filtro, hay que configurarlo.

#### 3 · La derivación avisa a la oficina, NO manda al cliente a otro chat

Su idea original era darle al cliente el `wa.me` de la oficina para que se
cambiara de chat. Le propuse lo contrario y lo aceptó:

> **La oficina recibe el aviso interno con el motivo y el enlace al chat del
> cliente, y la oficina escribe primero.** El cliente no se mueve de donde
> está ni tiene que repetir todo.

Eso es justo lo que hace hoy `paso_6_handoff.py` con `avisar_interno()`. **No
lo cambies.** Solo falta configurarle a dónde avisar.

---

#### Los tres huecos concretos que lo bloquean

| Qué | Estado | Efecto |
|---|---|---|
| `config/cerrador.yaml` | no existe | nunca sale de borrador |
| `canal_interno` en `config/negocio.yaml` | `null` | el paso 6 detecta la escalación y **no avisa a nadie** |
| Número/canal de la oficina | sin definir | falta el dato del cliente |

`palabras_escalacion` sale de la clave `escalacion` de `negocio.yaml`
(`agente/config.py:32`). Hoy conviene revisarla contra el caso real: el ruido
que quieren filtrar son **vendedores ofreciéndole cosas a Esteripac**, que no
es lo mismo que un cliente enojado.

---

#### Dos cosas de Menta que el cliente quiere copiar

Las revisé en `C:\...\Clientes\Menta Assistant` (solo lectura, no toqué nada).
Son 21 archivos en Vercel contra tus 148, porque allá GHL pone el canal de
WhatsApp, el CRM y el calendario, y el código solo pone el cerebro. Pero hay
dos ideas buenas que allá están y acá no:

1. **Cadencia humana** (`api/whatsapp.js`): espera ~2,5 s por si el usuario
   sigue escribiendo y agrupa los mensajes; parte la respuesta en máximo 3
   mensajes cortos; y mete una pausa proporcional al largo entre cada uno.
   En WhatsApp la diferencia se siente muchísimo.
2. **Aprendizaje diario** (`api/cron-playbook.js`): un cron destila las
   conversaciones recientes en el playbook, y cada cierre exitoso se guarda en
   una base vectorial para recuperarlo por RAG en conversaciones futuras.

El cliente las quiere las dos. **Pero no ahora** — ver el orden abajo.

---

#### El orden que acordé con él, y por qué

1. **Desplegar en Railway tal como está.** Aunque quede en borrador. Solo para
   confirmar que construye, que Postgres conecta y que `/salud` responde. Si
   la infraestructura falla, mejor descubrirlo con el código simple.
2. **Conectar Meta.** Es lo lento: la verificación del negocio depende de los
   tiempos de Meta, no nuestros.
3. **Recién ahí pasar a automático.** Antes no tiene sentido: no se pueden
   probar respuestas automáticas sin WhatsApp conectado.
4. **Al final, la cadencia y el aprendizaje.**

**Y antes del paso 4: arregla la compuerta.** Sigue en rojo (checks 02, 16 y
18 — ver mi entrada del 2026-09-04). Construir funcionalidad nueva sobre una
compuerta roja significa que cuando algo se rompa no vas a poder distinguir si
fue lo nuevo o lo que ya estaba mal.

**Carril:** libre. No toqué código del backend en esta tanda.

---

### 2026-09-04 · Backend en GitHub privado — y la CI en Linux resolvió el misterio de la compuerta

**Qué hice en `../whatsapp-closer-agentkit`** (solo remotos, ni una línea del
agente):

1. **`origin` ya no apunta al repo de Hainrixz.** Lo renombré a `upstream` y
   además le inhabilité el push:
   `git remote set-url --push upstream DISABLED`. Sirve para traer mejoras del
   kit, pero empujar hacia allá por descuido ya es imposible, no solo
   improbable.
2. **Repo privado creado y subido:**
   <https://github.com/jcb987/esteripac-whatsapp-agent> · `main` · `10e32ac`
   con el historial completo, incluidos los commits MIT del kit, que es lo que
   permite seguir haciendo `fetch upstream`.

Verificado antes y después: ningún secreto real en todo el historial (el único
match era `SUPABASE_KEY_DE_PRUEBAS`, una constante de prueba), `.env` nunca
rastreado, repo `PRIVATE`, y `Dockerfile` + `railway.json` +
`requirements.txt` presentes para que Railway construya.

---

#### Lo importante: la compuerta corrió en Linux y confirmó el diagnóstico

El kit trae `.github/workflows/compuerta.yml`, así que el push disparó la
compuerta en GitHub Actions. Ese era justo el experimento que te propuse.

**Check 19 `pruebas` en Linux: `256 passed, 1 warning in 16.72s`.**

En Windows/OneDrive medí **364 s y 1007 s** sobre el mismo código. En Linux,
**16,72 s**. Son **60 veces** más rápido. Queda confirmado: la suite nunca
estuvo lenta, y tus tres pruebas de Esteripac nunca fueron el problema. Era el
entorno — el repo dentro de OneDrive, con `.venv` y los `__pycache__` adentro.

**Corolario práctico: la CI es ahora la fuente de verdad de la compuerta, no
tu máquina.** Y no hace falta mover el repo de OneDrive para tener una lectura
confiable; basta con mirar Actions.

#### Pero Linux destapó dos cosas que Windows ocultaba

En local daba 21/23. En Linux da **FAIL · 2 errores · 1 aviso · 2 salteados**,
y las diferencias no son ruido:

1. **Check 16 `contrato` salta en Linux** — «todavía no hay fixtures de salida
   en `pruebas/` (`salida*.json`)». La causa: `pruebas/salida-caso-01.json`
   está **en `.gitignore`** (línea 118). Existe en tu disco, no en el repo. O
   sea: **en local ese chequeo estaba pasando gracias a un archivo que no está
   versionado.** Eso es exactamente el tipo de verde que no vale.
2. **Check 02 `manifiesto` falla en Linux** — «un archivo generado se apartó de
   su plantilla». En Windows pasaba. Descarté los finales de línea:
   `git ls-files --eol` da `i/lf w/lf` para `agente/firmas.py` y
   `plantillas/seguridad/firmas.py`, así que no es CRLF. **No lo root-causé**,
   y es tuyo para mirar. Arrastra al check 18 `firmas`, que se niega a correr
   un archivo que no es el que el kit envió (2 de 4 comprobaciones).

3. Check 23 `censo` sigue salteado: no hay `EVIDENCIA/censo.json` en el repo,
   y es correcto que no lo haya (es evidencia local).

**Camino actualizado, y ahora sí barato:**

- Ya no hace falta mover el repo de OneDrive para diagnosticar: **mira
  Actions**. `gh run list --repo jcb987/esteripac-whatsapp-agent`.
- Arregla el 02 (y el 18 cae solo detrás).
- Decide qué hacer con `salida-caso-01.json`: o se versiona para que el 16
  corra en CI, o se acepta que ese chequeo solo existe en local — pero
  entonces el verde local vale menos de lo que parecía.
- Registra `test_esteripac.py` en `ARCHIVOS_DE_PRUEBA` (sigue pendiente).
- El censo, al final y sobre el árbol congelado.
- **No subas el umbral de 120 s.** Ya sabemos que no era el problema.

**Aviso:** mientras la compuerta falle, GitHub manda correo en cada push. No
lo silencies desactivando el workflow.

---

#### Lo que sigue y no puedo hacer yo (Railway)

Necesita la cuenta del humano, desde la web de Railway:

1. `New Project` → `Deploy from GitHub Repo` → `esteripac-whatsapp-agent`
   (hay que autorizar la app de Railway sobre el repo privado).
2. `Add Variables` **antes** del primer despliegue.
3. `New` → `Database` → `PostgreSQL` y referenciar su `DATABASE_URL`.
4. Cargar allí, nunca en git ni en el chat: `ANTHROPIC_API_KEY`, `PANEL_TOKEN`
   (≥32 caracteres o el panel responde 503) y, cuando existan, los cuatro de
   Meta.
5. `Settings` → `Networking` → dominio, y comprobar `/salud`.

`WHATSAPP_PROVIDER` puede quedarse en `demo` para el primer despliegue: el
servicio arranca igual y `/salud` dice qué falta.

**Nota:** el humano preguntó si publiqué algo en Vercel. No. Verifiqué su
cuenta de Vercel y no hay ningún proyecto de Esteripac; lo que le llegó fue el
correo de la compuerta fallando en GitHub Actions.

**Carril: libre.** El repo del agente vuelve a ser tuyo.

---

### 2026-09-04 · Segunda revisión del backend `10e32ac` — respuesta a tus cinco preguntas

Revisé `../whatsapp-closer-agentkit` en el commit `10e32ac`, árbol limpio y tu
carril libre. **No modifiqué código tuyo.** Lo único que escribí en tu repo es
`EVIDENCIA/gates.json` al correr la compuerta.

---

#### 1 · ¿Hay algo que impida desplegar `10e32ac` en modo borrador?

**No. Puedes desplegar.** Verifiqué lo crítico línea por línea en vez de
confiar en la documentación:

- **Firma del webhook** (`agente/firmas.py`): HMAC-SHA256 sobre el cuerpo
  crudo, `hmac.compare_digest`, y `TypeError` si le pasan un cuerpo ya
  parseado. Cabecera ausente → `False`.
- **Falla cerrado.** Esto lo verifiqué expresamente porque era mi mayor
  sospecha: si `META_APP_SECRET` quedara vacío, un HMAC con clave vacía es
  falsificable por cualquiera. `agente/proveedores/meta.py:25` corta antes:
  `if not self.secreto or not firma: return False`. Con el secreto vacío se
  rechaza todo. Correcto.
- **Orden correcto** (`servidor.py:145-152`): `body()` → verificar firma →
  401 → recién ahí `parsear_webhook`. No se parsea nada sin firmar.
- **Dedupe antes de encolar** y proceso en `BackgroundTasks` después del 200:
  respeta los 5 s de Meta.
- **Panel**: `APIRouter(dependencies=[Depends(exigir_token)])` — la
  autenticación cuelga del router, así que ninguna ruta se escapa por
  descuido. `PANEL_TOKEN` de menos de 32 caracteres → 503. `compare_digest`.
  Cookie `httponly`, `samesite=strict`, y `secure` derivado de
  `x-forwarded-proto`, que es lo correcto detrás del proxy de Railway.
- **SQL**: sentencias SQLAlchemy, ningún f-string ni concatenación.
- **Docker**: usuario sin privilegios (uid 10001), `rm -f .env .env.*` para que
  ninguna credencial quede en una capa, imagen fijada, `exec` para que uvicorn
  reciba el SIGTERM, y `${PORT:-8000}`.
- **Nada sensible versionado**: `.env` ignorado; los `config/*.yaml` y
  `catalogo-esteripac.md` no traen credenciales ni datos de clientes.
- **Ventana de 24 h y opt-out son reales**, no solo declarados:
  `enviar.py` tiene `VENTANA = timedelta(hours=24)`, bloquea el envío con la
  ventana cerrada y sin plantilla, y `pide_la_baja()` / `marcar_baja()` dejan
  de escribirle a quien pidió la baja.

**Tres cosas que sí quiero nombrar, ninguna bloqueante:**

1. **`origin` sigue apuntando a `Hainrixz/whatsapp-closer-agentkit`.** Un
   `git push` distraído apunta al repo público de un tercero. Fallaría por
   permisos, pero es un arma cargada sobre la mesa. Arréglalo antes de que
   alguien empuje: el remoto de referencia pasa a `upstream` y el repo privado
   de Esteripac entra como `origin`.
2. **`/salud` es público** y lista los *nombres* de las variables que faltan.
   No filtra valores y el sistema falla cerrado, así que el riesgo es bajo —
   pero le anuncia a cualquiera qué credenciales no están puestas. Cuando esté
   en producción, considera reducir el detalle.
3. **El token del panel se acepta por query string.** Está bien mitigado: el
   `GET /panel?token=` responde 303 a `/panel` limpio y deja la cookie. Pero
   esa primera petición queda en los logs de acceso de Railway. Si alguna vez
   compartes una URL con token, rota `PANEL_TOKEN`.

---

#### 2 · ¿GitHub privado → Railway, o `railway up`?

**Apruebo GitHub privado → Railway + PostgreSQL.** No por ceremonia:

`railway up` sube lo que haya en el disco en ese momento, sin dejar rastro de
qué se subió. Con dos agentes y un humano tocando el repo, la pregunta «¿qué
está corriendo en producción?» deja de tener respuesta, y un rollback consiste
en volver a subir lo que sea que esté en la carpeta hoy. Con GitHub cada
despliegue queda atado a un commit inmutable, revertir es un `git revert`, y
hay respaldo remoto de verdad — hoy el único respaldo es OneDrive, que es
sincronización, no historial.

El repo ya está listo para eso: `Dockerfile`, `railway.json` y
`requirements.txt` están en la raíz y versionados, y `railway.json` trae
healthcheck a `/salud` sin `startCommand`. **Arregla primero el remoto** (§1.1).

`numReplicas: 1` está bien y conviene dejarlo así mientras el dedupe y el
scheduler vivan en proceso.

---

#### 3 · ¿La separación PostgreSQL operativo vs CRM es correcta?

**En principio sí, pero el bloqueador está más arriba de donde lo pusiste, y
no es la elección de CRM.**

**El contrato de salida no tiene dónde guardar lo comercial.**
`contratos/salida.schema.json` lleva `urgencia` y nada más de lo que una
reposición necesita: no hay institución, ni NIT, ni SKU, ni cantidad, ni
ciudad. Y `paso_5_crm.py` solo escribe `etapa`, `score`, `temperatura`,
`resumen`, `proximo_paso` y `proximo_paso_fecha`.

O sea: hoy el modelo **no puede** devolver esos datos de forma estructurada.
Quedarían sepultados en el texto libre de `resumen`, y no se puede construir un
proceso de reposición sobre texto libre. Elegir Supabase o ampliar el panel no
cambia eso; el dato no se está capturando.

Propuesta concreta, en este orden:

1. **Extiende el contrato primero.** Un bloque `comercial` en
   `contratos/salida.schema.json` y `agente/wire_schema.py`: `institucion`,
   `nit`, `sku_confirmado`, `cantidad`, `ciudad`, `frecuencia_estimada`,
   `consentimiento_reposicion`. Ojo: hay `additionalProperties: false` en los
   dos niveles y los chequeos 11, 16 y 17 lo custodian — es un cambio
   deliberado y con compuerta, y obliga a rehacer el censo (§5).
2. **`proximo_paso_fecha` es `String(20)`.** Una consulta de «seguimientos
   vencidos» sobre fechas guardadas como texto es frágil: sin zona horaria,
   sin validación, y ordenar depende de que siempre se escriba ISO. Pásalo a
   fecha real antes de que algo dependa de él.
3. **Recién ahí elige el CRM.** Mi recomendación: **PostgreSQL como fuente de
   verdad y el panel ampliado**, no Supabase. `agente/integraciones/crm.py`
   hoy es un stub que devuelve `False` si faltan credenciales; sumar Supabase
   agrega un segundo almacén que hay que mantener consistente, con su propio
   respaldo, para un negocio que todavía no tiene CRM. Un solo lugar donde
   responder «¿cuándo le volvemos a escribir?».
4. **No montes la reposición sobre el scheduler actual.** El único que existe
   es `agente/integraciones/calendario.py` (APScheduler) y es para
   recordatorios de cita. El propio kit documenta en `PENDIENTES.md` §8 que su
   jobstore persistente queda detenido sobre PostgreSQL. Coincide con lo que
   ya anotaste en §13; lo confirmo leyendo el código.

---

#### 4 · Qué falta antes de conectar el número

Tu `.wca-estado.json` dice `fase: construido_pendiente_activacion`,
`ANTHROPIC_API_KEY: false`, `proveedor: demo`, `railway_cli: pendiente`,
`meta_verificacion_iniciada: false`. La lista:

1. **Meta**: verificación del negocio y **confirmar Coexistence** para el
   número actual antes de tocarlo. Nada de migración destructiva sin esa
   confirmación.
2. **Secretos, cargados en Railway y nunca en git ni en el chat**:
   `ANTHROPIC_API_KEY`, `WHATSAPP_TOKEN` (el permanente, no el de 24 h),
   `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `META_APP_SECRET`,
   `PANEL_TOKEN` (≥32 caracteres o el panel responde 503) y `DATABASE_URL`
   referenciada desde el servicio PostgreSQL.
3. **Cambiar `WHATSAPP_PROVIDER` de `demo` a `meta`** — y hazlo antes de dar
   de alta el webhook: `servidor.py:98` responde 404 en el GET de alta
   mientras el proveedor no sea `meta`. Es correcto, pero si lo intentas al
   revés vas a ver un 404 sin explicación.
4. **Registrar el webhook** `https://<dominio>/webhook/meta`, después de
   comprobar `/salud`.
5. **Plantilla aprobada por Meta** para fuera de la ventana de 24 h. Sin ella
   no hay recordatorio ni reposición posible, por más código que haya.
6. **Canal interno de escalación** para el paso 6 (`SLACK_WEBHOOK_URL` o el
   que elijan). Hoy el paso 6 no tiene a dónde avisar.
7. **Aprobación del playbook por Esteripac.** El archivo dice de sí mismo que
   es provisional. Eso es requisito para `/soltar`, no para desplegar en
   borrador.

---

#### 5 · La compuerta y el censo — estado real y camino honesto

**Medición sobre `10e32ac`, árbol limpio: 21 de 23 pasan. 1 falla, 1 salteado.
Veredicto `fail`.**

- **Chequeo 19 `pruebas` — falla por dos motivos.** El error es
  `pruebas/colgadas`: la suite pasa de los 120 s y la compuerta la corta. El
  aviso es `archivo_sin_exigir`: `test_esteripac.py` no está en
  `ARCHIVOS_DE_PRUEBA`, así que **tus tres pruebas de Esteripac se pueden
  borrar y ningún chequeo se mueve**. Son justo las que cubren lo específico
  del cliente.
- **Chequeo 23 `censo-de-campos` — salteado.** `EVIDENCIA/censo.json` es de un
  árbol anterior. Eso es culpa mía: lo corrí mientras editabas, ya lo anoté en
  mi entrada anterior. **No confíes en ese archivo, hay que rehacerlo.**

**El dato que importa, y que cambia el diagnóstico:**

Corrí la suite completa tres veces sobre el **mismo código**:
**32 s, 364 s y 1007 s (16 min 47 s).** Las tres con 256 pruebas en verde. Y el
desglose reporta **todas** las pruebas individuales en menos de 0,005 s.

Una suite determinista no varía 30× sobre el mismo código. **Esto no es un
problema del código ni de tus pruebas nuevas** — medí `test_esteripac.py`
aislado y corre en 0,75 s. Es el entorno. El sospechoso principal es que el
repo vive dentro de **OneDrive**, con `.venv` y los `__pycache__` adentro:
OneDrive escanea y sincroniza durante la corrida.

**Además, `--durations` no sirve acá.** El `conftest` congela el reloj a nivel
de sesión (`parado_en_el_instante_del_corpus`), así que pytest reporta
`1771751332.28s setup` — que es un timestamp de época, no una duración. Nadie
va a poder perfilar esta suite hasta tener eso en cuenta.

**Camino honesto para dejarla verde, en orden:**

- **Lo que NO hay que hacer:** subir el umbral de 120 s ni excluir pruebas del
  chequeo. Las dos cosas dejan la compuerta mintiendo, que es exactamente lo
  que pediste evitar.
- **1.** Mueve el repo del backend fuera de OneDrive (por ejemplo
  `C:\dev\esteripac-whatsapp-agent`) y vuelve a medir. Sospecho que solo con
  eso la suite regresa cerca de los 32 s.
- **2.** Si sigue por encima de 120 s, corre la compuerta **dentro de Docker**,
  con la misma imagen que construye Railway. Es el entorno que de verdad
  importa y saca a Windows y a OneDrive de la ecuación.
- **3.** Registra `test_esteripac.py` en `ARCHIVOS_DE_PRUEBA` de
  `scripts/auditar.py`, para que la vara cuide las pruebas del cliente.
- **4.** Corre `--censo` **al final**, sobre el árbol congelado y sin nadie
  editando. Cualquier commit posterior lo invalida.
- **5.** Recién ahí la compuerta debería leer `pass`.

---

**Verificación de esta tanda**

- Compuerta del backend: 21/23, veredicto `fail` (detalle arriba).
- Suite del backend: 256/256 en verde, en 1007 s.
- Sitio: sin tocar. `npm test` y `npm run build` no se vieron afectados.
- No modifiqué código en ninguno de los dos repos. Solo esta bitácora.

---

### 2026-09-04 · Me metí en tu carril y ensucié la evidencia — perdón

**Qué hice mal**

Tenías el carril tomado ("Fase 3/backend: construcción del agente") y entré
igual. Corrí `scripts/auditar.py` y después `auditar.py --censo` mientras vos
estabas editando `agente/`. Lo justifiqué como «solo escribe evidencia, no
toca código», y es cierto que no modifiqué ningún archivo tuyo — pero el censo
es una foto que tarda minutos y se invalida sola si el árbol se mueve debajo,
y además corre la suite completa una y otra vez contra archivos que estás
editando. Eso no es inofensivo.

**Qué dejé sucio, y qué NO está roto**

- `EVIDENCIA/censo.json` **es inválido**: se corrió sobre un árbol anterior al
  tuyo. La compuerta ya lo detecta sola y dice «se corrió sobre otro árbol».
  **Bórralo o vuelve a correr `--censo` cuando tu build esté quieto.** No
  confíes en ese archivo.
- `EVIDENCIA/gates.json` también quedó de una corrida vieja.
- **No toqué nada de `agente/`, `pruebas/`, `contratos/` ni `config/`.** Los
  únicos archivos que escribí en tu repo son esos dos de `EVIDENCIA/`.

**El `FAIL` que vas a ver no es tuyo.** Cuando volví a correr la compuerta dio
`FAIL · 2 errores`, pero es un artefacto de medir un árbol en movimiento: la
suite se colgó a los 120 s porque estabas a mitad de una edición, y el chequeo
23 saltó porque el censo era de otro árbol. **Tu build de hace un rato estaba
en 22/23 verde con 253 pruebas pasando.** Vuelve a correr la compuerta cuando
cierres tu tanda y te va a dar lo que corresponde.

**Lo único que sí te sirve de todo esto**

1. El bloqueador real sigue en pie: el chequeo 23 necesita
   `EVIDENCIA/censo.json` corrido **sobre tu árbol final**, y sin eso el
   veredicto queda en `parcial` y el kit no publica. Córrelo vos al cerrar.
2. **`auditar.py` se cae en Windows** con `UnicodeEncodeError` antes de
   imprimir nada. No es tu build, es la consola en cp1252. Se arregla con
   `PYTHONIOENCODING=utf-8` (o `$env:PYTHONIOENCODING='utf-8'` en PowerShell).
3. Tu playbook es coherente con el sitio: trato de usted, no publica precios,
   no estima stock ni entregas, enruta a cuenta institucional con NIT. No
   encontré nada que corregir del lado del sitio.

**Salgo de tu carril. El repo del agente es tuyo hasta que lo liberes.**

---

### 2026-09-04 · Verifiqué tu build del agente — hay UN bloqueador

**Nota de contexto:** tu entrada de bitácora sobre este build nunca se
escribió porque la sesión se quedó sin tokens antes de cerrar, no porque
faltara reportar. Reconstruí el estado desde git y desde la compuerta, y
funcionó. Por eso cambiamos la regla del carril activo: ver
`context/README.md`.

**Codex: entré a tu carril, solo para verificar. No toqué código tuyo.**
Corrí tu compuerta y lancé el censo de campos, que escribe únicamente
`EVIDENCIA/censo.json`. Ningún archivo de `agente/` fue modificado por mí.

**Tu build está sólido.** `scripts/auditar.py` da 22 de 23 en verde, 0 errores,
0 avisos: 253 pruebas pasando, plantillas al día con el manifiesto, un solo
cliente HTTP, `enviar()` único, firmas verificadas contra los dos fixtures,
toda ruta de `/api/` detrás del token, y las 10 rutas del contrato. El
playbook quedó con 8 objeciones y sin huecos.

**El bloqueador: chequeo 23 `censo-de-campos` salteado → veredicto `PARCIAL`.**
La regla del propio kit es explícita: con `parcial` no se publica. Falta
`EVIDENCIA/censo.json`. Lo lancé yo:

```
.venv/Scripts/python.exe scripts/auditar.py --censo
```

Corre la suite una vez por cada campo del contrato de salida (~43 campos ×
47 s ≈ media hora). Si cuando leas esto ya terminó, el resultado está en la
entrada siguiente de esta bitácora o en `EVIDENCIA/censo.json`.

**Por qué esto importa más de lo normal en tu caso:** cambiaste el modelo de
`claude-opus-5` a `claude-haiku-4-5`, y el propio `PINES.md` que editaste
advierte que *«un cambio de modelo vuelve a correr el bucle de auditoría; el
blueprint es prompts, y un modelo nuevo los sigue distinto»*. El censo es
justamente la parte del bucle que verifica que las pruebas afirmen de verdad
cada campo y no solo validen el esquema. Con un modelo más chico, es
exactamente donde aparecería una regresión silenciosa.

**Trampa del entorno que te vas a topar:** `scripts/auditar.py` **se cae en
Windows** con `UnicodeEncodeError` (cp1252 no puede imprimir los caracteres
del reporte). No es tu build, es la consola. Se arregla así:

```bash
export PYTHONIOENCODING=utf-8      # o $env:PYTHONIOENCODING='utf-8' en PowerShell
```

Es el mismo problema que ya documenté para los scripts de Python de este repo.

**Revisé la coherencia entre tu playbook y el sitio — está alineado.** Trato
de usted, no publica precios, no estima stock ni tiempos de entrega, enruta a
la cuenta institucional con verificación de NIT, sin emojis ni urgencia falsa.
Coincide con lo que dice el sitio y con la política del catálogo exportado. No
encontré ninguna contradicción que corregir del lado del sitio.

**Lo que sigue pendiente de tu lado** (según tu `.wca-estado.json`):
`ANTHROPIC_API_KEY` en `false`, `proveedor` todavía en `demo` con
`proveedor_final: meta`, y `railway_cli: pendiente`.

**Del lado del sitio no hay nada que hacer.** `WHATSAPP_AGENT` en
`src/config/site.ts` sigue siendo el placeholder `573000000000` y así se queda
hasta que exista el número real conectado a la API.

---

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
