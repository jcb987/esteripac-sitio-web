import type { Product } from '@/data/types';
import { useAuth } from '@/features/account/AuthContext';
import { agentUrl } from '@/lib/whatsapp';
import { ExternalButton, LinkButton } from '@/components/ui';
import { WhatsAppIcon } from '@/components/layout/Header';
import { routes } from '@/routes';

/**
 * Único punto donde la ficha ofrece una acción sobre el producto.
 *
 * Hoy la acción es consultar con el asistente. Cuando exista el portal, acá
 * entra "Agregar a recompra" bajo `isAuthenticated`, y el precio ocupa el lugar
 * que hoy tiene el aviso de consulta asistida. La bifurcación ya está escrita:
 * no hay que buscarla por todo el proyecto.
 */
export function ProductActions({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const { isAuthenticated } = useAuth();

  // En la barra fija de móvil el alto es presupuesto: una sola fila de acción.
  // La nota sobre precios vive en el cuerpo de la ficha, no acá.
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <ExternalButton
          href={agentUrl({ sku: product.skus[0], name: product.name })}
          className="flex-1"
        >
          <WhatsAppIcon />
          Consultar {product.skus[0] ?? 'esta referencia'}
        </ExternalButton>
        <LinkButton to={routes.conviertaseEnCliente()} tone="secondary" className="shrink-0 px-3">
          Cuenta
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isAuthenticated ? null : <PricingNote />}

      {/* Siempre apilados: esta variante vive en la barra lateral estrecha de
          la ficha, donde dos botones en fila parten las etiquetas. */}
      <div className="flex flex-col gap-2">
        <ExternalButton href={agentUrl({ sku: product.skus[0], name: product.name })}>
          <WhatsAppIcon />
          Consultar con el asistente
        </ExternalButton>
        <LinkButton to={routes.conviertaseEnCliente()} tone="secondary">
          Abrir cuenta institucional
        </LinkButton>
      </div>
    </div>
  );
}

/** Por qué no hay un precio en pantalla. La fase 2 lo reemplaza por el precio. */
export function PricingNote() {
  return (
    <p className="text-[13px] leading-relaxed text-navy-500">
      Esteripac no publica precios: cada referencia se cotiza según el proceso, el volumen y la
      frecuencia de consumo de la institución.
    </p>
  );
}
