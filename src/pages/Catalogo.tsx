import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PROCESSES } from '@/data/processes';
import type { Brand, IndicatorType, ProcessSlug } from '@/data/types';
import { getFilterOptions, searchProducts, type CatalogFilters } from '@/lib/catalog';
import { agentUrl } from '@/lib/whatsapp';
import { routes } from '@/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProductCard } from '@/components/catalog/ProductCard';
import { WhatsAppIcon } from '@/components/layout/Header';
import { Badge, Button, Container, ExternalButton, Section, SectionHeading } from '@/components/ui';

/**
 * Catálogo consultivo: búsqueda por SKU o nombre y filtros por proceso, marca,
 * tipo de indicador y categoría. Sin precios y sin carrito, por decisión del
 * negocio.
 *
 * El estado vive en la querystring y no en useState: un coordinador de central
 * puede mandar por WhatsApp el enlace ya filtrado y quien lo abre ve lo mismo.
 */
export function Catalogo() {
  const [params, setParams] = useSearchParams();

  const filters: CatalogFilters = {
    q: params.get('q') ?? '',
    proceso: (params.get('proceso') ?? '') as ProcessSlug | '',
    marca: (params.get('marca') ?? '') as Brand | '',
    tipo: params.get('tipo') ? (Number(params.get('tipo')) as IndicatorType) : '',
    categoria: params.get('categoria') ?? '',
  };

  const results = useMemo(() => searchProducts(filters), [params]); // eslint-disable-line react-hooks/exhaustive-deps
  const options = useMemo(() => getFilterOptions(), []);

  function update(key: keyof CatalogFilters, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  const activeCount = ['proceso', 'marca', 'tipo', 'categoria'].filter((key) =>
    params.get(key),
  ).length;

  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[{ label: 'Inicio', to: routes.home() }, { label: 'Catálogo técnico' }]}
        />
      </Container>

      <Section className="pb-6 sm:pb-8">
        <SectionHeading
          eyebrow="Catálogo técnico"
          title="Busque por referencia o filtre por proceso"
          lead="Escriba el SKU tal como aparece en la caja o el nombre del producto. Los precios no son públicos: cada referencia se cotiza según el proceso y el consumo de la institución."
        />

        <div className="mt-6">
          <label htmlFor="buscador" className="sr-only">
            Buscar por SKU o nombre
          </label>
          <div className="relative">
            <SearchIcon />
            <input
              id="buscador"
              type="search"
              inputMode="search"
              autoComplete="off"
              placeholder="BT225, KH2X15-3.5Y/P, integrador para vapor…"
              value={filters.q}
              onChange={(event) => update('q', event.target.value)}
              className="w-full border border-navy-200 bg-white py-3 pr-3 pl-10 text-[15px] text-navy-900 placeholder:text-navy-400 focus:border-navy-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Proceso"
            value={filters.proceso ?? ''}
            onChange={(value) => update('proceso', value)}
            options={PROCESSES.map((process) => [process.slug, process.name])}
          />
          <Select
            label="Marca"
            value={filters.marca ?? ''}
            onChange={(value) => update('marca', value)}
            options={options.brands.map((brand) => [brand, `${brand}®`])}
          />
          <Select
            label="Tipo de indicador"
            value={filters.tipo ? String(filters.tipo) : ''}
            onChange={(value) => update('tipo', value)}
            options={options.types.map((type) => [String(type), `Tipo ${type} (ISO 11140)`])}
          />
          <Select
            label="Categoría"
            value={filters.categoria ?? ''}
            onChange={(value) => update('categoria', value)}
            options={options.categories.map((category) => [category, category])}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="tabular text-sm text-navy-600">
            <strong className="font-semibold text-navy-900">{results.length}</strong>{' '}
            {results.length === 1 ? 'referencia' : 'referencias'}
            {activeCount > 0 && ` · ${activeCount} ${activeCount === 1 ? 'filtro' : 'filtros'}`}
          </p>
          {(activeCount > 0 || filters.q) && (
            <Button tone="ghost" className="px-2 py-1 text-[13px]" onClick={() => setParams({})}>
              Limpiar todo
            </Button>
          )}
        </div>
      </Section>

      <Section tone="mist" className="pt-0 sm:pt-0">
        {results.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState query={filters.q ?? ''} />
        )}
      </Section>
    </>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold tracking-wide text-navy-500 uppercase">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-navy-200 bg-white px-3 py-2.5 text-sm text-navy-900 focus:border-navy-500 focus:outline-none"
      >
        <option value="">Todos</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="border border-navy-200 border-dashed bg-white p-8 text-center">
      <h2 className="font-display text-lg font-semibold text-navy-900">
        No hay referencias que coincidan
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-navy-600">
        {query ? (
          <>
            Ninguna referencia del catálogo coincide con <Badge tone="muted">{query}</Badge>. Puede
            que el producto exista bajo otro SKU o que corresponda a una línea que aún no está
            publicada.
          </>
        ) : (
          'Pruebe con menos filtros: la combinación actual no devuelve referencias.'
        )}
      </p>
      <ExternalButton
        href={agentUrl({
          name: query ? `la referencia ${query}` : 'una búsqueda en el catálogo',
          page: 'el catálogo técnico',
        })}
        className="mt-5"
      >
        <WhatsAppIcon />
        Consultarlo con el asistente
      </ExternalButton>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-navy-400"
    >
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
