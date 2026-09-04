import { Link } from 'react-router-dom';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-6xl px-4 sm:px-6', className)}>{children}</div>;
}

export function Section({
  children,
  tone = 'white',
  className,
}: {
  children: ReactNode;
  tone?: 'white' | 'mist' | 'navy';
  className?: string;
}) {
  const tones = {
    white: 'bg-white',
    mist: 'bg-navy-50',
    navy: 'bg-navy-900 text-navy-100',
  } as const;
  return (
    <section className={cx(tones[tone], 'py-12 sm:py-16', className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = 'light',
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <header className="max-w-2xl">
      {eyebrow && (
        <p
          className={cx(
            'mb-2 text-xs font-semibold tracking-[0.14em] uppercase',
            tone === 'dark' ? 'text-gold-500' : 'text-navy-500',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cx(
          'text-2xl leading-tight font-semibold tracking-tight sm:text-3xl',
          tone === 'dark' && 'text-white',
        )}
      >
        {title}
      </h2>
      {lead && (
        <p className={cx('mt-3 text-[15px]', tone === 'dark' ? 'text-navy-200' : 'text-navy-600')}>
          {lead}
        </p>
      )}
    </header>
  );
}

// ---------------------------------------------------------------------------

type ButtonTone = 'primary' | 'secondary' | 'ghost' | 'whatsapp';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50';

const BUTTON_TONES: Record<ButtonTone, string> = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800',
  secondary: 'border border-navy-200 bg-white text-navy-900 hover:border-navy-400 hover:bg-navy-50',
  ghost: 'text-navy-700 hover:bg-navy-50',
  whatsapp: 'bg-gold-500 text-navy-950 hover:bg-gold-300',
};

export function Button({
  tone = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  return <button className={cx(BUTTON_BASE, BUTTON_TONES[tone], className)} {...props} />;
}

export function LinkButton({
  to,
  tone = 'primary',
  className,
  children,
}: {
  to: string;
  tone?: ButtonTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className={cx(BUTTON_BASE, BUTTON_TONES[tone], className)}>
      {children}
    </Link>
  );
}

export function ExternalButton({
  tone = 'whatsapp',
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { tone?: ButtonTone }) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cx(BUTTON_BASE, BUTTON_TONES[tone], className)}
      {...props}
    >
      {children}
    </a>
  );
}

// ---------------------------------------------------------------------------

export function Badge({
  children,
  tone = 'outline',
  className,
  title,
}: {
  children: ReactNode;
  tone?: 'outline' | 'solid' | 'gold' | 'muted';
  className?: string;
  title?: string;
}) {
  const tones = {
    outline: 'border border-navy-200 text-navy-700',
    solid: 'bg-navy-900 text-white',
    gold: 'bg-gold-500 text-navy-950',
    muted: 'bg-navy-50 text-navy-600',
  } as const;
  return (
    <span
      title={title}
      className={cx(
        'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Sello FDA. Solo se renderiza donde el catálogo lo declara. */
export function BadgeFDA() {
  return (
    <Badge tone="gold" title="Aprobado por la FDA según el catálogo del fabricante">
      <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3">
        <path
          d="M2.5 6.2 4.6 8.4 9.5 3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Aprobado por FDA
    </Badge>
  );
}
