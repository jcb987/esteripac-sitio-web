import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTS } from './products';
import { getProcess } from './processes';
import { normalizeSku } from '@/lib/slug';
import { SKUS_EN_CATALOGO, SKUS_CON_FDA } from './catalogo-fuente';

/**
 * Integridad del catálogo transcrito.
 *
 * Estas pruebas comparan los datos contra la fuente: la tabla de presentación
 * de productos del catálogo (pp. 53-55) y los sellos FDA verificados por
 * posición en la página. Si alguien agrega una referencia inventada o pierde
 * una real, esto falla.
 */
describe('catálogo', () => {
  it('cubre todos los SKU del catálogo del fabricante', () => {
    const presentes = new Set(PRODUCTS.flatMap((p) => p.skus.map(normalizeSku)));
    const faltantes = SKUS_EN_CATALOGO.filter((sku) => !presentes.has(normalizeSku(sku)));
    expect(faltantes).toEqual([]);
  });

  it('no inventa SKU que no estén en el catálogo', () => {
    const oficiales = new Set(SKUS_EN_CATALOGO.map(normalizeSku));
    const inventados = PRODUCTS.flatMap((p) => p.skus).filter(
      (sku) => !oficiales.has(normalizeSku(sku)),
    );
    expect(inventados).toEqual([]);
  });

  it('no repite un SKU en dos fichas', () => {
    const vistos = new Map<string, string>();
    const duplicados: string[] = [];
    for (const product of PRODUCTS) {
      for (const sku of product.skus) {
        const key = normalizeSku(sku);
        if (vistos.has(key)) duplicados.push(`${sku} (${vistos.get(key)} / ${product.slug})`);
        vistos.set(key, product.slug);
      }
    }
    expect(duplicados).toEqual([]);
  });

  it('usa slugs únicos', () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    expect(slugs.length).toBe(new Set(slugs).size);
  });

  it('marca el sello FDA solo donde el catálogo lo declara', () => {
    const esperados = new Set(SKUS_CON_FDA.map(normalizeSku));
    const conSello = PRODUCTS.filter((p) => p.fdaApproved);

    const deMas = conSello
      .filter((p) => !p.skus.some((sku) => esperados.has(normalizeSku(sku))))
      .map((p) => p.slug);
    expect(deMas).toEqual([]);

    const declaradosEnFichas = new Set(
      conSello.flatMap((p) => p.skus.map(normalizeSku)).filter((sku) => esperados.has(sku)),
    );
    const deMenos = SKUS_CON_FDA.filter((sku) => !declaradosEnFichas.has(normalizeSku(sku)));
    expect(deMenos).toEqual([]);
  });

  it('asigna al menos un proceso válido a cada ficha', () => {
    for (const product of PRODUCTS) {
      expect(product.processes.length, product.slug).toBeGreaterThan(0);
      for (const process of product.processes) {
        expect(getProcess(process), `${product.slug} → ${process}`).toBeDefined();
      }
    }
  });

  it('enlaza solo a fichas que existen', () => {
    const slugs = new Set(PRODUCTS.map((p) => p.slug));
    const rotos: string[] = [];
    for (const product of PRODUCTS) {
      for (const slug of [...product.relatedProducts, ...product.compatibleDevices]) {
        if (!slugs.has(slug)) rotos.push(`${product.slug} → ${slug}`);
      }
      if (product.relatedProducts.includes(product.slug)) rotos.push(`${product.slug} → sí mismo`);
    }
    expect(rotos).toEqual([]);
  });

  it('declara como compatibles solo equipos de lectura', () => {
    const porSlug = new Map(PRODUCTS.map((p) => [p.slug, p]));
    const lecturaValida = ['Auto-lectora', 'Incubadora', 'Etiquetadora'];
    const invalidos: string[] = [];
    for (const product of PRODUCTS) {
      for (const slug of product.compatibleDevices) {
        const device = porSlug.get(slug);
        if (device && !lecturaValida.includes(device.category)) {
          invalidos.push(`${product.slug} → ${slug} (${device.category})`);
        }
      }
    }
    expect(invalidos).toEqual([]);
  });

  it('apunta solo a imágenes que existen en public/', () => {
    const rotas = PRODUCTS.filter(
      (p) => p.image && !existsSync(new URL(`../../public${p.image}`, import.meta.url)),
    ).map((p) => `${p.slug} → ${p.image}`);
    expect(rotas).toEqual([]);
  });

  it('no publica precio, disponibilidad ni ciclo de consumo', () => {
    // El catálogo no trae estos datos y la fase 1 es consultiva: si alguna vez
    // aparecen valores acá, es que se inventaron.
    for (const product of PRODUCTS) {
      expect(product.commercial.price, product.slug).toBeNull();
      expect(product.commercial.availability, product.slug).toBeNull();
      expect(product.commercial.reorderCycleDays, product.slug).toBeNull();
    }
  });

  it('usa colores hexadecimales válidos en el viraje', () => {
    const invalidos: string[] = [];
    for (const product of PRODUCTS) {
      if (!product.colorShift) continue;
      for (const value of [product.colorShift.from, product.colorShift.to]) {
        if (!/^#[0-9A-F]{6}$/i.test(value)) invalidos.push(`${product.slug}: ${value}`);
      }
    }
    expect(invalidos).toEqual([]);
  });

  it('solo asigna tipo de indicador a indicadores químicos', () => {
    const invalidos = PRODUCTS.filter(
      (p) => p.indicatorType !== null && p.category !== 'Indicador químico',
    ).map((p) => p.slug);
    expect(invalidos).toEqual([]);
  });

  it('da datos biológicos a todos los indicadores biológicos', () => {
    const sinDatos = PRODUCTS.filter(
      (p) => p.category === 'Indicador biológico' && p.biological === null,
    ).map((p) => p.slug);
    expect(sinDatos).toEqual([]);
  });

  it('describe cada ficha con texto propio', () => {
    for (const product of PRODUCTS) {
      expect(product.name.length, product.slug).toBeGreaterThan(4);
      expect(product.description.length, product.slug).toBeGreaterThan(80);
    }
  });
});
