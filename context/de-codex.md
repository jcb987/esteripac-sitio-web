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

**Fase 3/backend:** construcción del agente en
`../whatsapp-closer-agentkit` (Meta Cloud API, Railway y Claude Haiku 4.5).

---

## Entradas

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
