import { LEAVE_ENTITLEMENT, LEAVE_TYPES, LEAVE_TYPE_LABELS } from '../../lib/constants';
import { plural } from '../../lib/format';
import type { LeaveBalance, LeaveEmployee } from '../../types';
import { Meter } from '../ui/Layout';

/**
 * Remaining days per leave type. The meter shows what is left of the standard
 * yearly entitlement; balances above it (set by an admin) show as full.
 */
export function LeaveBalanceSummary({ balance, compact = false }: { balance: LeaveBalance; compact?: boolean }) {
  // Compact is the narrow, stacked variant used in side panels.
  return (
    <dl className={compact ? 'grid divide-y divide-slate-200' : 'grid divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0'}>
      {LEAVE_TYPES.map((type) => {
        const remaining = balance[type] ?? 0;
        const entitlement = Math.max(LEAVE_ENTITLEMENT[type], remaining);
        return (
          <div key={type} className={compact ? 'px-4 py-3' : 'px-4 py-4 sm:px-5'}>
            <dt className="text-xs font-medium text-slate-500">{LEAVE_TYPE_LABELS[type]} leave</dt>
            <dd className="mt-1 flex items-baseline gap-1.5">
              <span className={compact ? 'text-lg font-semibold tabular-nums' : 'text-2xl font-semibold tabular-nums tracking-tight'}>
                {remaining}
              </span>
              <span className="text-xs text-slate-500">of {plural(entitlement, 'day')} left</span>
            </dd>
            <dd className="mt-2">
              <Meter value={remaining} max={entitlement} label={`${LEAVE_TYPE_LABELS[type]} leave remaining`} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/** Employee name and email; leave history outlives deleted accounts. */
export function EmployeeCell({ employee }: { employee: LeaveEmployee | null }) {
  if (!employee) return <span className="italic text-slate-400">Removed user</span>;
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-slate-900">{employee.name}</p>
      <p className="truncate text-xs text-slate-500">{employee.email}</p>
    </div>
  );
}
