import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, Inbox, type LucideIcon } from 'lucide-react';
import { cx } from '../../lib/format';

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx('animate-spin text-current', className ?? 'h-5 w-5')} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** A shimmering placeholder block. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'relative block overflow-hidden rounded-md bg-slate-200/70',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        className
      )}
    />
  );
}

/** Placeholder rows shaped like a list or table while data loads. */
export function LoadingState({
  label = 'Loading…',
  className,
  rows = 4,
}: {
  label?: string;
  className?: string;
  rows?: number;
}) {
  return (
    <div role="status" className={cx('space-y-1 px-4 py-4 sm:px-5', className)}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
        </div>
      ))}
    </div>
  );
}

/** Full-area spinner, used while a lazily loaded page is fetched. */
export function PageLoader({ className }: { className?: string }) {
  return (
    <div role="status" className={cx('flex min-h-[40vh] items-center justify-center text-brand-600', className)}>
      <Spinner className="h-7 w-7" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Placeholder for a row of stat cards. */
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <span className="sr-only">Loading figures…</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="mt-4 h-3 w-20" />
          <Skeleton className="mt-2.5 h-7 w-14" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cx('flex min-h-[12rem] flex-col items-center justify-center gap-3 px-6 py-10 text-center', className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 ring-8 ring-rose-50/50">
        <AlertCircle className="h-6 w-6 text-rose-500" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold text-slate-900">Something went wrong</p>
        <p className="mt-1 max-w-md text-slate-500">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 hover:text-brand-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className={cx('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-50 to-white ring-1 ring-brand-100">
        <Icon className="h-6 w-6 text-brand-500" aria-hidden="true" />
      </span>
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

type Tone = 'error' | 'info' | 'success';

const ALERT_TONES: Record<Tone, { icon: LucideIcon; className: string }> = {
  error: { icon: AlertCircle, className: 'border-rose-200 bg-rose-50 text-rose-800' },
  info: { icon: Info, className: 'border-sky-200 bg-sky-50 text-sky-900' },
  success: { icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
};

export function Alert({ tone = 'error', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const { icon: Icon, className: toneClass } = ALERT_TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx('flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm', toneClass, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
