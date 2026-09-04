import { Navigate, useParams } from 'react-router-dom';
import { getFamily, getProcess } from '@/data/processes';
import { getProductsByProcess } from '@/lib/catalog';
import { agentUrl } from '@/lib/whatsapp';
import { routes } from '@/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProductCard } from '@/components/catalog/ProductCard';
import { WhatsAppIcon } from '@/components/layout/Header';
import type { Product } from '@/data/types';
import { Container, ExternalButton, LinkButton, Section, SectionHeading } from '@/components/ui';

/**
 * Un proceso con todas sus referencias, agrupadas por categoría.
 *
 * El orden de las categorías sigue el orden en que se arma el control: primero
 * lo que va dentro del paquete, después el desafío, después la evidencia
 * biológica y por último el equipamiento.
 */
const CATEGORY_ORDER = [
  'Indicador químico',
  'Control de limpieza',
  'Monitoreo de higiene',
  'Dispositivo de Desafío de Proceso',
  'Indicador biológico',
  'Auto-lectora',
  'Incubadora',
  'Etiquetadora',
  'Solución digital',
  'Accesorio',
];

export function SolucionProceso() {
  const { familia, proceso } = useParams();
  const family = getFamily(familia ?? '');
  const process = getProcess(proceso ?? '');

  if (!family || !process) return <Navigate to={routes.soluciones()} replace />;

  const groups = groupByCategory(getProductsByProcess(process.slug));

  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[
            { label: 'Inicio', to: routes.home() },
            { label: 'Soluciones', to: routes.soluciones() },
            { label: family.name, to: routes.familia(family.slug) },
            { label: process.name },
          ]}
        />
      </Container>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
          <SectionHeading eyebrow={family.name} title={process.name} lead={process.intro} />

          <aside className="h-fit border border-navy-100 bg-navy-50 p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-navy-500 uppercase">
              Variables a monitorear
            </p>
            <ul className="mt-3 space-y-1.5">
              {process.variables.map((variable) => (
                <li key={variable} className="flex gap-2 text-sm text-navy-800">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1 shrink-0 rounded-full bg-gold-500"
                  />
                  {variable}
                </li>
              ))}
            </ul>
            <ExternalButton
              href={agentUrl({ name: `el monitoreo de ${process.name.toLowerCase()}` })}
              className="mt-5 w-full"
            >
              <WhatsAppIcon />
              Pregúntele al asistente
            </ExternalButton>
          </aside>
        </div>
      </Section>

      {groups.map(([category, items], index) => (
        <Section key={category} tone={index % 2 === 0 ? 'mist' : 'white'}>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-navy-900">{category}</h2>
            <p className="tabular text-sm text-navy-500">
              {items.length} {items.length === 1 ? 'referencia' : 'referencias'}
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </Section>
      ))}

      <Section tone="navy">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <SectionHeading
            tone="dark"
            title="¿Necesita comparar dos referencias?"
            lead="Todas las fichas usan la misma plantilla y el mismo orden de campos, así que la comparación es directa. Si prefiere, el asistente le ayuda a elegir según su ciclo."
          />
          <LinkButton
            to={routes.catalogo({ proceso: process.slug })}
            tone="whatsapp"
            className="justify-center"
          >
            Filtrar el catálogo por {process.name.toLowerCase()}
          </LinkButton>
        </div>
      </Section>
    </>
  );
}

function groupByCategory(products: Product[]): Array<[string, Product[]]> {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const list = groups.get(product.category) ?? [];
    list.push(product);
    groups.set(product.category, list);
  }
  return [...groups.entries()].sort(([a], [b]) => indexOfCategory(a) - indexOfCategory(b));
}

function indexOfCategory(category: string): number {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}
