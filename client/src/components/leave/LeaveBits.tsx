import { HeartPulse, Palmtree, Coffee, type LucideIcon } from 'lucide-react';
import { LEAVE_ENTITLEMENT, LEAVE_TYPES, LEAVE_TYPE_LABELS } from '../../lib/constants';
import { cx, plural } from '../../lib/format';
import type { LeaveBalance, LeaveEmployee, LeaveType } from '../../types';
import { LEAVE_TYPE_TONES } from '../ui/Badge';
import { Avatar, Meter } from '../ui/Layout';

export const LEAVE_TYPE_ICONS: Record<LeaveType, LucideIcon> = {
  annual: Palmtree,
  sick: HeartPulse,
  casual: Coffee,
};

/** Round icon tile for a leave type. */
export function LeaveTypeIcon({ type, className }: { type: LeaveType; className?: string }) {
  const Icon = LEAVE_TYPE_ICONS[type];
  return (
    <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', LEAVE_TYPE_TONES[type].icon, className)}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

/**
 * Remaining days per leave type. The meter shows what is left of the standard
 * yearly entitlement; balances above it (set by an admin) show as full.
 */
export function LeaveBalanceSummary({ balance, compact = false }: { balance: LeaveBalance; compact?: boolean }) {
  // Compact is the narrow, stacked variant used in side panels.
  if (compact) {
    return (
      <dl className="divide-y divide-slate-100">
        {LEAVE_TYPES.map((type) => {
          const remaining = balance[type] ?? 0;
          const entitlement = Math.max(LEAVE_ENTITLEMENT[type], remaining);
          return (
            <div key={type} className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
              <LeaveTypeIcon type={type} className="h-8 w-8" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-sm font-medium text-slate-700">{LEAVE_TYPE_LABELS[type]}</dt>
                  <dd className="text-xs text-slate-500">
                    <span className="text-sm font-semibold tabular-nums text-slate-900">{remaining}</span> / {entitlement}
                  </dd>
                </div>
                <dd className="mt-1.5">
                  <Meter
                    value={remaining}
                    max={entitlement}
                    label={`${LEAVE_TYPE_LABELS[type]} leave remaining`}
                    barClassName={LEAVE_TYPE_TONES[type].bar}
                    className="h-1.5"
                  />
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    );
  }

  return (
    <dl className="grid gap-3 sm:grid-cols-3 sm:gap-4">
      {LEAVE_TYPES.map((type) => {
        const remaining = balance[type] ?? 0;
        const entitlement = Math.max(LEAVE_ENTITLEMENT[type], remaining);
        const tone = LEAVE_TYPE_TONES[type];
        return (
          <div
            key={type}
            className={cx(
              'relative overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-br to-white p-5 shadow-card',
              tone.soft
            )}
          >
            <div className="flex items-center justify-between">
              <dt className="text-sm font-semibold text-slate-700">{LEAVE_TYPE_LABELS[type]} leave</dt>
              <LeaveTypeIcon type={type} />
            </div>
            <dd className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tabular-nums tracking-tight text-slate-900">{remaining}</span>
              <span className="text-sm text-slate-500">of {plural(entitlement, 'day')} left</span>
            </dd>
            <dd className="mt-4">
              <Meter value={remaining} max={entitlement} label={`${LEAVE_TYPE_LABELS[type]} leave remaining`} barClassName={tone.bar} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/** Employee avatar, name and email; leave history outlives deleted accounts. */
export function EmployeeCell({ employee }: { employee: LeaveEmployee | null }) {
  if (!employee) return <span className="italic text-slate-400">Removed user</span>;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={employee.name} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900">{employee.name}</p>
        <p className="truncate text-xs text-slate-500">{employee.email}</p>
      </div>
    </div>
  );
}
