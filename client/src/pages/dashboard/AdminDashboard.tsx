import { adminApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import { BarChart, SERIES_COLORS } from '../../components/charts/Charts';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { PageHeader, Panel, StatGroup } from '../../components/ui/Layout';
import { plural } from '../../lib/format';
import { monthLabels } from '../../lib/dates';

export default function AdminDashboard() {
  const live = useLiveUpdates();
  const { data: stats, loading, error, reload } = useAsync(() => adminApi.stats(), [live]);

  return (
    <>
      <PageHeader title="Overview" description="Leave activity across the organisation." />

      {loading && !stats ? (
        <LoadingState />
      ) : error && !stats ? (
        <Panel>
          <ErrorState message={error} onRetry={reload} />
        </Panel>
      ) : (
        stats && (
          <div className="space-y-6">
            <StatGroup
              items={[
                {
                  label: 'People',
                  value: stats.users.total,
                  hint: `${plural(stats.users.manager, 'manager')} · ${plural(stats.departments, 'department')}`,
                },
                { label: 'Pending requests', value: stats.requests.pending, hint: `of ${stats.requests.total} in total` },
                { label: 'On leave today', value: stats.onLeaveToday },
                { label: 'Holidays this month', value: stats.holidaysThisMonth },
              ]}
            />

            <div className="grid gap-6 lg:grid-cols-5">
              <Panel title="Requests per month" description="Last 6 months, by outcome" className="lg:col-span-3" bodyClassName="p-4 sm:p-5">
                <BarChart
                  title="Leave requests per month by outcome, last 6 months"
                  labels={monthLabels(stats.monthly)}
                  series={[
                    { label: 'Approved', data: stats.monthly.map((p) => p.approved ?? 0), color: SERIES_COLORS.approved },
                    { label: 'Pending', data: stats.monthly.map((p) => p.pending ?? 0), color: SERIES_COLORS.pending },
                    { label: 'Rejected', data: stats.monthly.map((p) => p.rejected ?? 0), color: SERIES_COLORS.rejected },
                  ]}
                  height={260}
                />
              </Panel>

              <Panel title="Requests by department" description="All time" className="lg:col-span-2" bodyClassName="p-4 sm:p-5">
                {stats.byDepartment.length === 0 ? (
                  <EmptyState title="No requests yet" className="min-h-[260px]" />
                ) : (
                  <BarChart
                    title="Leave requests by department and outcome"
                    orientation="horizontal"
                    labels={stats.byDepartment.map((d) => d.department)}
                    series={[
                      { label: 'Approved', data: stats.byDepartment.map((d) => d.approved), color: SERIES_COLORS.approved },
                      { label: 'Pending', data: stats.byDepartment.map((d) => d.pending), color: SERIES_COLORS.pending },
                      { label: 'Rejected', data: stats.byDepartment.map((d) => d.rejected), color: SERIES_COLORS.rejected },
                    ]}
                    height={Math.max(180, stats.byDepartment.length * 40 + 40)}
                  />
                )}
              </Panel>
            </div>

            <Panel title="People by role">
              <dl className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {(
                  [
                    ['Employees', stats.users.employee],
                    ['Managers', stats.users.manager],
                    ['Administrators', stats.users.admin],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between px-4 py-3 sm:px-5">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="font-semibold tabular-nums text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>
        )
      )}
    </>
  );
}
