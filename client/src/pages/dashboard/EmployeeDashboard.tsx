import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, CheckCircle2, FileText, History, Plus, XCircle } from 'lucide-react';
import { useAppSelector } from '../../store';
import { leavesApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import { BarChart, SERIES_COLORS } from '../../components/charts/Charts';
import { LeaveBalanceSummary, LeaveTypeIcon } from '../../components/leave/LeaveBits';
import { StatusBadge } from '../../components/ui/Badge';
import { ButtonLink } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState, StatsSkeleton } from '../../components/ui/Feedback';
import { Panel, StatGroup } from '../../components/ui/Layout';
import { BannerFigure, WelcomeBanner, bannerButton, bannerGhostButton } from '../../components/ui/WelcomeBanner';
import { LEAVE_TYPES, LEAVE_TYPE_LABELS } from '../../lib/constants';
import { formatDateRange, monthLabels } from '../../lib/dates';
import { greeting, plural } from '../../lib/format';

export default function EmployeeDashboard() {
  const user = useAppSelector((s) => s.auth.user)!;
  const live = useLiveUpdates();
  const { data: stats, loading, error, reload } = useAsync(() => leavesApi.employeeStats(), [live]);

  const daysTaken = stats ? stats.daysTaken.annual + stats.daysTaken.sick + stats.daysTaken.casual : 0;
  const daysLeft = LEAVE_TYPES.reduce((sum, t) => sum + (user.leaveBalance[t] ?? 0), 0);

  return (
    <>
      <WelcomeBanner
        title={`${greeting()}, ${user.name.split(' ')[0]} 👋`}
        description={`${user.position} · ${user.department}`}
        actions={
          <>
            <Link to="/leave/apply" className={bannerButton}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Request leave
            </Link>
            <Link to="/leave/history" className={bannerGhostButton}>
              <History className="h-4 w-4" aria-hidden="true" />
              My history
            </Link>
          </>
        }
        aside={<BannerFigure label="Days available" value={daysLeft} hint="Across all leave types" />}
      />

      <div className="space-y-8">
        <section aria-labelledby="balance-heading">
          <h2 id="balance-heading" className="mb-4 text-base font-semibold text-slate-900">
            Leave balance
          </h2>
          <LeaveBalanceSummary balance={user.leaveBalance} />
        </section>

        {loading && !stats ? (
          <StatsSkeleton />
        ) : error && !stats ? (
          <Panel>
            <ErrorState message={error} onRetry={reload} />
          </Panel>
        ) : (
          stats && (
            <>
              <StatGroup
                items={[
                  { label: 'Total requests', value: stats.counts.total, hint: 'All time', icon: FileText, tone: 'brand' },
                  { label: 'Pending', value: stats.counts.pending, hint: 'Awaiting a decision', icon: CalendarClock, tone: 'amber' },
                  {
                    label: 'Approved',
                    value: stats.counts.approved,
                    hint: `${plural(daysTaken, 'day')} taken`,
                    icon: CheckCircle2,
                    tone: 'emerald',
                  },
                  { label: 'Rejected', value: stats.counts.rejected, hint: 'All time', icon: XCircle, tone: 'rose' },
                ]}
              />

              <div className="grid gap-6 lg:grid-cols-5">
                <Panel
                  title="Recent requests"
                  description="Your latest leave activity"
                  className="lg:col-span-3"
                  actions={
                    stats.recent.length > 0 && (
                      <Link
                        to="/leave/history"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        View all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    )
                  }
                >
                  {stats.recent.length === 0 ? (
                    <EmptyState
                      icon={CalendarClock}
                      title="No leave requests yet"
                      description="Requests you submit appear here with their status."
                      action={
                        <ButtonLink to="/leave/apply" size="sm" icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
                          Request leave
                        </ButtonLink>
                      }
                    />
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {stats.recent.map((leave) => (
                        <li key={leave._id} className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-slate-50/70 sm:px-6">
                          <LeaveTypeIcon type={leave.leaveType} />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900">
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

                <Panel title="Requests per month" description="Last 12 months" className="lg:col-span-2" bodyClassName="p-4 sm:p-6">
                  <BarChart
                    title="Leave requests per month, last 12 months"
                    labels={monthLabels(stats.monthly)}
                    series={[{ label: 'Requests', data: stats.monthly.map((p) => p.count), color: SERIES_COLORS.primary }]}
                    height={240}
                  />
                </Panel>
              </div>
            </>
          )
        )}
        {loading && !stats && (
          <Panel>
            <LoadingState rows={3} />
          </Panel>
        )}
      </div>
    </>
  );
}
