import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppSelector } from '../../store';
import { leavesApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { EmployeeCell } from '../../components/leave/LeaveBits';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { PageHeader, Panel } from '../../components/ui/Layout';
import { Table, TBody, Td, Th, THead } from '../../components/ui/Table';
import { LEAVE_TYPE_LABELS } from '../../lib/constants';
import { formatDateRange, monthLabel, overlapsMonth } from '../../lib/dates';

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
      <PageHeader title="Team calendar" description={`Approved and pending leave in ${department}.`} />

      <Panel
        title={title}
        actions={
          <div className="flex items-center gap-1">
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
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : absences.length === 0 ? (
          <EmptyState title="No one is off this month" description="Approved and pending leave will show here." />
        ) : (
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
                  <Td className="max-w-[14rem]">
                    <EmployeeCell employee={leave.employee} />
                  </Td>
                  <Td className="whitespace-nowrap font-medium text-slate-900">{formatDateRange(leave.startDate, leave.endDate)}</Td>
                  <Td className="text-right tabular-nums">{leave.totalDays}</Td>
                  <Td>{LEAVE_TYPE_LABELS[leave.leaveType]}</Td>
                  <Td>
                    <StatusBadge status={leave.status} />
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Panel>
    </>
  );
}
