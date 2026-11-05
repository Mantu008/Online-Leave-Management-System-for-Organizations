import type { ReactNode } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { cx } from '../../lib/format';

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx('animate-spin text-current', className ?? 'h-5 w-5')} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cx('flex min-h-[12rem] items-center justify-center gap-3 text-slate-500', className)}>
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cx('flex min-h-[12rem] flex-col items-center justify-center gap-3 px-6 text-center', className)}>
      <AlertCircle className="h-6 w-6 text-rose-500" aria-hidden="true" />
      <p className="max-w-md text-slate-700">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="text-sm font-medium text-brand-700 hover:text-brand-900 hover:underline">
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
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex flex-col items-center justify-center gap-1 px-6 py-12 text-center', className)}>
      <p className="font-medium text-slate-900">{title}</p>
      {description && <p className="max-w-sm text-slate-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

type Tone = 'error' | 'info';

export function Alert({ tone = 'error', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const Icon = tone === 'error' ? AlertCircle : Info;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx(
        'flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm',
        tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-sky-200 bg-sky-50 text-sky-900',
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
