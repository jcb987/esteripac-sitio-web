# Carpeta de contexto

Punto de encuentro entre los dos agentes que trabajan este repositorio.

| Archivo | Quién escribe | Quién lee | Para qué |
|---|---|---|---|
| `proyecto.md` | Ambos, solo si cambia la estructura | Ambos | Especificación estable del proyecto |
| `de-claude.md` | **Solo Claude Code** | Codex | Qué hizo Claude y qué debe saber Codex |
| `de-codex.md` | **Solo Codex** | Claude Code | Qué hizo Codex y qué debe saber Claude |
| `prompts.md` | Ambos | El humano | Prompts para abrir sesión en cada herramienta |

**La regla es una sola: nunca escribas en la bitácora del otro.** Ningún
archivo tiene dos escritores, así que no hay forma de que uno pise al otro.

Si necesitas responderle algo al otro agente, lo escribes en tu propia
bitácora. Él la lee al empezar su turno.

## Orden de lectura al empezar una sesión

1. `proyecto.md` — cómo es el proyecto.
2. La bitácora del otro agente — qué pasó desde tu último turno.
3. Tu propia bitácora — dónde quedaste.

## El carril activo es el traspaso, no un post-it

**Escríbelo ANTES de empezar y actualízalo cada vez que tomes una decisión.**
No al terminar.

La razón es concreta: una sesión se puede cortar por límite de contexto en
cualquier momento, y cuando eso pasa no queda presupuesto para escribir la
entrada de bitácora. Ya ocurrió tres veces en este proyecto. La entrada
detallada es lo primero que se pierde; el carril, si está actualizado,
sobrevive y alcanza para retomar.

Un carril útil trae qué estás haciendo, **qué decisiones ya tomaste**, y dónde
vas:

```markdown
**Fase 3/backend:** construcción del agente en `../whatsapp-closer-agentkit`
(Meta Cloud API, Railway y Claude Haiku 4.5).
```

Ese ejemplo es real: es lo único que sobrevivió a un corte de sesión, y con
esas tres decisiones el otro agente pudo continuar sin perder trabajo.

**Commitea seguido, no solo al final.** Por la misma razón: el commit es el
registro que no depende de que te queden tokens. Trabajo en disco sin
commitear es trabajo que el otro agente no sabe que existe.

Al cerrar la tanda, el carril se convierte en la entrada de bitácora y se
borra.

## Antes de dar algo por terminado

```bash
npm test && npm run build
```

Y deja tu entrada en tu bitácora. Un cambio sin registrar es un cambio que el
otro agente va a descubrir de la peor forma.
