import { Link } from 'react-router-dom';
import type { Product } from '@/data/types';
import { processName } from '@/data/processes';
import { getCompatibleDevices, getRelated } from '@/lib/catalog';
import { routes } from '@/routes';
import { Badge, BadgeFDA, cx } from '@/components/ui';
import { ColorShift } from './ColorShift';
import type { ReactNode } from 'react';

/**
 * La plantilla única de especificaciones.
 *
 * Las 91 entradas del catálogo se renderizan por acá, en este orden y sin
 * excepciones. Los bloques que no aplican se ocultan, pero los que sí aparecen
 * conservan siempre la misma posición relativa: comparar dos referencias nunca
 * obliga a cambiar de estructura mental.
 *
 * `SpecRow` es el único componente que dibuja una fila, así que la consistencia
 * es estructural y no depende de que quien agregue un producto se acuerde.
 */
export function ProductSpecSheet({ product }: { product: Product }) {
  const devices = getCompatibleDevices(product);
  const related = getRelated(product);

  return (
    <dl className="divide-y divide-navy-100 border-y border-navy-100">
      <SpecRow label="SKU">
        {product.skus.length > 0 ? (
          <span className="flex flex-wrap gap-1.5">
            {product.skus.map((sku) => (
              <code
                key={sku}
                className="rounded-sm bg-navy-50 px-1.5 py-0.5 font-mono text-[13px] font-semibold text-navy-900"
              >
                {sku}
              </code>
            ))}
          </span>
        ) : (
          <Unavailable>No aplica — es una solución de software, no una referencia de inventario</Unavailable>
        )}
      </SpecRow>

      <SpecRow label="Marca">{product.brand ? `${product.brand}®` : <Unavailable />}</SpecRow>

      <SpecRow label="Categoría">{product.category}</SpecRow>

      <SpecRow label="Proceso">
        <span className="flex flex-wrap gap-1.5">
          {product.processes.map((process) => (
            <Badge key={process} tone="muted">
              {processName(process)}
            </Badge>
          ))}
        </span>
      </SpecRow>

      <SpecRow label="Tipo de indicador">
        {product.indicatorType ? (
          <span className="flex items-center gap-2">
            <Badge tone="solid">Tipo {product.indicatorType}</Badge>
            <span className="text-navy-500">según ISO 11140</span>
          </span>
        ) : (
          <Unavailable>No aplica a esta categoría</Unavailable>
        )}
      </SpecRow>

      {product.colorShift && (
        <SpecRow label="Viraje de color">
          <ColorShift shift={product.colorShift} />
        </SpecRow>
      )}

      <SpecRow label="Condiciones de uso">
        {product.conditions ? <List items={product.conditions} /> : <Consultar />}
      </SpecRow>

      {product.challengeLevel && (
        <SpecRow label="Nivel de desafío">
          <Badge tone="outline">{product.challengeLevel}</Badge>
        </SpecRow>
      )}

      {product.biological && (
        <SpecRow label="Datos biológicos">
          <ul className="space-y-1">
            <li>
              <span className="text-navy-500">Microorganismo: </span>
              <em className="not-italic">{product.biological.microorganism}</em>
            </li>
            <li>
              <span className="text-navy-500">Población: </span>
              {product.biological.population}
            </li>
            <li>
              <span className="text-navy-500">Tiempo de lectura: </span>
              <strong className="font-semibold text-navy-900">{product.biological.readTime}</strong>
            </li>
          </ul>
        </SpecRow>
      )}

      <SpecRow label="Conformidad normativa">
        {product.compliance.length > 0 ? (
          <span className="flex flex-wrap gap-1.5">
            {product.compliance.map((norm) => (
              <Badge key={norm} tone="outline">
                {norm}
              </Badge>
            ))}
          </span>
        ) : (
          <Consultar />
        )}
      </SpecRow>

      <SpecRow label="Aprobado por FDA">
        {product.fdaApproved ? (
          <BadgeFDA />
        ) : (
          <Unavailable>El catálogo no declara aprobación FDA para esta referencia</Unavailable>
        )}
      </SpecRow>

      <SpecRow label="Dispositivos compatibles">
        {devices.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {devices.map((device) => (
              <li key={device.slug}>
                <Link
                  to={routes.producto(device.slug)}
                  className="inline-flex items-center gap-2 rounded-sm border border-navy-200 py-1 pr-2.5 pl-1 transition-colors hover:border-navy-400 hover:bg-navy-50"
                >
                  <DeviceThumb product={device} />
                  <span className="text-[13px] font-medium text-navy-800">{device.name.split(' para ')[0]}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Unavailable>No requiere equipo de lectura</Unavailable>
        )}
      </SpecRow>

      <SpecRow label="Presentación">{product.presentation ?? <Consultar />}</SpecRow>

      <SpecRow label="Productos relacionados">
        {related.length > 0 ? (
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  to={routes.producto(item.slug)}
                  className="text-[13px] font-medium text-navy-700 underline decoration-navy-300 underline-offset-4 hover:text-navy-900 hover:decoration-gold-500"
                >
                  {item.skus[0] ?? item.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Unavailable />
        )}
      </SpecRow>

      <SpecRow label="Documentación descargable">
        {product.documents.length > 0 ? (
          <ul className="space-y-1">
            {product.documents.map((doc) => (
              <li key={doc.label}>
                {doc.href ? (
                  <a href={doc.href} className="font-medium text-navy-800 underline underline-offset-4">
                    {doc.label}
                  </a>
                ) : (
                  <span>
                    {doc.label} <span className="text-navy-500">— disponible a solicitud</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Unavailable>
            Instructivo de uso y certificados disponibles a solicitud del cliente
          </Unavailable>
        )}
      </SpecRow>
    </dl>
  );
}

// ---------------------------------------------------------------------------

/** La única fila de especificación del proyecto. */
export function SpecRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="tabular grid gap-1 py-3 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-6 sm:py-3.5">
      <dt className="text-[13px] font-semibold text-navy-500 sm:pt-0.5">{label}</dt>
      <dd className="min-w-0 text-[15px] text-navy-800">{children}</dd>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  if (items.length === 1) return <>{items[0]}</>;
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-navy-300" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** El catálogo del fabricante no publica el dato. No se completa por analogía. */
function Consultar() {
  return <span className="text-navy-500">Consultar</span>;
}

function Unavailable({ children }: { children?: ReactNode }) {
  return (
    <span className="text-navy-400">
      {children ?? <span aria-label="Sin datos">—</span>}
    </span>
  );
}

function DeviceThumb({ product }: { product: Product }) {
  return (
    <span
      className={cx(
        'grid size-9 shrink-0 place-items-center overflow-hidden rounded-sm bg-navy-50',
      )}
    >
      {product.image ? (
        <img src={product.image} alt="" loading="lazy" className="size-full object-contain" />
      ) : (
        <span className="text-[10px] font-bold text-navy-400">{product.skus[0]?.slice(0, 3)}</span>
      )}
    </span>
  );
}
