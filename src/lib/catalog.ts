import { PRODUCTS } from '@/data/products';
import { getProcess } from '@/data/processes';
import type { Brand, FamilySlug, IndicatorType, Product, ProcessSlug } from '@/data/types';
import { normalize, normalizeSku } from './slug';

/**
 * Única puerta de acceso al catálogo.
 *
 * Las páginas nunca importan el arreglo de productos: pasan por acá. Cuando la
 * fase 2 mueva el catálogo detrás de una API autenticada, cambia este archivo y
 * ninguno más.
 */

const bySlug = new Map<string, Product>(PRODUCTS.map((p) => [p.slug, p]));

const bySku = new Map<string, Product>(
  PRODUCTS.flatMap((p) => p.skus.map((sku) => [normalizeSku(sku), p] as const)),
);

export function listProducts(): Product[] {
  return PRODUCTS;
}

export function getProduct(slug: string | undefined): Product | undefined {
  return slug ? bySlug.get(slug) : undefined;
}

/** Resuelve un SKU exacto, tolerando guiones, barras y mayúsculas. */
export function getProductBySku(sku: string): Product | undefined {
  return bySku.get(normalizeSku(sku));
}

export function getProductsByProcess(process: ProcessSlug): Product[] {
  return PRODUCTS.filter((p) => p.processes.includes(process));
}

export function getProductsByFamily(family: FamilySlug): Product[] {
  return PRODUCTS.filter((p) =>
    p.processes.some((process) => getProcess(process)?.family === family),
  );
}

export function getRelated(product: Product): Product[] {
  return product.relatedProducts.flatMap((slug) => {
    const found = bySlug.get(slug);
    return found ? [found] : [];
  });
}

export function getCompatibleDevices(product: Product): Product[] {
  return product.compatibleDevices.flatMap((slug) => {
    const found = bySlug.get(slug);
    return found ? [found] : [];
  });
}

/**
 * Relación inversa: qué indicadores acepta un equipo.
 *
 * La compatibilidad se declara una sola vez, del lado del indicador, así que
 * acá se resuelve al revés en lugar de duplicarla en la ficha del dispositivo.
 */
export function getIndicatorsForDevice(deviceSlug: string): Product[] {
  return PRODUCTS.filter((p) => p.compatibleDevices.includes(deviceSlug));
}

// ---------------------------------------------------------------------------
// Búsqueda y filtros
// ---------------------------------------------------------------------------

export interface CatalogFilters {
  q?: string;
  proceso?: ProcessSlug | '';
  marca?: Brand | '';
  tipo?: IndicatorType | '';
  categoria?: string;
}

/**
 * Busca por SKU o por nombre y aplica los filtros activos.
 *
 * El SKU manda: quien escribe "BT225" o "kh2x15-3.5y/p" está buscando esa
 * referencia y espera verla primero, no un resultado por relevancia textual.
 */
export function searchProducts(filters: CatalogFilters): Product[] {
  const { q = '', proceso, marca, tipo, categoria } = filters;

  let results = PRODUCTS;

  if (proceso) results = results.filter((p) => p.processes.includes(proceso));
  if (marca) results = results.filter((p) => p.brand === marca);
  if (tipo) results = results.filter((p) => p.indicatorType === tipo);
  if (categoria) results = results.filter((p) => p.category === categoria);

  const query = q.trim();
  if (!query) return results;

  const skuQuery = normalizeSku(query);
  const textQuery = normalize(query);

  return results
    .map((product) => ({ product, score: scoreProduct(product, skuQuery, textQuery) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name, 'es'))
    .map((entry) => entry.product);
}

function scoreProduct(product: Product, skuQuery: string, textQuery: string): number {
  const skus = product.skus.map(normalizeSku);

  if (skus.some((sku) => sku === skuQuery)) return 100;
  if (skus.some((sku) => sku.startsWith(skuQuery))) return 80;
  if (skus.some((sku) => sku.includes(skuQuery))) return 60;

  const name = normalize(product.name);
  if (name.includes(textQuery)) return 40;

  const haystack = normalize(
    [product.category, product.brand ?? '', product.description, ...product.highlights].join(' '),
  );
  if (haystack.includes(textQuery)) return 20;

  return 0;
}

/** Opciones de filtro presentes en el catálogo, para no ofrecer filtros vacíos. */
export function getFilterOptions() {
  const brands = new Set<Brand>();
  const categories = new Set<string>();
  const types = new Set<IndicatorType>();

  for (const product of PRODUCTS) {
    if (product.brand) brands.add(product.brand);
    categories.add(product.category);
    if (product.indicatorType) types.add(product.indicatorType);
  }

  return {
    brands: [...brands].sort(),
    categories: [...categories].sort((a, b) => a.localeCompare(b, 'es')),
    types: [...types].sort((a, b) => a - b),
  };
}
