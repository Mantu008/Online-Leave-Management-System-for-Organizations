import type { ReactNode } from 'react';
import { STATUS_LABELS } from '../../lib/constants';
import { cx } from '../../lib/format';
import type { LeaveStatus } from '../../types';

const statusStyles: Record<LeaveStatus, { badge: string; dot: string }> = {
  approved: { badge: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20', dot: 'bg-emerald-600' },
  pending: { badge: 'bg-amber-50 text-amber-800 ring-amber-600/25', dot: 'bg-amber-500' },
  rejected: { badge: 'bg-rose-50 text-rose-800 ring-rose-600/20', dot: 'bg-rose-600' },
};

/** Status is always shown as text; the colour only reinforces it. */
export function StatusBadge({ status }: { status: LeaveStatus }) {
  const style = statusStyles[status];
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', style.badge)}>
      <span className={cx('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200', className)}>
      {children}
    </span>
  );
}
