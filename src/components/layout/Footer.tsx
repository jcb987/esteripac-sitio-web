import { Link } from 'react-router-dom';
import { FAMILIES, getProcessesOfFamily } from '@/data/processes';
import { SITE } from '@/config/site';
import { routes } from '@/routes';
import { Container } from '@/components/ui';

export function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-200">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-bold text-white">{SITE.legalName}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-navy-300">{SITE.tagline}</p>
            <p className="mt-4 text-sm text-navy-300">
              {SITE.city}
              <br />
              {SITE.country}
            </p>
          </div>

          {FAMILIES.slice(0, 3).map((family) => (
            <nav key={family.slug} aria-label={family.name}>
              <p className="text-xs font-semibold tracking-[0.14em] text-gold-500 uppercase">
                {family.name}
              </p>
              <ul className="mt-3 space-y-2">
                {getProcessesOfFamily(family.slug).map((process) => (
                  <li key={process.slug}>
                    <Link
                      to={routes.proceso(family.slug, process.slug)}
                      className="text-sm text-navy-200 hover:text-white"
                    >
                      {process.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 grid gap-6 border-t border-navy-700 pt-8 sm:grid-cols-2">
          <nav aria-label="Secciones">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                [routes.soluciones(), 'Soluciones'],
                [routes.catalogo(), 'Catálogo técnico'],
                [routes.conviertaseEnCliente(), 'Conviértase en cliente'],
                [routes.formacion(), 'Formación y eventos'],
                [routes.contacto(), 'Contacto'],
                [routes.politicaPrivacidad(), 'Política de privacidad'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to!} className="text-sm text-navy-200 hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-sm sm:text-right">
            <a href={`mailto:${SITE.email}`} className="text-navy-200 hover:text-white">
              {SITE.email}
            </a>
            <p className="mt-1 text-navy-400">{SITE.hours}</p>
          </div>
        </div>

        <div className="mt-8 space-y-2 border-t border-navy-700 pt-6 text-xs text-navy-400">
          <p>
            Las marcas Chemdye®, Bionova®, Integron® y Cintape® pertenecen a Terragene S.A.{' '}
            {SITE.shortName} las distribuye en Colombia.
          </p>
          <p>
            La información técnica de este sitio proviene del catálogo del fabricante y es de
            carácter informativo. No constituye oferta comercial ni declaración sobre el estado
            regulatorio de los productos.
          </p>
          <p className="pt-2">
            © {new Date().getFullYear()} {SITE.legalName}. Sitio desarrollado por{' '}
            <a
              href={SITE.agency.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-300 hover:text-white"
            >
              {SITE.agency.name}
            </a>
            .
          </p>
        </div>
      </Container>
    </footer>
  );
}
