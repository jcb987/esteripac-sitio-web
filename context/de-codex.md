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
