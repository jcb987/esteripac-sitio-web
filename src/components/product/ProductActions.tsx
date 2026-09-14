import type { Product } from '@/data/types';
import { fichaTecnicaPdfPara } from '@/data/fichas-tecnicas';
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
  const fichaTecnicaPdf = fichaTecnicaPdfPara(product.skus);

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
        {fichaTecnicaPdf && (
          <ExternalButton
            href={fichaTecnicaPdf}
            tone="secondary"
            className="shrink-0 px-3"
            aria-label="Descargar ficha técnica (PDF)"
            title="Descargar ficha técnica (PDF)"
          >
            <PdfIcon />
            <span className="sr-only">Descargar ficha técnica (PDF)</span>
          </ExternalButton>
        )}
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
        {fichaTecnicaPdf && (
          <ExternalButton href={fichaTecnicaPdf} tone="secondary">
            <PdfIcon />
            Descargar ficha técnica (PDF)
          </ExternalButton>
        )}
      </div>
    </div>
  );
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5 shrink-0">
      <path
        d="M6 2.5h5l3 3v12H6zM11 2.5v3h3M10 8v6m0 0-2.5-2.5M10 14l2.5-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
