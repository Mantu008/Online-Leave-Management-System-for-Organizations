import type { ReactNode } from 'react';
import { cx, initials } from '../../lib/format';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** A bordered section with an optional title row. The single container style used across pages. */
export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cx('overflow-hidden rounded-lg border border-slate-200 bg-white', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div>
            {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export interface StatItem {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}

/** A row of figures in one panel, separated by hairlines rather than separate cards. */
export function StatGroup({ items, className }: { items: StatItem[]; className?: string }) {
  const cols = items.length >= 4 ? 'lg:grid-cols-4' : items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
  return (
    <dl
      className={cx(
        'grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-white',
        cols,
        '[&>div]:border-slate-200 [&>div]:border-b [&>div]:border-r',
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="-mb-px -mr-px px-4 py-4 sm:px-5">
          <dt className="text-xs font-medium text-slate-500">{item.label}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{item.value}</dd>
          {item.hint && <dd className="mt-0.5 text-xs text-slate-500">{item.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function Meter({ value, max, label, className }: { value: number; max: number; label: string; className?: string }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cx('h-1.5 w-full overflow-hidden rounded-full bg-slate-100', className)}
    >
      <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700',
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

/** Mutually exclusive filter buttons. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: Array<{ value: T; label: string; count?: number }>;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 shadow-sm">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cx(
              'inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors',
              active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={cx('tabular-nums', active ? 'text-slate-300' : 'text-slate-400')}>{option.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
