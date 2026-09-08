/**
 * Fuente única de los datos de contacto y del enlace al asistente.
 *
 * TEMPORAL: todos los teléfonos apuntan a un número de pruebas mientras el
 * cliente define el definitivo del agente de IA. Migrar es cambiar
 * WHATSAPP_AGENT y, si aplica, PHONE_DISPLAY — nada más en todo el proyecto.
 */

/** Número del asistente en formato internacional sin '+' ni separadores (wa.me). */
export const WHATSAPP_AGENT = '573000000000'; // TODO cliente: número temporal de pruebas

export const SITE = {
  legalName: 'Esteripac S.A.S.',
  shortName: 'Esteripac',
  nit: null as string | null, // TODO cliente: NIT pendiente de confirmación
  tagline: 'Control de procesos de esterilización, desinfección e higiene',
  city: 'La Ceja, Antioquia',
  country: 'Colombia',
  email: 'esteripac@esteripac.co',
  /** Se muestra en el sitio; hoy apunta al número de pruebas, no al conmutador real. */
  phoneDisplay: '+57 300 000 0000', // TODO cliente
  agency: { name: 'Corbi', url: 'https://corbi.com.co' },
} as const;

/** Marcas del portafolio que Esteripac distribuye. */
export const BRANDS = ['Chemdye', 'Bionova', 'Integron', 'Cintape'] as const;
