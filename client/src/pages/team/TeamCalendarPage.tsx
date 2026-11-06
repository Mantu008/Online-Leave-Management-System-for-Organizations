import { useMemo, useState } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppSelector } from '../../store';
import { leavesApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { EmployeeCell } from '../../components/leave/LeaveBits';
import { LEAVE_TYPE_TONES, LeaveTypeBadge, StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { Avatar, PageHeader, Panel } from '../../components/ui/Layout';
import { Table, TBody, Td, Th, THead } from '../../components/ui/Table';
import { LEAVE_TYPES, LEAVE_TYPE_LABELS, STATUS_LABELS } from '../../lib/constants';
import { formatDateRange, monthLabel, overlapsMonth } from '../../lib/dates';
import { cx } from '../../lib/format';
import type { LeaveRequest } from '../../types';

/** Month timeline: one row per absence, a bar across the days it covers. */
function MonthTimeline({ absences, year, month }: { absences: LeaveRequest[]; year: number; month: number }) {
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const now = new Date();
  const today = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : null;
  const isWeekend = (d: number) => {
    const wd = new Date(Date.UTC(year, month, d)).getUTCDay();
    return wd === 0 || wd === 6;
  };
  const columns = `minmax(11rem, 14rem) repeat(${daysInMonth}, minmax(1.6rem, 1fr))`;

  const span = (leave: LeaveRequest) => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const first = start.getUTCFullYear() < year || (start.getUTCFullYear() === year && start.getUTCMonth() < month) ? 1 : start.getUTCDate();
    const last = end.getUTCFullYear() > year || (end.getUTCFullYear() === year && end.getUTCMonth() > month) ? daysInMonth : end.getUTCDate();
    return { first, last };
  };

  return (
    <div aria-hidden="true" className="overflow-x-auto border-b border-slate-100">
      <div className="min-w-[56rem]">
        <div className="grid border-b border-slate-100 bg-slate-50/80" style={{ gridTemplateColumns: columns }}>
          <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:px-6">Team member</div>
          {days.map((d) => (
            <div
              key={d}
              className={cx(
                'py-2 text-center text-[11px] font-semibold tabular-nums',
                d === today ? 'text-brand-600' : isWeekend(d) ? 'text-slate-300' : 'text-slate-500'
              )}
            >
              {d === today ? <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">{d}</span> : d}
            </div>
          ))}
        </div>
        {absences.map((leave) => {
          const { first, last } = span(leave);
          const tone = LEAVE_TYPE_TONES[leave.leaveType];
          return (
            <div key={leave._id} className="relative grid border-b border-slate-50 last:border-0" style={{ gridTemplateColumns: columns }}>
              <div className="flex min-w-0 items-center gap-2.5 px-4 py-2.5 sm:px-6">
                <Avatar name={leave.employee?.name ?? '?'} className="h-7 w-7 text-[10px]" />
                <span className="truncate text-sm font-medium text-slate-800">{leave.employee?.name ?? 'Removed user'}</span>
              </div>
              {days.map((d) => (
                <div
                  key={d}
                  className={cx('border-l border-slate-100', isWeekend(d) && 'bg-slate-50', d === today && 'bg-brand-50/60')}
                  style={{ gridColumn: d + 1, gridRow: 1 }}
                />
              ))}
              <div
                className="flex items-center px-0.5 py-2.5"
                style={{ gridColumn: `${first + 1} / ${last + 2}`, gridRow: 1 }}
                title={`${leave.employee?.name ?? 'Removed user'} · ${LEAVE_TYPE_LABELS[leave.leaveType]} · ${STATUS_LABELS[leave.status]}`}
              >
                <span
                  className={cx(
                    'h-6 w-full rounded-md shadow-sm',
                    tone.bar,
                    leave.status === 'pending' &&
                      'opacity-60 [background-image:repeating-linear-gradient(135deg,rgb(255_255_255/0.35)_0_6px,transparent_6px_12px)]'
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TeamCalendarPage() {
  const department = useAppSelector((s) => s.auth.user?.department);
  const { data, loading, error, reload } = useAsync(() => leavesApi.list(), []);
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const shift = (delta: number) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  // An absence calendar: rejected requests are not absences.
  const absences = useMemo(
    () =>
      (data ?? [])
        .filter((l) => l.status !== 'rejected' && overlapsMonth(l.startDate, l.endDate, cursor.year, cursor.month))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [data, cursor]
  );

  const title = `${monthLabel(cursor.year, cursor.month + 1, 'long')} ${cursor.year}`;
  const isCurrentMonth = cursor.year === now.getFullYear() && cursor.month === now.getMonth();

  return (
    <>
      <PageHeader eyebrow="Planning" title="Team calendar" description={`Approved and pending leave in ${department}.`} />

      <Panel
        title={title}
        icon={CalendarRange}
        actions={
          <div className="flex items-center gap-1.5">
            {!isCurrentMonth && (
              <Button size="sm" variant="ghost" onClick={() => setCursor({ year: now.getFullYear(), month: now.getMonth() })}>
                Today
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => shift(-1)} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => shift(1)} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      >
        {loading && !data ? (
          <LoadingState rows={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : absences.length === 0 ? (
          <EmptyState icon={CalendarRange} title="No one is off this month" description="Approved and pending leave will show here." />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-100 px-4 py-3 text-xs text-slate-600 sm:px-6">
              {LEAVE_TYPES.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <span className={cx('h-2.5 w-2.5 rounded-sm', LEAVE_TYPE_TONES[t].bar)} aria-hidden="true" />
                  {LEAVE_TYPE_LABELS[t]}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm bg-slate-400 opacity-60 [background-image:repeating-linear-gradient(135deg,rgb(255_255_255/0.5)_0_2px,transparent_2px_4px)]"
                  aria-hidden="true"
                />
                Pending
              </span>
            </div>
            <MonthTimeline absences={absences} year={cursor.year} month={cursor.month} />
            <Table caption={`Team leave in ${title}`}>
              <THead>
                <Th>Employee</Th>
                <Th>Dates</Th>
                <Th className="text-right">Days</Th>
                <Th>Leave</Th>
                <Th>Status</Th>
              </THead>
              <TBody>
                {absences.map((leave) => (
                  <tr key={leave._id}>
                    <Td className="max-w-[16rem]">
                      <EmployeeCell employee={leave.employee} />
                    </Td>
                    <Td className="whitespace-nowrap font-medium text-slate-900">{formatDateRange(leave.startDate, leave.endDate)}</Td>
                    <Td className="text-right font-semibold tabular-nums text-slate-900">{leave.totalDays}</Td>
                    <Td>
                      <LeaveTypeBadge type={leave.leaveType} />
                    </Td>
                    <Td>
                      <StatusBadge status={leave.status} />
                    </Td>
                  </tr>
                ))}
              </TBody>
            </Table>
          </>
        )}
      </Panel>
    </>
  );
}
