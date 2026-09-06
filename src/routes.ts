import type { FamilySlug, ProcessSlug } from '@/data/types';
import type { CatalogFilters } from '@/lib/catalog';

/**
 * Constructores de rutas. Ningún componente arma un path a mano, de modo que
 * agregar el portal autenticado de la fase 2 bajo /portal no obliga a revisar
 * cada <Link> del proyecto.
 */
export const routes = {
  home: () => '/',
  soluciones: () => '/soluciones',
  familia: (family: FamilySlug) => `/soluciones/${family}`,
  proceso: (family: FamilySlug, process: ProcessSlug) => `/soluciones/${family}/${process}`,
  catalogo: (filters: CatalogFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.proceso) params.set('proceso', filters.proceso);
    if (filters.marca) params.set('marca', filters.marca);
    if (filters.tipo) params.set('tipo', String(filters.tipo));
    if (filters.categoria) params.set('categoria', filters.categoria);
    const query = params.toString();
    return query ? `/catalogo?${query}` : '/catalogo';
  },
  producto: (slug: string) => `/producto/${slug}`,
  conviertaseEnCliente: () => '/conviertase-en-cliente',
  formacion: () => '/formacion',
  contacto: () => '/contacto',
  politicaPrivacidad: () => '/politica-de-privacidad',

  // Reservado para la fase 2. Las rutas del portal cuelgan de acá.
  // portal: () => '/portal',
} as const;
