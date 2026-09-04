/**
 * Exporta el catálogo tipado a Markdown para knowledge/negocio/ del
 * whatsapp-closer-agentkit. Es la única fuente de productos que el agente de
 * WhatsApp puede citar — si un dato no está acá, el agente no lo inventa.
 *
 * Uso: npx tsx scripts/export_catalog_markdown.ts > salida.md
 *
 * Deliberadamente NO usa el alias '@/': este script vive fuera del proyecto
 * Vite y corre con tsx puro, así que solo importa módulos de src/data que ya
 * son alias-free (ver catalog.test.ts, que es el único archivo de data con
 * un import '@/').
 */
import { PRODUCTS } from '../src/data/products/index';
import { FAMILIES, getProcessesOfFamily } from '../src/data/processes';
import type { Product } from '../src/data/types';

function line(...parts: Array<string | null | undefined | false>): string {
  return parts.filter(Boolean).join(' ');
}

function productBlock(p: Product): string {
  const out: string[] = [];
  out.push(`#### ${p.name}`);
  if (p.skus.length) out.push(`- **SKU:** ${p.skus.join(', ')}`);
  if (p.brand) out.push(`- **Marca:** ${p.brand}®`);
  out.push(`- **Categoría:** ${p.category}`);
  if (p.indicatorType) out.push(`- **Tipo de indicador:** Tipo ${p.indicatorType} (ISO 11140)`);
  if (p.conditions?.length) out.push(`- **Condiciones de uso:** ${p.conditions.join('; ')}`);
  if (p.challengeLevel) out.push(`- **Nivel de desafío:** ${p.challengeLevel}`);
  if (p.biological) {
    out.push(
      `- **Datos biológicos:** ${p.biological.microorganism}, ${p.biological.population}, lectura en ${p.biological.readTime}`,
    );
  }
  if (p.compliance.length) out.push(`- **Conformidad normativa:** ${p.compliance.join(', ')}`);
  out.push(`- **Aprobado por FDA:** ${p.fdaApproved ? 'Sí' : 'No declarado en el catálogo'}`);
  if (p.presentation) out.push(`- **Presentación:** ${p.presentation}`);
  if (p.compatibleDevices.length) {
    const names = p.compatibleDevices
      .map((slug) => PRODUCTS.find((d) => d.slug === slug)?.name)
      .filter(Boolean);
    if (names.length) out.push(`- **Dispositivos compatibles:** ${names.join(', ')}`);
  }
  out.push(`- **Descripción:** ${p.description}`);
  if (p.highlights.length) out.push(`- **Destacados:** ${p.highlights.join('; ')}`);
  out.push(`- **Precio:** no publicado — cotización consultiva, ver política abajo.`);
  return out.join('\n');
}

function main() {
  const out: string[] = [];

  out.push('# Catálogo Esteripac S.A.S.\n');
  out.push(
    line(
      'Distribuidor colombiano de indicadores biológicos y químicos para el control de',
      'esterilización, desinfección e higiene. Marcas distribuidas: Chemdye®, Bionova®,',
      'Integron®, Cintape® (proveedor Terragene).',
    ),
    '',
  );

  out.push('## Política de precios — leer antes de responder cualquier consulta\n');
  out.push(
    [
      '**Esteripac no publica precios.** Ninguna referencia de este catálogo tiene un precio',
      'público. Es decisión de negocio: la venta es consultiva y el precio se acuerda al abrir',
      'una cuenta institucional verificada con NIT.',
      '',
      '**No inventes ni estimes un precio bajo ninguna circunstancia.** Si preguntan cuánto',
      'cuesta algo, la respuesta correcta es explicar que se cotiza según el proceso, el',
      'volumen y la frecuencia de consumo, y guiar hacia abrir una cuenta institucional',
      '("Conviértase en cliente"). Lo mismo aplica a disponibilidad de stock y a tiempos de',
      'entrega: no están en este catálogo, no se inventan.',
    ].join('\n'),
    '',
  );

  out.push('## Quién compra\n');
  out.push(
    [
      'El comprador es institucional: jefe de compras de una clínica, coordinador de',
      'laboratorio, personal de un Departamento de Procesamiento Estéril (DPE) en',
      'hospitales, clínicas odontológicas y laboratorios en Colombia. No es un consumidor',
      'final. Suele escribir desde el celular, resolviendo un proceso técnico concreto.',
    ].join('\n'),
    '',
  );

  out.push('## Cómo se convierte en cliente\n');
  out.push(
    [
      '1. **Solicitud:** razón social, NIT, tipo de institución, responsable del servicio y',
      '   los procesos que necesita controlar.',
      '2. **Verificación con NIT:** Esteripac confirma la institución y las condiciones',
      '   comerciales.',
      '3. **Activación de la cuenta:** acceso a precios acordados y recompra directa de las',
      '   referencias de consumo habitual.',
      '',
      'Si alguien muestra intención real de compra, guíalo hacia este flujo en vez de',
      'intentar cerrar un precio en el chat.',
    ].join('\n'),
    '',
  );

  out.push('## El portafolio, por proceso\n');
  out.push(
    line(
      'Un comprador entra por el proceso que necesita controlar, no por una categoría',
      'genérica. Usa esta misma lógica para entender qué referencia corresponde a qué',
      'pregunta.',
    ),
    '',
  );

  for (const family of FAMILIES) {
    out.push(`### ${family.name}\n`);
    out.push(family.summary, '');

    for (const process of getProcessesOfFamily(family.slug)) {
      const products = PRODUCTS.filter((p) => p.processes.includes(process.slug));
      if (!products.length) continue;

      out.push(`### Proceso: ${process.name}\n`);
      out.push(process.intro, '');
      if (process.variables.length) {
        out.push(`**Variables que se controlan:** ${process.variables.join(', ')}.\n`);
      }

      for (const product of products) {
        out.push(productBlock(product), '');
      }
    }
  }

  out.push('## Lo que este catálogo NO trae — no lo inventes\n');
  out.push(
    [
      '- Precios, disponibilidad de stock y tiempo de entrega (ver política arriba).',
      '- Registros INVIMA por producto individual.',
      '- Documentación descargable (IFU, certificados, COA) — están disponibles a solicitud,',
      '  no como archivo directo.',
      '- Agenda de capacitaciones confirmada (la de la página de Formación es de ejemplo).',
    ].join('\n'),
  );

  process.stdout.write(out.join('\n') + '\n');
}

main();
