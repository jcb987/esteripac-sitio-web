# Bitácora de Codex → para Claude Code

> **Solo Codex escribe en este archivo. Claude Code: léelo, no lo edites.**
> Si necesitas responderle algo a Codex, escríbelo en `de-claude.md`; él lo lee
> ahí.
>
> Entradas nuevas **arriba**. Formato: fecha · qué cambió · qué revisar.

---

## Carril activo

> Anota acá antes de empezar una tanda; borra al terminar.
> Si está ocupado, Claude Code trabaja en otro carril o espera.

_(libre)_

---

## Entradas

### 2026-09-07 · Horario de atención retirado de todo el sitio

- Eliminé la propiedad central `SITE.hours` y sus tres usos: encabezado móvil,
  pie de página y página de contacto. También desapareció el rótulo “Horario
  de atención”; no queda espacio vacío ni dato muerto.
- Búsqueda final en `src/`, `public/` e `index.html`: cero coincidencias del
  horario, `SITE.hours` o el rótulo.
- Verificación: `npm test` 14/14 y `npm run build` correcto, incluidos
  Prettier, TypeScript y Vite.

**Estado:** terminado; carril libre.

### 2026-09-07 · La oficina recibe una oportunidad una sola vez cuando el lead está completo

**Qué cambió en el backend**

- El paso 6 suma el motivo positivo `lead_completo`: se activa únicamente si
  `institucion`, `nit` y `sku_confirmado` están presentes a la vez. Usa el
  mismo canal interno existente y el aviso se presenta como “Oportunidad lista
  para cerrar”, no como problema o escalación.
- La conversación guarda `lead_completo_avisado_en` por separado de
  `escalado_en`. El aviso positivo se marca sólo después de un envío exitoso,
  no se repite en turnos posteriores, no calla al agente y no impide que una
  queja, un precio fuera de rango o un pedido de humano escalen después.
- El CRM usa `listo_para_cerrar` para el bloque comercial completo y conserva
  `escalado` para la fricción. El contrato suma ambos valores y mantiene
  `additionalProperties: false` en todos sus objetos.
- La detección de presupuesto ya no interpreta los dígitos de un NIT o un SKU
  como dinero: exige contexto monetario explícito.
- El arnés de integración dobla las pausas humanas sin modificar producción y
  la fixture de Slack dejó de recargar todo el agente dos veces por nodo. Esto
  eliminó el timeout del chequeo 19. `respuesta/objecion_detectada` quedó
  afirmada además en el primer turno de bandeja para que el censo falle rápido
  bajo esa mutación.

**Verificación y estado de publicación**

- Commit local del backend: `f2c2c86 [codex] avisa leads listos para cerrar`.
  Queda un commit por delante de `origin/main`; no hice push, por lo que
  Railway todavía no recibió esta tanda.
- Censo final: 51 campos, 47 afirmados, 4 no mutables y 0 indeterminados.
  Compuerta: PASS 23/23, 276 pruebas en 23,98 s, 0 errores, 0 avisos y 0
  salteados.
- Sitio sin cambios funcionales: `npm test` 14/14 y `npm run build` correcto.
- `SLACK_WEBHOOK_URL` sigue siendo la credencial operativa pendiente en
  Railway; sin ella el gatillo queda registrado pero el aviso no puede salir.
- Dejé fuera del commit una modificación concurrente no mía en
  `agente/servidor.py`, que envía una pregunta de respaldo cuando falla un
  medio. Está preservada en el árbol de trabajo para que su autor la cierre.

**Estado:** implementación terminada, validada y committeada; falta revisar y
publicar `f2c2c86` para desplegarla.

### 2026-09-07 · Cadencia humana desplegada en el agente automático

**Qué cambió en el backend**

- El webhook registra primero cada evento para dedupe y después agrupa los
  textos por conversación durante 2,5 segundos. Sólo el token más reciente
  vacía el buffer y ejecuta un ciclo con los mensajes unidos en orden. Los
  medios pasan inmediatamente y contactos distintos corren en paralelo.
- El buffer y su scheduler viven en el proceso, deliberadamente: funciona con
  `railway.json` en una réplica. Antes de subir `numReplicas` hay que mover ese
  estado a Redis o PostgreSQL para no producir respuestas dobles.
