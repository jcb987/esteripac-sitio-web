import type { ColorShift as ColorShiftData } from '@/data/types';

/**
 * Viraje del indicador: color inicial -> color tras un proceso conforme.
 * Los valores salen de los swatches impresos en el catálogo del fabricante.
 */
export function ColorShift({ shift }: { shift: ColorShiftData }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2.5">
        <Swatch color={shift.from} label="Color inicial" />
        <svg viewBox="0 0 24 12" aria-hidden="true" className="h-3 w-6 text-navy-300">
          <path
            d="M1 6h20m0 0-5-4m5 4-5 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <Swatch color={shift.to} label="Color final" />
      </div>
      {shift.note && <p className="text-[13px] text-navy-500">{shift.note}</p>}
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="size-5 shrink-0 rounded-sm ring-1 ring-navy-200 ring-inset"
        style={{ backgroundColor: color }}
        role="img"
        aria-label={`${label}: ${color}`}
      />
      <code className="font-mono text-[12px] text-navy-500">{color}</code>
    </span>
  );
}
