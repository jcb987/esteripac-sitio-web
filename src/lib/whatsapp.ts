import { WHATSAPP_AGENT, SITE } from '@/config/site';

export interface AgentContext {
  /** SKU consultado, si la consulta nace de una ficha de producto. */
  sku?: string;
  /** Nombre del producto o del proceso. */
  name?: string;
  /** Página o sección desde donde se abre la conversación. */
  page?: string;
}

/**
 * Construye el enlace al asistente de Esteripac en WhatsApp con el mensaje ya
 * redactado. Es el único punto del proyecto que arma una URL de wa.me: el
 * número, el encuadre del mensaje y el tono se cambian acá y en ningún otro
 * lado. En la fase 2 este enlace pasa a resolver contra el agente de IA real.
 */
export function agentUrl(ctx: AgentContext = {}): string {
  const text = buildMessage(ctx);
  return `https://wa.me/${WHATSAPP_AGENT}?text=${encodeURIComponent(text)}`;
}

function buildMessage({ sku, name, page }: AgentContext): string {
  const apertura = `Hola, escribo desde el sitio de ${SITE.shortName}.`;

  if (sku && name) return `${apertura} Necesito información sobre ${sku} — ${name}.`;
  if (sku) return `${apertura} Necesito información sobre la referencia ${sku}.`;
  if (name) return `${apertura} Tengo una consulta sobre ${name}.`;
  if (page) return `${apertura} Tengo una consulta desde la sección de ${page}.`;

  return `${apertura} Necesito ayuda para elegir el control adecuado para mi proceso.`;
}
