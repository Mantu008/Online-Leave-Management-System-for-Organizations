import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAppSelector } from '../../store';
import { leavesApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import { BarChart, SERIES_COLORS } from '../../components/charts/Charts';
import { LeaveBalanceSummary } from '../../components/leave/LeaveBits';
import { StatusBadge } from '../../components/ui/Badge';
import { ButtonLink } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { PageHeader, Panel, StatGroup } from '../../components/ui/Layout';
import { LEAVE_TYPE_LABELS } from '../../lib/constants';
import { formatDateRange, monthLabels } from '../../lib/dates';
import { greeting, plural } from '../../lib/format';

export default function EmployeeDashboard() {
  const user = useAppSelector((s) => s.auth.user)!;
  const live = useLiveUpdates();
  const { data: stats, loading, error, reload } = useAsync(() => leavesApi.employeeStats(), [live]);

  const daysTaken = stats ? stats.daysTaken.annual + stats.daysTaken.sick + stats.daysTaken.casual : 0;

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        description={`${user.position} · ${user.department}`}
        actions={
          <ButtonLink to="/leave/apply" icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
            Request leave
          </ButtonLink>
        }
      />

      <div className="space-y-6">
        <Panel title="Leave balance">
          <LeaveBalanceSummary balance={user.leaveBalance} />
        </Panel>

        {loading && !stats ? (
          <LoadingState />
        ) : error && !stats ? (
          <Panel>
            <ErrorState message={error} onRetry={reload} />
          </Panel>
        ) : (
          stats && (
            <>
              <StatGroup
                items={[
                  { label: 'Requests', value: stats.counts.total, hint: 'All time' },
                  { label: 'Pending', value: stats.counts.pending, hint: 'Awaiting a decision' },
                  { label: 'Approved', value: stats.counts.approved, hint: `${plural(daysTaken, 'day')} taken` },
                  { label: 'Rejected', value: stats.counts.rejected },
                ]}
              />

              <div className="grid gap-6 lg:grid-cols-5">
                <Panel
                  title="Recent requests"
                  className="lg:col-span-3"
                  actions={
                    stats.recent.length > 0 && (
                      <Link to="/leave/history" className="text-xs font-medium text-brand-700 hover:text-brand-900 hover:underline">
                        View all
                      </Link>
                    )
                  }
                >
                  {stats.recent.length === 0 ? (
                    <EmptyState
                      title="No leave requests yet"
                      description="Requests you submit appear here with their status."
                    />
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {stats.recent.map((leave) => (
                        <li key={leave._id} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900">
                              {LEAVE_TYPE_LABELS[leave.leaveType]} leave
                              <span className="font-normal text-slate-500"> · {plural(leave.totalDays, 'day')}</span>
                            </p>
                            <p className="text-xs text-slate-500">{formatDateRange(leave.startDate, leave.endDate)}</p>
                          </div>
                          <StatusBadge status={leave.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <Panel title="Requests per month" description="Last 12 months" className="lg:col-span-2" bodyClassName="p-4 sm:p-5">
                  <BarChart
                    title="Leave requests per month, last 12 months"
                    labels={monthLabels(stats.monthly)}
                    series={[{ label: 'Requests', data: stats.monthly.map((p) => p.count), color: SERIES_COLORS.primary }]}
                    height={220}
                  />
                </Panel>
              </div>
            </>
          )
        )}
      </div>
    </>
  );
}
