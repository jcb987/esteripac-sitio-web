import { Link } from 'react-router-dom';
import type { Product } from '@/data/types';
import { routes } from '@/routes';
import { Badge, cx } from '@/components/ui';

/**
 * Tarjeta de resultado. Prioriza lo que el comprador usa para descartar rápido:
 * SKU, tipo de indicador y sello FDA, en ese orden.
 */
export function ProductCard({ product, className }: { product: Product; className?: string }) {
  return (
    <Link
      to={routes.producto(product.slug)}
      className={cx(
        'group flex gap-4 border border-navy-100 bg-white p-3 transition-colors hover:border-navy-300 sm:flex-col sm:gap-3 sm:p-4',
        className,
      )}
    >
      <div className="grid size-20 shrink-0 place-items-center overflow-hidden bg-navy-50 sm:aspect-4/3 sm:size-auto sm:w-full">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="size-full object-contain p-1.5 transition-transform duration-200 group-hover:scale-[1.03] sm:p-4"
          />
        ) : (
          <span className="px-2 text-center font-display text-xs font-semibold text-navy-400">
            {product.category}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {product.skus[0] && (
            <code className="tabular font-mono text-[12px] font-bold text-navy-900">
              {product.skus[0]}
            </code>
          )}
          {product.indicatorType && <Badge tone="muted">Tipo {product.indicatorType}</Badge>}
          {product.fdaApproved && <Badge tone="gold">FDA</Badge>}
        </div>

        <h3 className="font-display text-[15px] leading-snug font-semibold text-navy-900 group-hover:underline group-hover:decoration-gold-500 group-hover:underline-offset-4">
          {product.name}
        </h3>

        <p className="mt-1 text-[13px] text-navy-500">
          {product.brand ? `${product.brand}® · ` : ''}
          {product.category}
        </p>

        {product.biological && (
          <p className="mt-auto pt-2 text-[13px] font-medium text-navy-700">
            Lectura en {product.biological.readTime}
          </p>
        )}
      </div>
    </Link>
  );
}
