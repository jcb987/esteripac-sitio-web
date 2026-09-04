import { Link } from 'react-router-dom';
import { FAMILIES, getProcessesOfFamily } from '@/data/processes';
import { getProduct, listProducts } from '@/lib/catalog';
import { agentUrl } from '@/lib/whatsapp';
import { routes } from '@/routes';
import { BRANDS } from '@/config/site';
import {
  Badge,
  Container,
  ExternalButton,
  LinkButton,
  Section,
  SectionHeading,
} from '@/components/ui';
import { WhatsAppIcon } from '@/components/layout/Header';

/**
 * La home no muestra el catálogo: conduce al proceso correcto.
 *
 * Un jefe de compras no llega buscando "productos", llega con un proceso que
 * tiene que controlar. Todo lo de arriba de la página está ordenado alrededor
 * de esa decisión.
 */
export function Home() {
  const products = listProducts();
  const fdaCount = products.filter((p) => p.fdaApproved).length;

  return (
    <>
      <Hero />

      <Section tone="mist">
        <SectionHeading
          eyebrow="Entre por su proceso"
          title="¿Qué proceso necesita controlar?"
          lead="Cada línea del portafolio responde a un punto concreto del reprocesamiento. Empiece por el proceso y llegue a la referencia, no al revés."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {FAMILIES.filter((family) => family.slug !== 'dispositivos-digitales').map((family) => (
            <article
              key={family.slug}
              className="flex flex-col border border-navy-100 bg-white p-5 transition-colors hover:border-navy-300"
            >
              <h3 className="font-display text-lg font-semibold text-navy-900">
                <Link to={routes.familia(family.slug)} className="after:absolute after:inset-0">
                  {family.name}
                </Link>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{family.summary}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5 pt-1">
                {getProcessesOfFamily(family.slug).map((process) => (
                  <li key={process.slug}>
                    <Link
                      to={routes.proceso(family.slug, process.slug)}
                      className="relative z-10 inline-block rounded-sm bg-navy-50 px-2 py-1 text-[13px] font-medium text-navy-700 hover:bg-navy-100"
                    >
                      {process.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-4 border border-navy-100 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-navy-900">
                Dispositivos y herramientas digitales
              </h3>
              <p className="mt-1 max-w-xl text-sm text-navy-600">
                Auto-lectoras que bajan la lectura biológica de 24 horas a segundos, y el software
                que convierte cada resultado en un registro auditable.
              </p>
            </div>
            <LinkButton to={routes.familia('dispositivos-digitales')} tone="secondary">
              Ver equipos
            </LinkButton>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <SectionHeading
              eyebrow="Cómo trabajamos"
              title="Un distribuidor técnico, no un catálogo en línea"
              lead="La referencia equivocada invalida el control aunque el equipo haya funcionado bien. Por eso el proceso empieza con una conversación técnica y no con un carrito."
            />
            <ol className="mt-8 space-y-6">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="tabular grid size-8 shrink-0 place-items-center rounded-sm bg-navy-900 font-display text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-navy-900">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-navy-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="h-fit border border-navy-100 bg-navy-50 p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-navy-500 uppercase">
              El portafolio en números
            </p>
            <dl className="mt-4 space-y-4">
              <Stat value={String(products.length)} label="referencias en el catálogo técnico" />
              <Stat value={String(fdaCount)} label="referencias con aprobación FDA declarada" />
              <Stat value="4" label="marcas distribuidas" />
              <Stat value="9" label="procesos cubiertos, de lavado a esterilización" />
            </dl>
          </aside>
        </div>
      </Section>

      <Section tone="mist">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Conformidad"
            title="Normas que respalda el portafolio"
            lead="La conformidad se declara por referencia y se consulta en cada ficha técnica, no como un sello general del sitio."
          />
        </div>
        <ul className="mt-6 flex flex-wrap gap-2">
          {NORMS.map((norm) => (
            <li key={norm}>
              <Badge tone="outline" className="bg-white px-3 py-1.5 text-xs">
                {norm}
              </Badge>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs font-semibold tracking-[0.14em] text-navy-500 uppercase">
          Marcas que distribuimos
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {BRANDS.map((brand) => (
            <li key={brand} className="font-display text-lg font-semibold text-navy-700">
              {brand}®
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="navy">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <SectionHeading
              tone="dark"
              eyebrow="Conviértase en cliente"
              title="Cuenta institucional con precios y recompra"
              lead="Verificamos su institución con el NIT y habilitamos una cuenta con precios acordados y reposición sin tener que volver a cotizar cada mes."
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <LinkButton
              to={routes.conviertaseEnCliente()}
              tone="whatsapp"
              className="justify-center"
            >
              Ver cómo funciona
            </LinkButton>
            <ExternalButton
              href={agentUrl({ page: 'la página de inicio' })}
              tone="secondary"
              className="justify-center"
            >
              <WhatsAppIcon />
              Hablar con el asistente
            </ExternalButton>
          </div>
        </div>
      </Section>
    </>
  );
}

function Hero() {
  return (
    <div className="border-b border-navy-100 bg-white">
      <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-navy-500 uppercase">
            Distribuidor técnico en Colombia
          </p>
          <h1 className="font-display text-3xl leading-[1.1] font-bold tracking-tight text-navy-900 sm:text-4xl lg:text-5xl">
            Control verificable en cada etapa del reprocesamiento
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-600">
            Indicadores biológicos y químicos, dispositivos de desafío y auto-lectoras para
            hospitales, clínicas odontológicas y laboratorios. Del lavado a la liberación de la
            carga, con respaldo normativo por referencia.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton to={routes.soluciones()}>Entrar por proceso</LinkButton>
            <LinkButton to={routes.catalogo()} tone="secondary">
              Buscar una referencia
            </LinkButton>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-3">
            {HERO_PRODUCTS.map((item) => (
              <figure key={item.src} className="border border-navy-100 bg-navy-50 p-4">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="mx-auto h-28 w-auto object-contain sm:h-36"
                />
                <figcaption className="mt-3 text-[11px] font-semibold tracking-wide text-navy-500 uppercase">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="tabular font-display text-3xl font-bold text-navy-900">{value}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-navy-600">{label}</span>
      </dd>
    </div>
  );
}

/**
 * Las fotos del hero se resuelven contra el catálogo, no con rutas escritas a
 * mano: los archivos se nombran por SKU y no por slug, así que fijarlas acá
 * rompía la imagen en silencio.
 */
const HERO_PRODUCTS = (
  [
    ['bt225', 'Indicador biológico'],
    ['photon', 'Auto-lectora'],
    ['it26-c', 'Integrador Tipo 5'],
    ['lumenia-l122', 'Desafío de limpieza'],
  ] as const
).flatMap(([slug, caption]) => {
  const product = getProduct(slug);
  return product?.image ? [{ src: product.image, alt: product.name, caption }] : [];
});

const STEPS = [
  {
    title: 'Definimos el control que corresponde a su proceso',
    body: 'Método de esterilización, parámetros del ciclo, tipo de carga y norma que la institución debe acreditar. De ahí sale la referencia, no de un listado de precios.',
  },
  {
    title: 'Verificamos su institución y abrimos la cuenta',
    body: 'Con el NIT y los datos de la institución habilitamos una cuenta con precios acordados y condiciones comerciales estables.',
  },
  {
    title: 'Acompañamos el consumo y la reposición',
    body: 'Capacitación al personal del servicio y reposición programada según el consumo real, para que el control no se interrumpa por un faltante.',
  },
];

const NORMS = [
  'ISO 11140-1:2014',
  'ISO 11140-4:2014',
  'ISO 11140-5:2014',
  'ISO 11138-1:2017',
  'ISO 11138-2:2017',
  'ISO 11138-3:2017',
  'ISO 11138-4:2017',
  'ISO 11138-5:2017',
  'ISO 15883-5:2021',
  'ANSI/AAMI ST79:2017',
  'EN 285',
];
