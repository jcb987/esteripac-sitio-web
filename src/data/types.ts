/**
 * Modelo del catálogo.
 *
 * Todo campo que el catálogo real no declara se representa con `null` o `[]`.
 * Nada se infiere ni se completa por analogía: si el dato no está en la fuente,
 * la ficha lo muestra como "Consultar".
 */

export type ProcessSlug =
  | 'lavado'
  | 'desinfeccion'
  | 'endoscopios'
  | 'proteinas-residuales'
  | 'vapor'
  | 'peroxido-hidrogeno'
  | 'oxido-etileno'
  | 'formaldehido'
  | 'calor-seco'
  | 'dispositivos-digitales';

export type FamilySlug =
  | 'monitoreo-limpieza'
  | 'monitoreo-higiene'
  | 'monitoreo-esterilizacion'
  | 'dispositivos-digitales';

export type Brand = 'Chemdye' | 'Bionova' | 'Integron' | 'Cintape';

export type ProductCategory =
  | 'Indicador químico'
  | 'Indicador biológico'
  | 'Dispositivo de Desafío de Proceso'
  | 'Control de limpieza'
  | 'Monitoreo de higiene'
  | 'Auto-lectora'
  | 'Incubadora'
  | 'Etiquetadora'
  | 'Accesorio'
  | 'Solución digital';

/** Clases de indicador químico según ISO 11140. El catálogo no incluye Tipo 3. */
export type IndicatorType = 1 | 2 | 4 | 5 | 6;

export interface ColorShift {
  /** Color inicial del indicador, en hex, tal como aparece impreso en el catálogo. */
  from: string;
  /** Color de viraje tras un proceso conforme. */
  to: string;
  /** Aclaración cuando el viraje no es un cambio de color simple. */
  note?: string;
}

export interface BiologicalData {
  microorganism: string;
  population: string;
  readTime: string;
}

export interface ProductDocument {
  label: string;
  /** null mientras Esteripac no entregue el archivo. La ficha muestra el
   *  documento como "disponible a solicitud" en lugar de ocultarlo. */
  href: string | null;
  kind: 'IFU' | 'Certificado' | 'Ficha técnica' | 'COA' | 'Otro';
}

/**
 * Datos comerciales. En la fase 1 son siempre null porque el catálogo no
 * publica precios ni disponibilidad y el negocio decidió que la consulta sea
 * asistida. La fase 2 los hidrata tras autenticar al cliente con su NIT; el
 * contrato ya está fijado acá para que ese cambio no toque el tipo `Product`.
 */
export interface CommercialData {
  price: null;
  availability: null;
  reorderCycleDays: null;
}

export interface Product {
  slug: string;
  name: string;
  /** Uno o más SKU cuando el catálogo agrupa variantes de una misma referencia. */
  skus: string[];
  brand: Brand | null;
  category: ProductCategory;
  /** Un producto puede alcanzarse desde varios procesos. */
  processes: ProcessSlug[];
  indicatorType: IndicatorType | null;
  colorShift: ColorShift | null;
  /** null ⇒ el catálogo no declara condiciones; la ficha muestra "Consultar". */
  conditions: string[] | null;
  challengeLevel: 'Alto' | 'Muy alto' | null;
  biological: BiologicalData | null;
  compliance: string[];
  /** true solo donde el catálogo lo declara textualmente. */
  fdaApproved: boolean;
  compatibleDevices: string[];
  relatedProducts: string[];
  presentation: string | null;
  /** Características declaradas en el catálogo, como hechos. */
  highlights: string[];
  image: string | null;
  documents: ProductDocument[];
  commercial: CommercialData;
  /** Redacción propia de Esteripac a partir del dato técnico. */
  description: string;
}

export interface ProcessNode {
  slug: ProcessSlug;
  name: string;
  family: FamilySlug;
  /** Encabezado corto para tarjetas y navegación. */
  summary: string;
  /** Texto de entrada al proceso, redactado por Esteripac. */
  intro: string;
  /** Parámetros que el proceso obliga a controlar, según el propio catálogo. */
  variables: string[];
}

export interface ProcessFamily {
  slug: FamilySlug;
  name: string;
  summary: string;
  children: ProcessSlug[];
}

/**
 * Lo que se escribe a mano al transcribir el catálogo.
 *
 * `image` y `colorShift` normalmente NO se declaran: los produce
 * scripts/extract_assets.py y se inyectan al ensamblar el catálogo, de modo que
 * volver a correr el extractor no obliga a tocar los datos técnicos. Se pueden
 * declarar igual para cubrir los casos que el extractor no resuelve (un viraje
 * que no es un cambio de color simple, un accesorio sin fotografía propia).
 */
export type ProductSeed = Omit<Product, 'image' | 'colorShift' | 'commercial'> &
  Partial<Pick<Product, 'image' | 'colorShift'>>;

/** Salida de scripts/extract_assets.py. */
export interface ExtractedAsset {
  page: number;
  image: string | null;
  colors: { inicial?: string; final?: string };
}
