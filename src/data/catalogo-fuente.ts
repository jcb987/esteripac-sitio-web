/**
 * Fuente de verdad para verificar la transcripción del catálogo.
 *
 * NO se importa desde la aplicación: existe solo para que catalog.test.ts pueda
 * comparar los datos escritos a mano contra el documento original. Si el
 * fabricante publica una revisión nueva del catálogo, estas listas se
 * actualizan primero y las pruebas señalan qué fichas quedaron desalineadas.
 */

/**
 * Los 88 SKU de la "Tabla de presentación de productos" (catálogo pp. 53-55),
 * más los dos que el folleto menciona solo en el cuerpo: `IT26-C EXTENDER`
 * (p. 21) e `IRCG3` (p. 52, como consumible de la etiquetadora CG3).
 */
export const SKUS_EN_CATALOGO = [
  // p. 53
  'BD125X/1',
  'BD125X/2',
  'BHY',
  'BT10',
  'BT20',
  'BT30',
  'BT91',
  'BT96',
  'BT98',
  'BT102',
  'BT110',
  'BT220',
  'BT222',
  'BT224',
  'BT225',
  'BPH',
  'CD13',
  'CD16',
  'CD23',
  'CD28',
  'CD29',
  'CD30',
  'CD33',
  'CD40',
  'CD42',
  'CD43',
  'CD48',
  'CD50',
  'CD53',
  'CDWA3',
  'CDWA4',
  'CDWAH',
  'CDWAH-U',
  'CDWU-Z',
  'CDWU-H',
  'CG3',
  'CT10',
  // p. 54
  'CT22',
  'CT30',
  'CT40',
  'CT50',
  'IC10/20',
  'IC10/20FR',
  'IC10/20FRLCD',
  'IT12',
  'IT26-1YS',
  'IT26-C',
  'IT27-3YS',
  'IT27-4YS',
  'IT27-5YS',
  'IT27-7YS',
  'IT27-18YS',
  'IT27W-1',
  'IT27W-5',
  'IT27W-10',
  'IT28',
  'IT31',
  'KBD8948X',
  'KBD8948X/1',
  'KH2X025-P1/P',
  'KH2X12-P1/P',
  'KH2X15-3.5BD/P',
  'KH2X15-3.5Y/P',
  'KH2X15-5.3Y/P',
  'KH2X15-7.0Y/P',
  'KH2X15-F1',
  'KPCD220-2',
  'KPCD220-C',
  'KPCD222-2',
  'KPCD222-C',
  'KPCD224-2',
  'KPCD224-C',
  'KPCD225-2',
  'KPCD225-C',
  'LUMENIA L1',
  'KPRO2-E69',
  'KPRO2-E250',
  // p. 55
  'LUMENIA L122',
  'LUMENIA L2',
  'LSF1',
  'PRO1 ENDO',
  'PRO1 MICRO',
  'MINIBIO',
  'MINIPRO',
  'SWE-1.7',
  'SWE-2.0',
  'SWE-2.7',
  'SWE-3.0',
  // Solo en el cuerpo del folleto
  'IT26-C EXTENDER',
  'IRCG3',
] as const;

/**
 * SKU con el sello "Aprobado por FDA" impreso en su bloque del catálogo.
 *
 * Verificado por posición en la página, no por orden de lectura del texto: en
 * un folleto a dos columnas el flujo del PDF no coincide con la maqueta y
 * atribuye el sello a la referencia equivocada. Corresponden a 27 fichas.
 */
export const SKUS_CON_FDA = [
  'CT22', // p. 17
  'BD125X/1', // p. 18
  'KBD8948X/1', // p. 19
  'CD29', // p. 21
  'IT26-C',
  'IT26-C EXTENDER',
  'IT26-1YS',
  'BT225', // p. 23
  'BT224',
  'BT222', // p. 24
  'BT220',
  'KPCD225-2', // p. 25
  'KPCD225-C',
  'KPCD224-2',
  'KPCD224-C',
  'KPCD222-2', // p. 26
  'KPCD222-C',
  'KPCD220-2',
  'KPCD220-C',
  'CT40', // p. 29
  'CD42', // p. 30
  'CD40',
  'BT98', // p. 31
  'BT96',
  'CD16', // p. 33
  'IT12', // p. 34
  'BT110',
  'BPH', // p. 49
  'BHY',
  'IC10/20FRLCD', // p. 50
  'IC10/20FR',
  'MINIBIO', // p. 51
] as const;
