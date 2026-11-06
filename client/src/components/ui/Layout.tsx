import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx, initials } from '../../lib/format';

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px] sm:leading-9">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** A card section with an optional title row. The single container style used across pages. */
export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  icon: Icon,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  icon?: LucideIcon;
}) {
  return (
    <section className={cx('overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>}
              {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
            </div>
          </div>
          {actions}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export type Tone = 'brand' | 'amber' | 'emerald' | 'rose' | 'sky' | 'violet' | 'slate';

export const TONE_ICON: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-600 ring-brand-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  rose: 'bg-rose-50 text-rose-600 ring-rose-100',
  sky: 'bg-sky-50 text-sky-600 ring-sky-100',
  violet: 'bg-violet-50 text-violet-600 ring-violet-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export interface StatItem {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
}

/** A row of KPI cards. */
export function StatGroup({ items, className }: { items: StatItem[]; className?: string }) {
  const cols = items.length >= 4 ? 'lg:grid-cols-4' : items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
  return (
    <dl className={cx('grid grid-cols-2 gap-3 sm:gap-4', cols, className)}>
      {items.map(({ label, value, hint, icon: Icon, tone = 'brand' }) => (
        <div
          key={label}
          className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-card transition-shadow hover:shadow-raised sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <dt className="text-[13px] font-medium text-slate-500">{label}</dt>
            {Icon && (
              <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset', TONE_ICON[tone])}>
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
            )}
          </div>
          <dd className="mt-2 text-[28px] font-bold leading-none tabular-nums tracking-tight text-slate-900">{value}</dd>
          {hint && <dd className="mt-2 truncate text-xs text-slate-500">{hint}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function Meter({
  value,
  max,
  label,
  className,
  barClassName = 'bg-brand-500',
}: {
  value: number;
  max: number;
  label: string;
  className?: string;
  barClassName?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cx('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}
    >
      <div className={cx('h-full rounded-full transition-[width] duration-500', barClassName)} style={{ width: `${pct}%` }} />
    </div>
  );
}

const AVATAR_COLORS = [
  'bg-brand-100 text-brand-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
];

/** Picks a stable colour for a name so the same person always looks the same. */
const avatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-white',
        avatarColor(name),
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
    <div role="group" aria-label={label} className="inline-flex max-w-full overflow-x-auto rounded-lg bg-slate-100 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cx(
              'inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-xs font-semibold transition-all',
              active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cx(
                  'rounded-full px-1.5 py-px text-[10px] tabular-nums',
                  active ? 'bg-brand-50 text-brand-700' : 'bg-slate-200/70 text-slate-500'
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
