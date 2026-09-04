# Esteripac — instrucciones para Codex

**Lee `context/proyecto.md` completo antes de tocar código.** Es la fuente
única de verdad de este proyecto y la comparto con Claude Code, que trabaja el mismo
repositorio. Lee también `context/de-claude.md` para saber qué hizo desde tu último
turno. Si cambias algo estructural, actualiza `context/proyecto.md` en el mismo
turno.

Lo mínimo que no puedes ignorar, aunque no leas nada más:

1. **No inventes datos de producto.** SKU, precios, condiciones y normas salen
   del catálogo real o no existen. `npm test` falla si inventas un SKU.
2. **No copies los párrafos de marketing del PDF de Terragene.** Los datos
   técnicos son hechos y se usan tal cual; las descripciones se redactan con voz
   propia de Esteripac.
3. **Sin precios públicos y sin carrito** en la fase 1. La venta es consultiva.
4. **El contacto apunta siempre al agente de IA de WhatsApp**, nunca a "hablar
   con un asesor" como flujo por defecto. Solo `src/lib/whatsapp.ts` arma
   enlaces `wa.me`.
5. **No auto-parsees las especificaciones del PDF.** Está maquetado a varias
   columnas y produce datos silenciosamente equivocados. Ver `context/proyecto.md` §5.
6. Antes de dar algo por terminado: `npm test && npm run build`, y **cierra con
   un commit** con `[claude]` o `[codex]` en el mensaje.
7. **No cambies `.prettierrc.json`.** El formato está fijado para que las dos
   herramientas no se reescriban el código mutuamente. Si el build falla por
   formato, corre `npm run format`.

Hay hechos ya verificados contra el PDF renderizado en `context/proyecto.md` §6 (sellos
FDA, matriz de compatibilidad, colores de `IT28`, cruce `CG3`/`IC10/20`). El
texto plano del PDF engaña: no los "corrijas" sin releer el catálogo.

Al terminar cualquier tanda, deja una entrada en `context/de-codex.md` — es tu
bitácora y el otro agente la lee para saber qué cambiaste. **Nunca escribas en
la bitácora del otro.** Anota tu carril de trabajo al inicio de ese mismo
archivo antes de empezar, y bórralo al terminar.
