import { useId } from 'react';
import { APP_NAME } from '../../lib/brand';
import { cx } from '../../lib/format';

export function BrandMark({ className = 'h-8 w-8' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id})`} />
      <path d="M9 21.5c3.5 0 4.5-11 8-11 2.2 0 2.8 4.2 6 4.2" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="23" cy="21.5" r="2.2" fill="#a5b4fc" />
    </svg>
  );
}

/** Logo mark plus wordmark. */
export function BrandLogo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <BrandMark />
      <span className={cx('text-[17px] font-bold tracking-tight', inverted ? 'text-white' : 'text-slate-900')}>{APP_NAME}</span>
    </span>
  );
}
