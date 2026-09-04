import type { FamilySlug, ProcessFamily, ProcessNode, ProcessSlug } from './types';

/**
 * Taxonomía de navegación. El comprador institucional no busca "ver el
 * catálogo": busca resolver un proceso concreto. Esta es la entrada principal
 * al portafolio; el catálogo plano es la vía secundaria.
 *
 * Las variables a monitorear de cada proceso salen del propio catálogo técnico.
 * Los textos son redacción de Esteripac.
 */

export const FAMILIES: ProcessFamily[] = [
  {
    slug: 'monitoreo-limpieza',
    name: 'Monitoreo de limpieza',
    summary:
      'Un instrumento mal lavado no se esteriliza. Controles para verificar lavado, termo-desinfección y reprocesamiento de endoscopios.',
    children: ['lavado', 'desinfeccion', 'endoscopios'],
  },
  {
    slug: 'monitoreo-higiene',
    name: 'Monitoreo de higiene',
    summary:
      'Detección y cuantificación de proteína residual sobre superficies y en canales internos, con umbrales trazables.',
    children: ['proteinas-residuales'],
  },
  {
    slug: 'monitoreo-esterilizacion',
    name: 'Monitoreo de esterilización',
    summary:
      'Indicadores químicos y biológicos para los cinco métodos de esterilización que se usan en instituciones de salud.',
    children: ['vapor', 'peroxido-hidrogeno', 'oxido-etileno', 'formaldehido', 'calor-seco'],
  },
  {
    slug: 'dispositivos-digitales',
    name: 'Dispositivos y herramientas digitales',
    summary:
      'Auto-lectoras, incubadoras y el software que convierte cada lectura en un registro trazable del DPE.',
    children: ['dispositivos-digitales'],
  },
];

