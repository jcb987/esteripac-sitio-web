import { useState, type FormEvent } from 'react';
import { agentUrl } from '@/lib/whatsapp';
import { routes } from '@/routes';
import { SITE } from '@/config/site';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { WhatsAppIcon } from '@/components/layout/Header';
import { Button, Container, ExternalButton, Section, SectionHeading } from '@/components/ui';

/**
 * Explica el flujo de apertura de cuenta institucional.
 *
 * En esta fase es informativa: el formulario valida y confirma en el cliente,
 * pero no envía nada. El backend y la autenticación entran en la fase 2, y el
 * paso 3 describe exactamente lo que el portal va a habilitar.
 */
export function ConviertaseEnCliente() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[{ label: 'Inicio', to: routes.home() }, { label: 'Conviértase en cliente' }]}
        />
      </Container>

      <Section>
        <SectionHeading
          eyebrow="Cuenta institucional"
          title="Cómo se abre una cuenta con Esteripac"
          lead="Esteripac vende a instituciones, no a consumidores finales. La verificación con NIT es lo que habilita precios acordados y reposición sin volver a cotizar cada vez."
        />

        <ol className="mt-10 grid gap-6 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t-2 border-navy-900 pt-5">
              <span className="tabular font-display text-sm font-bold text-gold-600">
                Paso {index + 1}
              </span>
              <h3 className="mt-1 font-display text-lg font-semibold text-navy-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{step.body}</p>
              <ul className="mt-3 space-y-1">
                {step.items.map((item) => (
                  <li key={item} className="flex gap-2 text-[13px] text-navy-700">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1 shrink-0 rounded-full bg-navy-300"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="mist">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="Solicitud"
              title="Deje los datos de su institución"
              lead="Un asesor técnico revisa la solicitud y confirma la activación. Si prefiere resolverlo por chat, el asistente toma los mismos datos."
            />
            <ExternalButton
              href={agentUrl({ page: 'apertura de cuenta institucional' })}
              className="mt-6"
            >
              <WhatsAppIcon />
              Abrir cuenta por WhatsApp
            </ExternalButton>

            <div className="mt-8 border border-navy-200 bg-white p-5">
              <h3 className="font-display text-base font-semibold text-navy-900">
                Qué habilita la cuenta activa
              </h3>
              <ul className="mt-3 space-y-2">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex gap-2.5 text-sm text-navy-700">
                    <svg
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-gold-600"
                    >
                      <path
                        d="M3.5 8.5 6.5 11.5 12.5 4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <SolicitudForm />
        </div>
      </Section>
    </>
  );
}

function SolicitudForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Fase 1 sin backend: se confirma en el cliente y no se envía nada.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="grid h-fit place-items-center border border-navy-200 bg-white p-8 text-center">
        <h3 className="font-display text-lg font-semibold text-navy-900">Solicitud registrada</h3>
        <p className="mt-2 max-w-sm text-sm text-navy-600">
          En esta versión del sitio el formulario todavía no envía la solicitud. Para avanzar hoy,
          escríbale al asistente y le damos trámite de inmediato.
        </p>
        <ExternalButton
          href={agentUrl({ page: 'apertura de cuenta institucional' })}
          className="mt-5"
        >
          <WhatsAppIcon />
          Continuar por WhatsApp
        </ExternalButton>
        <Button tone="ghost" className="mt-2 text-[13px]" onClick={() => setSent(false)}>
          Volver al formulario
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="h-fit border border-navy-200 bg-white p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="razonSocial" label="Razón social" className="sm:col-span-2" required />
        <Field name="nit" label="NIT" inputMode="numeric" required />
        <Field name="institucion" label="Tipo de institución" as="select" required>
          <option value="">Seleccione…</option>
          <option>Hospital o clínica</option>
          <option>Clínica odontológica</option>
          <option>Laboratorio</option>
          <option>Central de esterilización externa</option>
          <option>Otra</option>
        </Field>
        <Field name="contacto" label="Nombre del responsable" required />
        <Field name="cargo" label="Cargo" />
        <Field name="email" label="Correo institucional" type="email" required />
        <Field name="telefono" label="Teléfono" type="tel" inputMode="tel" required />
        <Field name="ciudad" label="Ciudad" className="sm:col-span-2" required />
        <Field
          name="procesos"
          label="Procesos que necesita controlar"
          as="textarea"
          className="sm:col-span-2"
        />
      </div>

      <Button type="submit" className="mt-5 w-full">
        Enviar solicitud
      </Button>
      <p className="mt-3 text-[12px] leading-relaxed text-navy-500">
        Los datos se usan únicamente para verificar la institución y habilitar la cuenta. Escríbanos
        a {SITE.email} para cualquier consulta sobre su tratamiento.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  as = 'input',
  className,
  children,
  ...props
}: {
  name: string;
  label: string;
  as?: 'input' | 'select' | 'textarea';
  className?: string;
  children?: React.ReactNode;
  required?: boolean;
  type?: string;
  inputMode?: 'numeric' | 'tel' | 'search';
}) {
  const control =
    'mt-1 w-full border border-navy-200 bg-white px-3 py-2.5 text-[15px] text-navy-900 focus:border-navy-500 focus:outline-none';

  return (
    <label className={className}>
      <span className="text-xs font-semibold tracking-wide text-navy-600 uppercase">
        {label}
        {props.required && <span className="text-gold-600"> *</span>}
      </span>
      {as === 'select' ? (
        <select name={name} className={control} {...props}>
          {children}
        </select>
      ) : as === 'textarea' ? (
        <textarea name={name} rows={3} className={control} {...props} />
      ) : (
        <input name={name} className={control} {...props} />
      )}
    </label>
  );
}

const STEPS = [
  {
    title: 'Solicitud',
    body: 'Nos comparte los datos de la institución y los procesos que necesita controlar. Con eso el asesor técnico ya puede armar la propuesta correcta.',
    items: ['Razón social y NIT', 'Responsable del servicio', 'Métodos y equipos en uso'],
  },
  {
    title: 'Verificación con NIT',
    body: 'Confirmamos la institución y las condiciones comerciales. Es el paso que separa una cotización suelta de una relación de suministro.',
    items: [
      'Validación de la institución',
      'Condiciones de pago y despacho',
      'Asignación de asesor técnico',
    ],
  },
  {
    title: 'Activación de la cuenta',
    body: 'Queda habilitado el acceso con precios acordados y recompra directa de las referencias que ya usa, sin cotizar de nuevo cada mes.',
    items: [
      'Precios acordados visibles',
      'Recompra de referencias frecuentes',
      'Historial de pedidos y documentos',
    ],
  },
];

const BENEFITS = [
  'Precios acordados visibles al iniciar sesión',
  'Recompra directa de las referencias de consumo habitual',
  'Historial de pedidos y documentación técnica por referencia',
  'Acompañamiento del asesor técnico asignado',
  'Capacitación al personal del servicio',
];
