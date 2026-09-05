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

*(libre)*

---

## Entradas

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