- El paso 3 parte la respuesta por bloques en blanco y envía como máximo tres
  burbujas. El primer bloque sale de inmediato; los siguientes esperan
  `min(1,2 s + 25 ms por carácter, 4 s)`. Cada bloque pasa por `enviar()`, así
  que conserva ventana de 24 h, baja, límite de insistencia e idempotencia.
- Normalicé los espacios de la detección de baja: «No» y «me escriban» en dos
  burbujas sigue bloqueando toda respuesta. El prompt pide hasta tres bloques
  cortos para que la separación no dependa de prosa larga.
- Añadí `pruebas/test_cadencia.py`, lo registré en
  `ARCHIVOS_DE_PRUEBA` y documenté la arquitectura. No toqué
  `config/cerrador.yaml` ni código del sitio.

**Verificación y despliegue**

- Commit de implementación: `78406b1 [codex] agrega cadencia humana al
  agente`.
- Local: 270 pruebas, 3 warnings; censo 51 campos, 47 afirmados y 4 no
  mutables; compuerta PASS, 23/23, 0 errores, 0 avisos y 0 salteados.
- Sitio, sin cambios: `npm test` 14/14 y `npm run build` correcto.
- PR `#1`: CI Linux `34085318772` en verde antes de fusionar. Merge a
  `origin/main`: `c88df0b`; CI de `main` `34085898233` en verde en 7m22s.
  Railway quedó respondiendo `/salud` con HTTP 200, Meta, PostgreSQL y modo
  automático.
- Después del despliegue aparecieron cambios locales **no committeados y no
  desplegados** en `agente/base.py` y `agente/enviar.py`, sobre reactivación
  tras una baja. Son trabajo concurrente ajeno a esta tanda: no los modifiqué,
  descarté ni incluí en la PR.

**Estado:** cadencia desplegada; carril libre.

### 2026-09-06 · Contrato comercial estructurado y persistente

**Qué cambié en el backend**

- Extendí el contrato JSON y el modelo Pydantic con el bloque superior
  `comercial`: `institucion`, `nit`, `sku_confirmado`, `cantidad`, `ciudad`,
  `frecuencia_estimada` y `consentimiento_reposicion`. El bloque siempre está
  presente; sus siete claves son requeridas por la forma estricta pero sus
  valores son nullable. Tanto la salida como el bloque rechazan propiedades
  adicionales.
- El paso 2 conserva lo extraído por el modelo y el paso 5 aplana esos datos en
  columnas de `leads_locales` y, cuando está configurado, en el CRM externo. La
  migración agrega las siete columnas a bases existentes; un nulo posterior no
  borra un dato comercial válido ya persistido.
- Ajusté el prompt para reconocer datos dichos o confirmados por el comprador,
  hacer como máximo una pregunta natural por turno y no convertir la charla en
  formulario. SKU, cantidades, frecuencia y consentimiento nunca se infieren.
- Actualicé fixtures, golden files, manifiesto, panel y auditoría. Añadí
  pruebas del flujo completo, migración de una base vieja, conservación entre
  turnos, escritura externa y forma estricta del contrato.
- El vendedor que ofrece algo a Esteripac ya se distinguía explícitamente y
  tenía prueba: recibe un cierre cortés sin escalar a la oficina. Conservé esa
  ruta y no dupliqué la lógica.

**Qué no cambié**

- No creé `config/cerrador.yaml`, no activé el modo automático y no empecé la
  cadencia de reposición. Sigue faltando la conexión real con Meta antes de esos
  pasos.

**Estado de verificación**

- Backend publicado en `origin/main`: implementación `341f117` y corrección
  multiplataforma `4ee2f71`.
- El primer intento de CI descubrió que el hash del golden se había calculado
  sobre CRLF de Windows. Normalicé los golden a LF, regeneré el manifiesto y lo
  verifiqué con Python Linux: 7/7 plantillas y 7/7 copias exactas.
- Censo final: 51 campos, 47 afirmados y 4 no mutables; los siete campos
  comerciales están afirmados por `test_esteripac.py`.
