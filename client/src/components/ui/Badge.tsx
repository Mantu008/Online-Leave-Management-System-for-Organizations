import type { ReactNode } from 'react';
import { LEAVE_TYPE_LABELS, STATUS_LABELS } from '../../lib/constants';
import { cx } from '../../lib/format';
import type { LeaveStatus, LeaveType } from '../../types';

const statusStyles: Record<LeaveStatus, { badge: string; dot: string }> = {
  approved: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  pending: { badge: 'bg-amber-50 text-amber-700 ring-amber-600/25', dot: 'bg-amber-500' },
  rejected: { badge: 'bg-rose-50 text-rose-700 ring-rose-600/20', dot: 'bg-rose-500' },
};

/** Status is always shown as text; the colour only reinforces it. */
export function StatusBadge({ status }: { status: LeaveStatus }) {
  const style = statusStyles[status];
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        style.badge
      )}
    >
      <span className={cx('h-1.5 w-1.5 rounded-full', style.dot, status === 'pending' && 'animate-pulse')} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}

/** Per-type accent used for leave type chips, icons and the balance cards. */
export const LEAVE_TYPE_TONES: Record<LeaveType, { chip: string; icon: string; bar: string; soft: string }> = {
  annual: { chip: 'bg-sky-50 text-sky-700 ring-sky-600/20', icon: 'bg-sky-100 text-sky-600', bar: 'bg-sky-500', soft: 'from-sky-50' },
  sick: { chip: 'bg-rose-50 text-rose-700 ring-rose-600/20', icon: 'bg-rose-100 text-rose-600', bar: 'bg-rose-500', soft: 'from-rose-50' },
  casual: {
    chip: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    icon: 'bg-violet-100 text-violet-600',
    bar: 'bg-violet-500',
    soft: 'from-violet-50',
  },
};

export function LeaveTypeBadge({ type }: { type: LeaveType }) {
  return (
    <span
      className={cx(
        'inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        LEAVE_TYPE_TONES[type].chip
      )}
    >
      {LEAVE_TYPE_LABELS[type]}
    </span>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center whitespace-nowrap rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200',
        className
      )}
    >
      {children}
    </span>
  );
}
