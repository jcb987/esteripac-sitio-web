import { agentUrl } from '@/lib/whatsapp';
import { routes } from '@/routes';
import { WhatsAppIcon } from '@/components/layout/Header';
import { ExternalButton, LinkButton, Section, SectionHeading } from '@/components/ui';

export function NotFound() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Error 404"
        title="Esta página no existe"
        lead="Puede que la referencia haya cambiado de dirección. Busque el SKU en el catálogo técnico o pregúntele al asistente."
      />
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <LinkButton to={routes.catalogo()}>Ir al catálogo técnico</LinkButton>
        <ExternalButton href={agentUrl()} tone="secondary">
          <WhatsAppIcon />
          Preguntar al asistente
        </ExternalButton>
      </div>
    </Section>
  );
}
