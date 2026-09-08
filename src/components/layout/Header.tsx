import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FAMILIES, getProcessesOfFamily } from '@/data/processes';
import { routes } from '@/routes';
import { SITE } from '@/config/site';
import { agentUrl } from '@/lib/whatsapp';
import { Container, cx, ExternalButton } from '@/components/ui';

const NAV = [
  { to: routes.soluciones(), label: 'Soluciones' },
  { to: routes.catalogo(), label: 'Catálogo técnico' },
  { to: routes.conviertaseEnCliente(), label: 'Conviértase en cliente' },
  { to: routes.formacion(), label: 'Formación' },
  { to: routes.contacto(), label: 'Contacto' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Cerrar el menú al navegar: en móvil el panel tapa la página entera.
  useEffect(() => setOpen(false), [location.pathname, location.search]);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to={routes.home()} className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg font-bold tracking-tight text-navy-900">
            Esteripac
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cx(
                  'rounded-sm px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-navy-900 shadow-[inset_0_-2px_0_0_var(--color-gold-500)]'
                    : 'text-navy-600 hover:text-navy-900',
                )
              }
              end={item.to === routes.catalogo()}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ExternalButton
            href={agentUrl({ page: 'la barra de navegación' })}
            className="hidden sm:inline-flex"
          >
            <WhatsAppIcon />
            Asistente técnico
          </ExternalButton>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="rounded-sm p-2 text-navy-800 hover:bg-navy-50 lg:hidden"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </Container>

      <div
        id="menu-movil"
        hidden={!open}
        className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-navy-100 bg-white lg:hidden"
      >
        <Container className="py-4">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className="block rounded-sm px-2 py-2.5 text-[15px] font-medium text-navy-800 hover:bg-navy-50"
                  end={item.to === routes.catalogo()}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <p className="mt-5 mb-2 px-2 text-xs font-semibold tracking-[0.14em] text-navy-500 uppercase">
            Entrar por proceso
          </p>
          <ul className="space-y-3">
            {FAMILIES.map((family) => (
              <li key={family.slug}>
                <Link
                  to={routes.familia(family.slug)}
                  className="block px-2 text-sm font-semibold text-navy-900"
                >
                  {family.name}
                </Link>
                <ul className="mt-1 flex flex-wrap gap-1.5 px-2">
                  {getProcessesOfFamily(family.slug)
                    .filter((process) => process.slug !== family.slug)
                    .map((process) => (
                      <li key={process.slug}>
                        <Link
                          to={routes.proceso(family.slug, process.slug)}
                          className="inline-block rounded-sm bg-navy-50 px-2 py-1 text-[13px] text-navy-700"
                        >
                          {process.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>

          <ExternalButton
            href={agentUrl({ page: 'el menú móvil' })}
            className="mt-5 w-full sm:hidden"
          >
            <WhatsAppIcon />
            Consultar con el asistente
          </ExternalButton>
          <p className="mt-4 px-2 text-xs text-navy-500">{SITE.city}</p>
        </Container>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8">
      <rect width="32" height="32" rx="3" className="fill-navy-900" />
      <path d="M9 10h14M9 16h10M9 22h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="23" cy="16" r="2.4" className="fill-gold-500" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cx('size-4 shrink-0', className)}>
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.21.89 2.39 1.01 2.55.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
