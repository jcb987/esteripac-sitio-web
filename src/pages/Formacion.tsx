import { useState, type FormEvent } from 'react';
import { agentUrl } from '@/lib/whatsapp';
import { routes } from '@/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { WhatsAppIcon } from '@/components/layout/Header';
import {
  Badge,
  Button,
  Container,
  ExternalButton,
  Section,
  SectionHeading,
} from '@/components/ui';

/**
 * Formación y eventos.
 *
 * La agenda es de ejemplo y está marcada como tal en la interfaz: el cliente
 * todavía no entregó el calendario real. El formulario valida y confirma en el
 * cliente, sin backend.
 */
export function Formacion() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[{ label: 'Inicio', to: routes.home() }, { label: 'Formación y eventos' }]}
        />
      </Container>

      <Section>
        <SectionHeading
          eyebrow="Formación"
          title="Capacitaciones y webinars técnicos"
          lead="El control falla más por interpretación que por producto. Estas sesiones están dirigidas al personal que lee el indicador y libera la carga, no al área de compras."
        />

        <p className="mt-6 inline-flex items-center gap-2 border border-gold-300 bg-gold-50 px-3 py-2 text-[13px] text-navy-700">
          <span aria-hidden="true">●</span>
          Agenda de ejemplo — el calendario definitivo lo confirma Esteripac.
        </p>

        <ul className="mt-8 space-y-3">
          {SESSIONS.map((session) => (
            <li
              key={session.title}
              className="flex flex-col gap-4 border border-navy-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <Badge tone={session.state === 'Próxima' ? 'solid' : 'muted'}>
                    {session.state}
                  </Badge>
                  <span className="tabular text-[13px] text-navy-500">{session.when}</span>
                  <span className="text-[13px] text-navy-500">· {session.format}</span>
                </div>
                <h2 className="font-display text-base font-semibold text-navy-900">
                  {session.title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-navy-600">{session.summary}</p>
              </div>
              <div className="shrink-0">
                {session.state === 'Próxima' ? (
                  <a
                    href="#inscripcion"
                    className="inline-flex items-center justify-center rounded-sm border border-navy-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 hover:border-navy-400 hover:bg-navy-50"
                  >
                    Inscribirse
                  </a>
                ) : (
                  <ExternalButton
                    href={agentUrl({ name: `la grabación de «${session.title}»` })}
                    tone="secondary"
                  >
                    Solicitar grabación
                  </ExternalButton>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="mist">
        <div id="inscripcion" className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="Inscripción"
              title="Reserve un cupo para su equipo"
              lead="Las sesiones se dictan por institución cuando el grupo lo justifica. Indique cuántas personas del servicio participarían."
            />
            <ExternalButton href={agentUrl({ page: 'formación y eventos' })} className="mt-6">
              <WhatsAppIcon />
              Coordinar por WhatsApp
            </ExternalButton>
          </div>
          <InscripcionForm />
        </div>
      </Section>
    </>
  );
}

function InscripcionForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Fase 1 sin backend: confirmación en el cliente, sin envío.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="grid h-fit place-items-center border border-navy-200 bg-white p-8 text-center">
        <h3 className="font-display text-lg font-semibold text-navy-900">Inscripción registrada</h3>
        <p className="mt-2 max-w-sm text-sm text-navy-600">
          En esta versión del sitio el formulario aún no envía la inscripción. Escríbale al
          asistente y le confirmamos el cupo.
        </p>
        <ExternalButton href={agentUrl({ page: 'formación y eventos' })} className="mt-5">
          <WhatsAppIcon />
          Confirmar por WhatsApp
        </ExternalButton>
        <Button tone="ghost" className="mt-2 text-[13px]" onClick={() => setSent(false)}>
          Volver al formulario
        </Button>
      </div>
    );
  }

  const control =
    'mt-1 w-full border border-navy-200 bg-white px-3 py-2.5 text-[15px] text-navy-900 focus:border-navy-500 focus:outline-none';
  const labelText = 'text-xs font-semibold tracking-wide text-navy-600 uppercase';

  return (
    <form onSubmit={handleSubmit} className="h-fit border border-navy-200 bg-white p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={labelText}>Sesión de interés</span>
          <select name="sesion" className={control} required>
            <option value="">Seleccione…</option>
            {SESSIONS.map((session) => (
              <option key={session.title}>{session.title}</option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelText}>Nombre</span>
          <input name="nombre" className={control} required />
        </label>
        <label>
          <span className={labelText}>Cargo</span>
          <input name="cargo" className={control} />
        </label>
        <label className="sm:col-span-2">
          <span className={labelText}>Institución</span>
          <input name="institucion" className={control} required />
        </label>
        <label>
          <span className={labelText}>Correo institucional</span>
          <input name="email" type="email" className={control} required />
        </label>
        <label>
          <span className={labelText}>Participantes</span>
          <input name="participantes" type="number" min={1} defaultValue={1} className={control} />
        </label>
      </div>
      <Button type="submit" className="mt-5 w-full">
        Reservar cupo
      </Button>
    </form>
  );
}

/** Datos de ejemplo. Se reemplazan con la agenda real de Esteripac. */
const SESSIONS = [
  {
    title: 'Lectura e interpretación de indicadores químicos según ISO 11140',
    summary:
      'Diferencia entre Tipo 1, 4, 5 y 6, qué respalda cada uno y cuál corresponde según lo que se necesita demostrar en la liberación de carga.',
    when: 'Por confirmar',
    format: 'Webinar',
    state: 'Próxima' as const,
  },
  {
    title: 'Prueba de Bowie-Dick: cuándo el resultado obliga a detener el autoclave',
    summary:
      'Criterios de EN 285 y ANSI/AAMI ST79, lectura del paquete de prueba y qué hacer ante un resultado no conforme.',
    when: 'Por confirmar',
    format: 'Presencial',
    state: 'Próxima' as const,
  },
  {
    title: 'Monitoreo de limpieza y proteína residual bajo ISO 15883',
    summary:
      'Control de lavado, valor A0 en termo-desinfección y cuantificación de proteína en µg/cm² para auditoría.',
    when: 'Sesión grabada',
    format: 'Webinar',
    state: 'Grabada' as const,
  },
  {
    title: 'Puesta en marcha de auto-lectoras y trazabilidad digital del DPE',
    summary:
      'Configuración de programas de incubación, integración con Bionova Cloud y armado del registro auditable del servicio.',
    when: 'Sesión grabada',
    format: 'Webinar',
    state: 'Grabada' as const,
  },
];
