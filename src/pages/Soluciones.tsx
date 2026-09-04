import { Link } from 'react-router-dom';
import { FAMILIES, getProcessesOfFamily } from '@/data/processes';
import { getProductsByFamily, getProductsByProcess } from '@/lib/catalog';
import { routes } from '@/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Container, LinkButton, Section, SectionHeading } from '@/components/ui';

/** Entrada al portafolio por proceso: la navegación principal del sitio. */
export function Soluciones() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs items={[{ label: 'Inicio', to: routes.home() }, { label: 'Soluciones' }]} />
      </Container>

      <Section>
        <SectionHeading
          eyebrow="Portafolio"
          title="Soluciones por proceso"
          lead="El portafolio está organizado por el problema que resuelve cada línea. Elija el proceso que necesita controlar y llegue a las referencias que le corresponden."
        />
      </Section>

      {FAMILIES.map((family, index) => {
        const processes = getProcessesOfFamily(family.slug);
        const total = getProductsByFamily(family.slug).length;

        return (
          <Section key={family.slug} tone={index % 2 === 0 ? 'mist' : 'white'}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow={`${total} referencias`} title={family.name} lead={family.summary} />
              <LinkButton to={routes.familia(family.slug)} tone="secondary">
                Ver la línea completa
              </LinkButton>
            </div>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {processes.map((process) => {
                const count = getProductsByProcess(process.slug).length;
                return (
                  <li key={process.slug} className="relative">
                    <article className="flex h-full flex-col border border-navy-100 bg-white p-5 transition-colors hover:border-navy-300">
                      <h3 className="font-display text-base font-semibold text-navy-900">
                        <Link
                          to={routes.proceso(family.slug, process.slug)}
                          className="after:absolute after:inset-0"
                        >
                          {process.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-[13px] text-navy-500">{process.summary}</p>
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {process.variables.map((variable) => (
                          <li
                            key={variable}
                            className="rounded-sm bg-navy-50 px-2 py-0.5 text-[12px] text-navy-600"
                          >
                            {variable}
                          </li>
                        ))}
                      </ul>
                      <p className="tabular mt-4 pt-2 text-[13px] font-semibold text-navy-700">
                        {count} {count === 1 ? 'referencia' : 'referencias'}
                      </p>
                    </article>
                  </li>
                );
              })}
            </ul>
          </Section>
        );
      })}
    </>
  );
}
