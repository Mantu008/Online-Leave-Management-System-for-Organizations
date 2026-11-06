import { Link } from 'react-router-dom';
import { BarChart3, Building2, CalendarDays, Clock3, PartyPopper, Plane, ShieldCheck, UserRound, Users, Briefcase } from 'lucide-react';
import { useAppSelector } from '../../store';
import { adminApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import { BarChart, SERIES_COLORS } from '../../components/charts/Charts';
import { EmptyState, ErrorState, Skeleton, StatsSkeleton } from '../../components/ui/Feedback';
import { Meter, Panel, StatGroup, TONE_ICON, type Tone } from '../../components/ui/Layout';
import { WelcomeBanner, bannerButton, bannerGhostButton } from '../../components/ui/WelcomeBanner';
import { cx, greeting, plural } from '../../lib/format';
import { monthLabels } from '../../lib/dates';

export default function AdminDashboard() {
  const user = useAppSelector((s) => s.auth.user)!;
  const live = useLiveUpdates();
  const { data: stats, loading, error, reload } = useAsync(() => adminApi.stats(), [live]);

  const roles: Array<{ label: string; value: number; icon: typeof Users; tone: Tone; bar: string }> = stats
    ? [
        { label: 'Employees', value: stats.users.employee, icon: UserRound, tone: 'brand', bar: 'bg-brand-500' },
        { label: 'Managers', value: stats.users.manager, icon: Briefcase, tone: 'sky', bar: 'bg-sky-500' },
        { label: 'Administrators', value: stats.users.admin, icon: ShieldCheck, tone: 'violet', bar: 'bg-violet-500' },
      ]
    : [];

  return (
    <>
      <WelcomeBanner
        title={`${greeting()}, ${user.name.split(' ')[0]} 👋`}
        description="Here's what's happening across your organisation."
        actions={
          <>
            <Link to="/users" className={bannerButton}>
              <Users className="h-4 w-4" aria-hidden="true" />
              Manage people
            </Link>
            <Link to="/holidays/manage" className={bannerGhostButton}>
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Holidays
            </Link>
          </>
        }
      />

      {loading && !stats ? (
        <div className="space-y-6">
          <StatsSkeleton />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
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
                  icon: Users,
                  tone: 'brand',
                },
                {
                  label: 'Pending requests',
                  value: stats.requests.pending,
                  hint: `of ${stats.requests.total} in total`,
                  icon: Clock3,
                  tone: 'amber',
                },
                { label: 'On leave today', value: stats.onLeaveToday, hint: 'Across all departments', icon: Plane, tone: 'sky' },
                {
                  label: 'Holidays this month',
                  value: stats.holidaysThisMonth,
                  hint: 'Published holidays',
                  icon: PartyPopper,
                  tone: 'rose',
                },
              ]}
            />

            <div className="grid gap-6 lg:grid-cols-5">
              <Panel
                title="Requests per month"
                description="Last 6 months, by outcome"
                icon={BarChart3}
                className="lg:col-span-3"
                bodyClassName="p-4 sm:p-6"
              >
                <BarChart
                  title="Leave requests per month by outcome, last 6 months"
                  labels={monthLabels(stats.monthly)}
                  series={[
                    { label: 'Approved', data: stats.monthly.map((p) => p.approved ?? 0), color: SERIES_COLORS.approved },
                    { label: 'Pending', data: stats.monthly.map((p) => p.pending ?? 0), color: SERIES_COLORS.pending },
                    { label: 'Rejected', data: stats.monthly.map((p) => p.rejected ?? 0), color: SERIES_COLORS.rejected },
                  ]}
                  height={280}
                />
              </Panel>

              <Panel
                title="Requests by department"
                description="All time"
                icon={Building2}
                className="lg:col-span-2"
                bodyClassName="p-4 sm:p-6"
              >
                {stats.byDepartment.length === 0 ? (
                  <EmptyState icon={Building2} title="No requests yet" className="min-h-[260px]" />
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
                    height={Math.max(200, stats.byDepartment.length * 44 + 40)}
                  />
                )}
              </Panel>
            </div>

            <Panel title="People by role" description={`${stats.users.total} in total`} icon={Users}>
              <dl className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {roles.map(({ label, value, icon: Icon, tone, bar }) => (
                  <div key={label} className="flex items-center gap-4 px-4 py-5 sm:px-6">
                    <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset', TONE_ICON[tone])}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between">
                        <dt className="text-sm text-slate-500">{label}</dt>
                        <dd className="text-lg font-bold tabular-nums text-slate-900">{value}</dd>
                      </div>
                      <dd className="mt-2">
                        <Meter value={value} max={stats.users.total} label={`${label} share`} barClassName={bar} className="h-1.5" />
                      </dd>
                    </div>
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
