import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-navy-500">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && (
              <span aria-hidden="true" className="text-navy-300">
                /
              </span>
            )}
            {item.to ? (
              <Link to={item.to} className="hover:text-navy-800">
                {item.label}
              </Link>
            ) : (
              <span className="text-navy-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
