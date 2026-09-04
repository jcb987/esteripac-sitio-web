import { agentUrl } from '@/lib/whatsapp';
import { WhatsAppIcon } from './Header';

/**
 * Acceso permanente al asistente.
 *
 * Se oculta en la ficha de producto, donde la acción vive en una barra fija
 * propia con el SKU en contexto: dos botones flotantes compitiendo en un
 * viewport de 375px es ruido, no ayuda.
 */
export function WhatsAppFab({ hidden = false }: { hidden?: boolean }) {
  if (hidden) return null;

  return (
    <a
      href={agentUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-4 z-30 inline-flex items-center gap-2 rounded-sm bg-gold-500 px-4 py-3 text-sm font-semibold text-navy-950 shadow-lg shadow-navy-900/20 transition-colors hover:bg-gold-300"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <WhatsAppIcon className="size-5" />
      <span className="hidden sm:inline">Asistente técnico</span>
      <span className="sr-only sm:hidden">Abrir el asistente técnico por WhatsApp</span>
    </a>
  );
}
