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

## Antes de dar algo por terminado

```bash
npm test && npm run build
```

Y deja tu entrada en tu bitácora. Un cambio sin registrar es un cambio que el
otro agente va a descubrir de la peor forma.
