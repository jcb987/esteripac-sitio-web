import extracted from '../extracted.json';
import type { ExtractedAsset, Product, ProductSeed } from '../types';
import { LIMPIEZA } from './limpieza';
import { HIGIENE } from './higiene';
import { VAPOR } from './vapor';
import { FORMALDEHIDO, OXIDO_ETILENO, PEROXIDO } from './gases';
import { CALOR_SECO } from './calor-seco';
import { DISPOSITIVOS } from './dispositivos';
import { DIGITALES } from './digitales';

const ASSETS = extracted as Record<string, ExtractedAsset>;

const SEEDS: ProductSeed[] = [
  ...LIMPIEZA,
  ...HIGIENE,
  ...VAPOR,
  ...PEROXIDO,
  ...OXIDO_ETILENO,
  ...FORMALDEHIDO,
  ...CALOR_SECO,
  ...DISPOSITIVOS,
  ...DIGITALES,
];

/**
 * Completa cada ficha con lo que produce scripts/extract_assets.py.
 *
 * Un valor declarado a mano en el seed siempre gana: así se cubren los casos
 * que el extractor no puede resolver, como un viraje que no es un cambio de
 * color simple o un accesorio sin fotografía propia en el catálogo.
 */
function hydrate(seed: ProductSeed): Product {
  const asset = seed.skus.length > 0 ? ASSETS[seed.skus[0]!] : undefined;
  const colors = asset?.colors;

  return {
    ...seed,
    image: seed.image !== undefined ? seed.image : (asset?.image ?? null),
    colorShift:
      seed.colorShift !== undefined
        ? seed.colorShift
        : colors?.inicial && colors.final
          ? { from: colors.inicial, to: colors.final }
          : null,
    commercial: {
      // El catálogo no publica precio, disponibilidad ni ciclo de consumo, y la
      // consulta es asistida por decisión del negocio. La fase 2 hidrata estos
      // campos tras autenticar al cliente con su NIT.
      price: null,
      availability: null,
      reorderCycleDays: null,
    },
  };
}

export const PRODUCTS: Product[] = SEEDS.map(hydrate);
