import { FAMILIES } from '@/data/processes';
import { agentUrl } from '@/lib/whatsapp';
import { routes } from '@/routes';
import { SITE } from '@/config/site';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { WhatsAppIcon } from '@/components/layout/Header';
import { Container, ExternalButton, LinkButton, Section, SectionHeading } from '@/components/ui';

/**
 * El asistente es la vía principal; correo y ubicación quedan como respaldo.
 * Todos los teléfonos salen de config/site.ts, que hoy apunta al número
 * temporal de pruebas.
 */
export function Contacto() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs items={[{ label: 'Inicio', to: routes.home() }, { label: 'Contacto' }]} />
      </Container>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="Contacto"
              title="Resuelva la consulta técnica en el momento"
              lead="El asistente de Esteripac responde por WhatsApp con el catálogo completo en contexto: referencias, condiciones de ciclo, conformidad normativa y compatibilidad entre indicador y auto-lectora."
            />

            <ExternalButton
              href={agentUrl({ page: 'la página de contacto' })}
              className="mt-6 w-full sm:w-auto"
            >
              <WhatsAppIcon />
              Abrir el asistente en WhatsApp
            </ExternalButton>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {QUICK_ASKS.map((ask) => (
                <li key={ask}>
                  <a
                    href={agentUrl({ name: ask })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full border border-navy-100 bg-white p-4 text-sm text-navy-700 transition-colors hover:border-navy-300 hover:bg-navy-50"
                  >
                    <span className="text-navy-400">“</span>
                    {ask}
                    <span className="text-navy-400">”</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <aside className="h-fit border border-navy-100 bg-navy-50 p-6">
            <h2 className="font-display text-lg font-semibold text-navy-900">
              Datos de {SITE.shortName}
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
                  Razón social
                </dt>
                <dd className="mt-0.5 text-navy-800">{SITE.legalName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
                  Correo
                </dt>
                <dd className="mt-0.5">
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-navy-800 underline underline-offset-4"
                  >
                    {SITE.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
                  Teléfono
                </dt>
                <dd className="tabular mt-0.5 text-navy-800">{SITE.phoneDisplay}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
                  Ubicación
                </dt>
                <dd className="mt-0.5 text-navy-800">
                  {SITE.city}
                  <br />
                  {SITE.country}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
                  Horario de atención
                </dt>
                <dd className="mt-0.5 text-navy-800">{SITE.hours}</dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-navy-200 pt-5">
              <p className="text-sm text-navy-600">
                ¿Necesita abrir cuenta institucional con precios y recompra?
              </p>
              <LinkButton
                to={routes.conviertaseEnCliente()}
                tone="secondary"
                className="mt-3 w-full justify-center"
              >
                Ver el proceso de vinculación
              </LinkButton>
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="mist">
        <SectionHeading
          eyebrow="Atajos"
          title="O entre directo por el proceso que necesita controlar"
        />
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FAMILIES.map((family) => (
            <li key={family.slug}>
              <LinkButton
                to={routes.familia(family.slug)}
                tone="secondary"
                className="h-full w-full justify-start text-left"
              >
                {family.name}
              </LinkButton>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

const QUICK_ASKS = [
  '¿Qué indicador biológico corresponde a mi autoclave de prevacío?',
  '¿Cuál es la diferencia entre un integrador Tipo 5 y un emulador Tipo 6?',
  '¿Qué auto-lectora necesito para el indicador BT98?',
  '¿Cómo verifico la limpieza de un endoscopio de seis canales?',
];