export const PROCESSES: ProcessNode[] = [
  {
    slug: 'lavado',
    name: 'Lavado',
    family: 'monitoreo-limpieza',
    summary: 'Lavadoras ultrasónicas y termo-desinfectoras',
    intro:
      'La materia orgánica que sobrevive al lavado protege a los microorganismos del agente esterilizante: lo que no se removió, no se esteriliza. Monitorear el ciclo con un desafío estandarizado permite demostrar que la cavitación ultrasónica o la acción de la termo-desinfectora efectivamente ocurrió, de forma rutinaria y documentada.',
    variables: ['Frecuencia de cavitación', 'Temperatura', 'Tiempo', 'Acción mecánica'],
  },
  {
    slug: 'desinfeccion',
    name: 'Desinfección',
    family: 'monitoreo-limpieza',
    summary: 'Termo-desinfección por calor húmedo y control de A0',
    intro:
      'La termo-desinfección reduce la carga microbiana por letalidad térmica acumulada, y esa letalidad se expresa como valor A0. La norma ISO 15883 exige verificarlo de forma paramétrica. Los emuladores de calor húmedo traducen ese requisito en una lectura visual por ciclo, atada a una condición de temperatura y tiempo verificable.',
    variables: ['Temperatura', 'Tiempo de exposición', 'Valor A0'],
  },
  {
    slug: 'endoscopios',
    name: 'Reprocesamiento de endoscopios',
    family: 'monitoreo-limpieza',
    summary: 'Canales internos, lúmenes largos y superficies externas',
    intro:
      'Los lúmenes largos y estrechos de un endoscopio son el punto donde el biofilm se forma primero y donde la inspección visual no llega. Los kits de desafío reproducen esa geometría con tubos de diámetro y longitud definidos, de modo que la eficacia de la limpieza en el canal se pueda demostrar y no solo suponer, ciclo tras ciclo.',
    variables: [
      'Diámetro del lumen',
      'Longitud del canal',
      'Remoción de residuo',
      'Acción del reprocesador',
    ],
  },
  {
    slug: 'proteinas-residuales',
    name: 'Detección de proteínas residuales',
    family: 'monitoreo-higiene',
    summary: 'Verificación cualitativa y cuantitativa de la limpieza',
    intro:
      'La proteína está presente en toda forma de vida microbiana, incluidos priones y virus, y es de lo más difícil de remover. Por eso es el marcador con el que se audita la limpieza: si queda proteína, la limpieza no fue suficiente. El portafolio incluye sistemas cualitativos de lectura en un minuto y sistemas cuantitativos que reportan en microgramos de BSA, con el umbral que exige la ISO 15883-5.',
    variables: ['Proteína residual (µg de BSA)', 'Superficie hisopada', 'Canales internos'],
  },
  {
    slug: 'vapor',
    name: 'Vapor',
    family: 'monitoreo-esterilizacion',
    summary: 'Autoclaves de prevacío y de gravedad',
    intro:
      'El vapor saturado sigue siendo el método de referencia para todo lo que tolera calor y humedad. Su éxito no depende solo de alcanzar la temperatura: depende de haber extraído el aire, de la calidad del vapor y del contacto directo con la carga. Por eso el control se arma en capas — exposición, penetración en el paquete, remoción de aire y letalidad — y cada capa tiene su indicador.',
    variables: ['Temperatura', 'Tiempo', 'Presión', 'Calidad del vapor', 'Remoción de aire'],
  },
  {
    slug: 'peroxido-hidrogeno',
    name: 'Peróxido de hidrógeno',
    family: 'monitoreo-esterilizacion',
    summary: 'Plasma y vapor de H2O2 para carga termosensible',
    intro:
      'El peróxido de hidrógeno esteriliza a baja temperatura y sin residuo tóxico, lo que lo volvió la alternativa natural para instrumental termosensible. A cambio penetra menos: en lúmenes y empaques densos el margen es estrecho y el control tiene que ser más fino. De ahí que el desafío tipo Helix y el indicador biológico de lectura rápida sean determinantes en este proceso.',
    variables: ['Temperatura', 'Tiempo', 'Concentración de H2O2', 'Presión'],
  },
  {
    slug: 'oxido-etileno',
    name: 'Óxido de etileno',
    family: 'monitoreo-esterilizacion',
    summary: 'Ciclos de baja temperatura con alta penetración',
    intro:
      'El óxido de etileno alquila las estructuras del microorganismo y penetra empaques y lúmenes complejos como pocos agentes, lo que lo mantiene vigente para dispositivos que no toleran calor ni humedad. El ciclo depende de cuatro parámetros simultáneos y los cuatro deben demostrarse: tiempo de exposición, temperatura, humedad y concentración de gas.',
    variables: ['Temperatura', 'Tiempo', 'Humedad', 'Concentración de OE'],
  },
  {
    slug: 'formaldehido',
    name: 'Formaldehído',
    family: 'monitoreo-esterilizacion',
    summary: 'Vapor-formaldehído a baja temperatura (LTSF)',
    intro:
      'El formaldehído a baja temperatura combina gas y vapor para alcanzar geometrías complejas y lúmenes internos sin exponer el dispositivo a un ciclo de vapor pleno. El control exige seguir concentración de gas, temperatura, humedad y tiempo de forma conjunta: ninguno de los cuatro alcanza por sí solo para liberar la carga.',
    variables: ['Temperatura', 'Tiempo', 'Humedad', 'Concentración de formaldehído'],
  },
  {
    slug: 'calor-seco',
    name: 'Calor seco',
    family: 'monitoreo-esterilizacion',
    summary: 'Polvos, aceites, vaselinas y parafinas',
    intro:
      'El calor seco es la salida para cargas que no toleran humedad: polvos, aceites, vaselina, parafina. Trabaja a temperaturas más altas y con exposiciones mucho más largas que el vapor, así que el indicador tiene que estar calibrado a la temperatura real del ciclo. Elegir la referencia equivocada acá invalida el control aunque el equipo haya funcionado bien.',
    variables: ['Temperatura', 'Tiempo de exposición'],
  },
  {
    slug: 'dispositivos-digitales',
    name: 'Dispositivos y herramientas digitales',
    family: 'dispositivos-digitales',
    summary: 'Auto-lectoras, incubadoras, apps y software de trazabilidad',
    intro:
      'Un resultado anotado en una planilla no es trazable. Las auto-lectoras acortan la lectura de un indicador biológico de 24 horas a minutos o segundos, y el software conecta ese resultado con el ciclo, la carga, el operador y el material reprocesado. Es lo que convierte el monitoreo en un registro auditable y no en un archivo de papel.',
    variables: ['Temperatura de incubación', 'Tiempo de lectura', 'Trazabilidad del ciclo'],
  },
];

const processBySlug = new Map<ProcessSlug, ProcessNode>(PROCESSES.map((p) => [p.slug, p]));
const familyBySlug = new Map<FamilySlug, ProcessFamily>(FAMILIES.map((f) => [f.slug, f]));

export function getProcess(slug: string): ProcessNode | undefined {
  return processBySlug.get(slug as ProcessSlug);
}

export function getFamily(slug: string): ProcessFamily | undefined {
  return familyBySlug.get(slug as FamilySlug);
}

export function getProcessesOfFamily(slug: FamilySlug): ProcessNode[] {
  const family = familyBySlug.get(slug);
  if (!family) return [];
  return family.children.flatMap((child) => {
    const node = processBySlug.get(child);
    return node ? [node] : [];
  });
}

/** Nombre legible de un proceso, para badges y filtros. */
export function processName(slug: ProcessSlug): string {
  return processBySlug.get(slug)?.name ?? slug;
}