- Compuerta local: PASS, 23/23, 263 pruebas, 0 errores, 0 avisos y 0 salteados.
  CI Linux `34078084299`: PASS en 8m12s sobre `4ee2f71`.
- Sitio: `npm test` → 14/14; `npm run build` → OK.
- El carril queda libre.

### 2026-09-06 · Compuerta verde y escalación interna lista

**Qué cambié en el backend**

- Encontré la causa real de los checks 02, 16 y 18: la CI auditaba antes de
  reconstruir `config/playbook-base.yaml` y `pruebas/salida-caso-01.json`, dos
  artefactos deliberadamente ignorados. No era CRLF ni una deriva de
  `agente/firmas.py`. Ambos siguen fuera de Git; el workflow copia el primero y
  genera el segundo al correr la suite antes de la auditoría.
- El workflow ahora regenera también el censo antes de abrir la compuerta.
  `test_esteripac.py` ya figuraba en `ARCHIVOS_DE_PRUEBA`; lo confirmé y añadí
  cinco pruebas Esteripac al archivo.
- Configuré `canal_interno: slack`. En Railway sólo faltará el secreto
  `SLACK_WEBHOOK_URL`; el aviso existente del paso 6 incluye motivo, contacto y
  enlace al chat.
- Reservé las palabras de escalación para un comprador con reclamo, negociación
  de precio, enojo, petición de persona o consulta confirmada fuera del
  catálogo. Un vendedor que ofrece productos o servicios recibe un cierre
  cortés desde prompt/playbook, sin recopilar datos ni avisar a la oficina.
- No reescribí el paso 6, no creé `config/cerrador.yaml`, no activé automático y
  no empecé cadencia ni aprendizaje diario.

**Qué revisar**

- Backend publicado en `origin/main`: `e3f83be` y corrección de esquema
  `dd7388c`. La primera forma del filtro agregó una propiedad no admitida por el
  esquema estricto; quedó corregida dentro del campo `tono` ya permitido.
- CI Linux `34048212270`: 23/23 checks, 258 pruebas, 0 errores, 0 avisos y 0
  salteados. Check 16: una salida válida con seis pasos; check 18: 4/4 firmas;
  check 23: 43 campos declarados, 40 afirmados y 0 sin prueba ejecutable.
- Próximo paso externo: Railway + PostgreSQL y secretos; después conectar Meta
  en borrador y comprobar Slack antes de crear el cerrador automático.

**Estado de verificación**

- Sitio: `npm test` → 14/14; `npm run build` → OK.
- Backend: CI Linux → PASS en 6m18s sobre `dd7388c`.
- El carril queda libre.

### 2026-09-04 · Solicitud de segunda revisión: memoria, CRM y despliegue

**Qué documenté**

- Amplié `context/proyecto.md` §13 con la separación entre conocimiento
  versionado, memoria conversacional en PostgreSQL y memoria comercial.
- Dejé explícito que `leads_locales` es un CRM mínimo: hoy guarda resumen,
  etapa, próximo paso y fecha, pero aún no existe automatización de reposiciones.
- Documenté el diseño mínimo de reposición y la obligación de usar plantilla
  aprobada por Meta fuera de la ventana de 24 horas.
- Aclaré que Git ya existe, GitHub no es requisito técnico para Railway y
  `railway up` puede desplegar localmente. Para producción recomiendo un GitHub
  privado propio como fuente de despliegue y dejé el flujo completo de Railway.

**Claude Code: opinión solicitada por el humano**

Por favor revisa el backend en `../whatsapp-closer-agentkit` y responde en tu
propia bitácora, sin editar ésta:

1. ¿Ves un riesgo técnico o de seguridad que impida desplegar el commit
   `10e32ac` en modo borrador?
2. ¿Apruebas GitHub privado → Railway + PostgreSQL como flujo de producción,
   frente a desplegar sólo con `railway up`?
3. ¿La separación actual entre PostgreSQL operativo y un CRM como fuente de
   reposiciones te parece correcta? Propón cambios concretos si no.
4. Confirma qué falta antes de conectar el número: Meta/Coexistence, secretos,
   webhook, plantilla, canal de escalación y aprobación del playbook.
5. Revisa especialmente el estado real de la compuerta/censo y recomienda el
   camino correcto para dejarla verde sin falsear evidencia.

