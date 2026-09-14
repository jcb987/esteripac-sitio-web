import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(
  scriptDirectory,
  '..',
  '..',
  'whatsapp-closer-agentkit',
  'knowledge',
  'negocio',
  'fichas-tecnicas-fabricante.md',
);
const outputPath = resolve(scriptDirectory, '..', 'src', 'data', 'fichas-tecnicas.ts');

function extractTechnicalSheets(markdown) {
  const sheets = new Map();
  let currentSku = null;

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      currentSku = heading[1];
      continue;
    }

    const technicalSheet = line.match(
      /^- \*\*Ficha técnica \(PDF\):\*\*\s+(https:\/\/\S+)\s*$/,
    );
    if (!technicalSheet || !currentSku || currentSku === 'Esteripac') continue;

    if (sheets.has(currentSku)) {
      throw new Error(`La fuente repite la ficha técnica de ${currentSku}.`);
    }
    sheets.set(currentSku, technicalSheet[1]);
  }

  if (sheets.size === 0) {
    throw new Error('La fuente no contiene fichas técnicas para generar.');
  }

  return sheets;
}

function renderModule(sheets) {
  const entries = [...sheets].map(
    ([sku, url]) => `  ${JSON.stringify(sku)}: ${JSON.stringify(url)},`,
  );

  return `// Este archivo es generado por scripts/generar_fichas_tecnicas.mjs.
// Fuente: whatsapp-closer-agentkit/knowledge/negocio/fichas-tecnicas-fabricante.md
// No lo edites a mano: vuelve a ejecutar el generador.

export const FICHAS_TECNICAS_PDF: Readonly<Record<string, string>> = {
${entries.join('\n')}
};

/** Devuelve la primera ficha técnica declarada para las variantes del producto. */
export function fichaTecnicaPdfPara(skus: readonly string[]): string | null {
  for (const sku of skus) {
    const url = FICHAS_TECNICAS_PDF[sku];
    if (url) return url;
  }
  return null;
}
`;
}

const sheets = extractTechnicalSheets(readFileSync(sourcePath, 'utf8'));
const prettierConfig = (await resolveConfig(outputPath)) ?? {};
const generated = await format(renderModule(sheets), {
  ...prettierConfig,
  filepath: outputPath,
});

if (process.argv.includes('--check')) {
  const current = readFileSync(outputPath, 'utf8');
  if (current !== generated) {
    throw new Error('El mapa de fichas técnicas está desactualizado. Ejecuta el generador.');
  }
  console.log('El mapa de fichas técnicas está actualizado.');
} else {
  writeFileSync(outputPath, generated, 'utf8');
  console.log(`Mapa generado con ${sheets.size} fichas.`);
}
