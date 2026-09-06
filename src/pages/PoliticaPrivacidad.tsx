import { SITE } from '@/config/site';
import { routes } from '@/routes';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Container, Section, SectionHeading } from '@/components/ui';

/**
 * Política de privacidad.
 *
 * Describe el tratamiento de datos real del sitio y del asistente de
 * WhatsApp — no es una plantilla genérica. Se actualiza si cambia lo que
 * el bot recoge, con quién se integra, o el marco legal aplicable.
 *
 * Requerida por Meta para publicar la app de WhatsApp Business Platform:
 * sin esta URL, la app queda en modo desarrollo y no entrega mensajes
 * reales al webhook.
 */
export function PoliticaPrivacidad() {
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs
          items={[{ label: 'Inicio', to: routes.home() }, { label: 'Política de privacidad' }]}
        />
      </Container>

      <Section>
        <SectionHeading
          eyebrow="Vigente desde septiembre de 2026"
          title="Política de privacidad"
          lead={`Cómo ${SITE.legalName} recoge, usa y protege los datos de quienes visitan este sitio o escriben a nuestro asistente de WhatsApp.`}
        />

        <div className="prose prose-navy mt-10 max-w-2xl space-y-8 text-[15px] leading-relaxed text-navy-700">
          <section>
            <h2 className="font-display text-lg font-semibold text-navy-900">
              1. Responsable del tratamiento
            </h2>
            <p className="mt-2">
              {SITE.legalName}, con domicilio en {SITE.city}, {SITE.country}, es responsable de los
              datos personales tratados a través de este sitio web y del canal de WhatsApp. Puede
              contactarnos en{' '}
              <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">
                {SITE.email}
              </a>{' '}
              para cualquier consulta sobre esta política.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-navy-900">
              2. Qué datos recogemos
            </h2>
            <p className="mt-2">Según el canal por el que nos contacte:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Asistente de WhatsApp:</strong> su número de teléfono y el contenido de los
                mensajes que nos envía. Si en la conversación indica voluntariamente datos como
                institución, NIT, referencia de interés, cantidad o ciudad, esos datos también se
                registran para poder atenderlo.
              </li>
              <li>
                <strong>Formularios del sitio</strong> ("Conviértase en cliente", "Formación y
                eventos"): en esta versión del sitio, esos formularios no envían información a
                ningún servidor — se muestran a modo informativo. Actualizaremos esta política
                cuando entren en funcionamiento.
              </li>
              <li>
                <strong>Navegación:</strong> este sitio no usa cookies de rastreo ni analítica de
                terceros.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-navy-900">
              3. Para qué usamos sus datos
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Responder consultas técnicas sobre el catálogo de productos.</li>
              <li>
                Calificar solicitudes comerciales y, cuando corresponde, orientarlo hacia la
                apertura de una cuenta institucional.
              </li>
              <li>
                Derivar la conversación a una persona de Esteripac cuando el caso lo requiere
                (reclamos, negociación de condiciones, o cualquier situación que el asistente no
                pueda resolver por sí mismo).
              </li>
              <li>
                Mantener el historial de la conversación para no pedirle que repita información ya
                entregada.
              </li>
            </ul>
            <p className="mt-3">
              El asistente no publica precios ni inventa disponibilidad, tiempos de entrega o
              condiciones que no estén en nuestro catálogo — es una política del negocio, no solo
              una limitación técnica.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-navy-900">
              4. Con quién compartimos sus datos
            </h2>
            <p className="mt-2">
              El asistente de WhatsApp se apoya en tres proveedores para funcionar. Ninguno de los
              tres tiene relación comercial directa con usted; cada uno procesa los datos únicamente
              para prestarnos el servicio contratado:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Meta (WhatsApp Business Platform):</strong> transporta los mensajes entre
                usted y nuestro asistente.
              </li>
              <li>
                <strong>Anthropic:</strong> procesa el texto de la conversación para generar las
                respuestas del asistente.
              </li>
              <li>
                <strong>Railway:</strong> aloja la infraestructura donde se almacena el historial de
                conversaciones.
              </li>
            </ul>
            <p className="mt-3">
              No vendemos ni cedemos sus datos a terceros con fines publicitarios.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-navy-900">
              5. Cuánto tiempo conservamos sus datos
            </h2>
            <p className="mt-2">
              Conservamos el historial de la conversación mientras exista una relación comercial
              activa o potencial con usted o su institución. Puede solicitar la eliminación de sus
              datos en cualquier momento, según se explica en la sección 7.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-navy-900">
              6. Cómo dejar de recibir mensajes
            </h2>
            <p className="mt-2">
              Puede solicitar en cualquier momento que dejemos de escribirle por WhatsApp. Basta con
              indicarlo en la conversación; a partir de ese momento el asistente no le enviará más
              mensajes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-navy-900">7. Sus derechos</h2>
            <p className="mt-2">
              De acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia, usted tiene
              derecho a conocer, actualizar, rectificar y solicitar la eliminación de sus datos
              personales, así como a revocar la autorización otorgada para su tratamiento. Para
              ejercer estos derechos, escríbanos a{' '}
              <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">
                {SITE.email}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-navy-900">
              8. Cambios a esta política
            </h2>
            <p className="mt-2">
              Podemos actualizar esta política a medida que el sitio y el asistente incorporen
              nuevas funciones — por ejemplo, cuando los formularios del sitio empiecen a enviar
              datos a un servidor, o cuando se sumen nuevas integraciones. La fecha de vigencia
              indicada arriba refleja la versión más reciente.
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