**Qué no hice**

- No creé cuentas, repositorios ni servicios externos.
- No pedí, copié ni versioné credenciales.
- No modifiqué `context/de-claude.md`.

**Estado de verificación**

- `npm test` → 14/14 pruebas aprobadas.
- `npm run build` → OK (Prettier, TypeScript y Vite).
- El carril queda libre.

### 2026-09-04 · Backend de WhatsApp construido; pendiente activación externa

**Qué hice**

- Construí y confirmé en el repo hermano `../whatsapp-closer-agentkit` el
  backend FastAPI para Railway, Meta Cloud API directa y Claude Haiku 4.5.
- Implementé webhook firmado y deduplicado, memoria en PostgreSQL, selección
  local del catálogo verificado, flujo closer, opt-out, ventana de 24 horas,
  envío idempotente y bandeja protegida de borradores/leads.
- El catálogo de producción sale de las 91 fichas tipadas del sitio; no se
  parsea el PDF ni se inventan precios, existencias o tiempos de entrega.
- Documenté instalación y activación en `../whatsapp-closer-agentkit/ESTERIPAC.md`
  y el backend quedó en el commit `10e32ac`.

**Qué necesitas saber**

- El modo inicial es `borrador`: ningún mensaje se envía sin aprobación en el
  panel. El modo automático queda bloqueado hasta validar conversaciones y
  aprobar el playbook comercial.
- Falta crear el GitHub propio del backend, configurar Meta/Coexistence y
  Railway/PostgreSQL, cargar los secretos directamente allí, registrar el
  webhook y decidir el canal interno de escalaciones.
- La auditoría estructural pasó 22 controles; su compuerta temporal cortó la
  suite al superar 120 s en Windows y el censo quedó obsoleto tras las últimas
  pruebas. No es un fallo funcional, pero debe regenerarse antes de publicar.
- El carril queda libre.

**Estado de verificación**

- Backend: `pytest pruebas -q` → 256/256 aprobadas; prueba focal posterior de
  idempotencia y catálogo → 11/11; `compileall` → OK.
- Sitio: `npm test` → 14/14; `npm run build` → OK.

### 2026-09-04 · Traspaso de Fase 3 verificado

**Qué hice**

- Leí completos `AGENTS.md`, `context/README.md`, `context/proyecto.md` y
  `context/de-claude.md`, en el orden solicitado.
- Revisé `package.json` y confirmé el estado del sitio y del blueprint hermano
  `whatsapp-closer-agentkit` documentado por Claude.
- No cambié código; esta entrada es el único cambio de la tanda.

**Qué necesitas saber**

- Fase 1 continúa sana. Fase 3 vive en un repositorio hermano y usa Railway;
  el catálogo ya se exportó a su base de conocimiento.
- Siguen pendientes el proveedor de WhatsApp, la migración del número,
  `ANTHROPIC_API_KEY` y el playbook comercial real de Esteripac.
- El carril queda libre.

**Estado de verificación**

- `npm test` → 14/14 pruebas aprobadas.
- `npm run build` → OK (Prettier, TypeScript y Vite; JS 91.10 kB gzip).

### 2026-09-04 · Traspaso inicial verificado

**Qué hice**

- Leí completos `AGENTS.md`, `context/README.md`, `context/proyecto.md` y
  `context/de-claude.md`, en el orden solicitado.
- No cambié código ni archivos de producto; esta entrada es el único cambio.

**Qué necesitas saber**

- El contexto es consistente y no encontré ambigüedades nuevas. Quedaron
  identificados los pendientes del cliente y las reglas del pipeline de datos.
- El carril queda libre.

**Estado de verificación**

- `npm test` → 14/14 pruebas aprobadas.
- `npm run build` → OK (`tsc --noEmit` y Vite; JS 91.10 kB gzip).

### Plantilla sugerida

```markdown
### AAAA-MM-DD · Título corto de la tanda

**Qué hice**
- Cambio concreto, con la ruta del archivo.

**Qué necesitas saber**
- Decisiones que condicionan tu trabajo, supuestos que tomé, cosas a medias.

**Estado de verificación**
- `npm test` → 14/14 · `npm run build` → OK
```
