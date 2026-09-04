# Prompts de arranque

Para pegar en la herramienta al abrir una sesión. Se mantienen cortos a
propósito: el contexto vive en los archivos de esta carpeta, no en el prompt.
Si el prompt duplicara el contexto, en dos semanas dirían cosas distintas.

---

## Codex — primer contacto

```
Vas a trabajar en el proyecto que está en esta carpeta: el sitio web de
Esteripac S.A.S. Lo comparto contigo y con Claude Code, que ya construyó la
fase 1.

Antes de escribir una sola línea de código, lee en este orden:

1. AGENTS.md (raíz) — tus reglas, cortas.
2. context/README.md — cómo nos coordinamos los dos agentes.
3. context/proyecto.md — la especificación completa del proyecto. Presta
   atención especial a §5 (pipeline de datos) y §6 (hechos verificados).
4. context/de-claude.md — la bitácora de Claude Code: qué construyó, qué
   errores ya encontró y corrigió, y qué trampas tiene este entorno.

Después corre `npm test && npm run build` para confirmar que el proyecto está
sano de tu lado.

En este primer turno NO cambies código. Respóndeme con:

- Qué es el proyecto y quién es el comprador, en tus palabras.
- Qué está construido y qué falta.
- Las reglas que no puedes romper.
- Los hechos ya verificados que no debes "corregir".
- El resultado de las pruebas y el build.
- Cualquier cosa del contexto que te haya quedado ambigua o incompleta.

Si el traspaso quedó bien, escribe tu primera entrada en context/de-codex.md y
ciérrala con un commit: git add -A && git commit -m "[codex] ...".
Nunca escribas en context/de-claude.md: ese archivo es solo de Claude Code.
```

El último punto es el que más valor tiene: pedirle que declare lo que le quedó
ambiguo detecta huecos del contexto cuando corregirlos es barato.

---

## Codex — sesiones siguientes

```
Lee context/de-claude.md (por si Claude Code cambió algo desde tu último
turno) y tu propia bitácora context/de-codex.md para retomar dónde quedaste.
Luego: <la tarea>
```

---

## Asignar una tarea

Sirve igual para cualquiera de los dos agentes, cambiando el nombre del archivo
de bitácora y la etiqueta del commit.

```
Tarea: <qué necesito>

Carril: <src/data y scripts | src/components y src/pages | src/lib y config>

Antes de empezar, anota tu carril al inicio de context/de-codex.md y verifica
que Claude Code no tenga anotado el mismo. Al terminar:
- `npm test && npm run build` deben pasar
- deja una entrada en context/de-codex.md con qué cambiaste y qué debo saber
- commit con [codex] en el mensaje
```

---

## Claude Code — sesiones

Claude Code lee `CLAUDE.md` solo al arrancar, así que basta con:

```
Lee context/de-codex.md para ver qué cambió Codex desde mi último turno.
Luego: <la tarea>
```
