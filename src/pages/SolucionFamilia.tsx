import { Navigate, useParams } from 'react-router-dom';
import { getFamily, getProcessesOfFamily } from '@/data/processes';
import { getProductsByFamily, getProductsByProcess } from '@/lib/catalog';
import { agentUrl } from '@/lib/whatsapp';
import { routes } from '@/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProductCard } from '@/components/catalog/ProductCard';
import { WhatsAppIcon } from '@/components/layout/Header';
import { Container, ExternalButton, LinkButton, Section, SectionHeading } from '@/components/ui';

/** Una familia completa, con cada uno de sus procesos como sección. */
export function SolucionFamilia() {
  const { familia } = useParams();
  const family = getFamily(familia ?? '');

  if (!family) return <Navigate to={routes.soluciones()} replace />;

  const processes = getProcessesOfFamily(family.slug);
  const total = getProductsByFamily(family.slug).length;

  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: 'Inicio', to: routes.home() },
            { label: 'Soluciones', to: routes.soluciones() },
            { label: family.name },
          ]}
        />
      </Container>

      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow={`${total} referencias`}
            title={family.name}
            lead={family.summary}
          />
          <ExternalButton href={agentUrl({ name: family.name })}>
            <WhatsAppIcon />
            ¿No sabe cuál necesita?
          </ExternalButton>
        </div>
      </Section>

      {processes.map((process, index) => {
        const products = getProductsByProcess(process.slug);
        return (
          <Section key={process.slug} tone={index % 2 === 0 ? 'mist' : 'white'}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow={process.summary} title={process.name} lead={process.intro} />
              <LinkButton to={routes.proceso(family.slug, process.slug)} tone="secondary">
                Ver el proceso
              </LinkButton>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>

            {products.length > 8 && (
              <p className="tabular mt-4 text-sm text-navy-600">
                {products.length - 8} referencias más en{' '}
                <LinkButton
                  to={routes.proceso(family.slug, process.slug)}
                  tone="ghost"
                  className="px-1 py-0 underline underline-offset-4"
                >
                  {process.name}
                </LinkButton>
              </p>
            )}
          </Section>
        );
      })}
    </>
  );
}
