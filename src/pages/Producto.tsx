import { Link, Navigate, useParams } from 'react-router-dom';
import { getFamily, getProcess } from '@/data/processes';
import { getIndicatorsForDevice, getProduct, getRelated } from '@/lib/catalog';
import { agentUrl } from '@/lib/whatsapp';
import { routes } from '@/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProductSpecSheet } from '@/components/product/ProductSpecSheet';
import { PricingNote, ProductActions } from '@/components/product/ProductActions';
import { ProductCard } from '@/components/catalog/ProductCard';
import { WhatsAppIcon } from '@/components/layout/Header';
import { Badge, BadgeFDA, Container, ExternalButton, Section } from '@/components/ui';

/**
 * Ficha de producto. Una sola plantilla para las 91 entradas del catálogo.
 *
 * En móvil abre con nombre, SKU, sellos y la acción del asistente fija al borde
 * inferior: la consulta ocurre dentro de la institución, con el celular en la
 * mano y el proceso en curso.
 */
export function Producto() {
  const { slug } = useParams();
  const product = getProduct(slug);

  if (!product) return <Navigate to={routes.catalogo()} replace />;

  const primaryProcess = product.processes[0];
  const process = primaryProcess ? getProcess(primaryProcess) : undefined;
  const family = process ? getFamily(process.family) : undefined;
  const related = getRelated(product);

  // Relación inversa: en la ficha de un equipo interesa qué indicadores acepta.
  const acceptedIndicators = getIndicatorsForDevice(product.slug);

  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: 'Inicio', to: routes.home() },
            { label: 'Catálogo', to: routes.catalogo() },
            ...(family && process
              ? [
                  { label: family.name, to: routes.familia(family.slug) },
                  { label: process.name, to: routes.proceso(family.slug, process.slug) },
                ]
              : []),
            { label: product.skus[0] ?? product.name },
          ]}
        />
      </Container>

      <Container className="pb-28 lg:pb-16">
        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <figure className="grid aspect-square place-items-center border border-navy-100 bg-navy-50 p-6">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full w-auto object-contain"
                />
              ) : (
                <figcaption className="px-6 text-center text-sm font-semibold text-navy-400">
                  {product.category}
                  <span className="mt-1 block text-xs font-normal">
                    El catálogo no publica fotografía de esta referencia
                  </span>
                </figcaption>
              )}
            </figure>

            <div className="mt-4 hidden lg:block">
              <ProductActions product={product} />
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <Badge tone="muted">{product.category}</Badge>
              {product.indicatorType && <Badge tone="solid">Tipo {product.indicatorType}</Badge>}
              {product.fdaApproved && <BadgeFDA />}
            </div>

            <h1 className="font-display text-2xl leading-tight font-bold tracking-tight text-navy-900 sm:text-3xl">
              {product.name}
            </h1>

            {product.skus.length > 0 && (
              <p className="tabular mt-2 flex flex-wrap gap-1.5">
                {product.skus.map((sku) => (
                  <code
                    key={sku}
                    className="rounded-sm bg-navy-900 px-2 py-1 font-mono text-[13px] font-semibold text-white"
                  >
                    {sku}
                  </code>
                ))}
              </p>
            )}

            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-navy-700">
              {product.description}
            </p>

            {product.highlights.length > 0 && (
              <ul className="mt-5 space-y-1.5">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2.5 text-[15px] text-navy-800">
                    <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-1 size-4 shrink-0 text-gold-600">
                      <path
                        d="M3.5 8.5 6.5 11.5 12.5 4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {highlight}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 lg:hidden">
              <PricingNote />
            </div>

            <h2 className="mt-10 mb-3 font-display text-lg font-semibold text-navy-900">
              Especificaciones
            </h2>
            <ProductSpecSheet product={product} />

            {acceptedIndicators.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-lg font-semibold text-navy-900">
                  Indicadores que acepta este equipo
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {acceptedIndicators.map((indicator) => (
                    <li key={indicator.slug}>
                      <Link
                        to={routes.producto(indicator.slug)}
                        className="inline-flex items-center gap-2 border border-navy-200 px-2.5 py-1.5 text-[13px] font-medium text-navy-800 transition-colors hover:border-navy-400 hover:bg-navy-50"
                      >
                        <code className="font-mono font-bold">{indicator.skus[0]}</code>
                        {indicator.biological && (
                          <span className="text-navy-500">{indicator.biological.readTime}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="border-t border-navy-100 py-10">
            <h2 className="font-display text-lg font-semibold text-navy-900">
              Productos relacionados
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </section>
        )}
      </Container>

      <Section tone="mist" className="hidden lg:block">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-[15px] text-navy-700">
            ¿Necesita confirmar que esta referencia corresponde a su ciclo? El asistente responde
            con el SKU en contexto.
          </p>
          <ExternalButton href={agentUrl({ sku: product.skus[0], name: product.name })}>
            <WhatsAppIcon />
            Consultar {product.skus[0] ?? 'esta referencia'}
          </ExternalButton>
        </div>
      </Section>

      {/* Barra de acción fija en móvil: la consulta pasa acá, no en el FAB. */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <ProductActions product={product} compact />
      </div>
    </>
  );
}
