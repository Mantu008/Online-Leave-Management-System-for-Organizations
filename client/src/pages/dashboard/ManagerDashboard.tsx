import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarRange, CheckCircle2, ClipboardCheck, Clock3, Plane, Users } from 'lucide-react';
import { useAppSelector } from '../../store';
import { leavesApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import { BarChart, SERIES_COLORS } from '../../components/charts/Charts';
import { EmployeeCell } from '../../components/leave/LeaveBits';
import { ReviewLeaveModal } from '../../components/leave/ReviewLeaveModal';
import { LeaveTypeBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState, Skeleton, StatsSkeleton } from '../../components/ui/Feedback';
import { Panel, StatGroup } from '../../components/ui/Layout';
import { BannerFigure, WelcomeBanner, bannerButton, bannerGhostButton } from '../../components/ui/WelcomeBanner';
import { formatDateRange, monthLabels } from '../../lib/dates';
import { greeting, plural } from '../../lib/format';
import type { LeaveRequest } from '../../types';

const PREVIEW = 6;

export default function ManagerDashboard() {
  const user = useAppSelector((s) => s.auth.user)!;
  const live = useLiveUpdates();
  const stats = useAsync(() => leavesApi.managerStats(), [live]);
  const pending = useAsync(() => leavesApi.list('pending'), [live]);
  const [reviewing, setReviewing] = useState<LeaveRequest | null>(null);

  const onDecided = (updated: LeaveRequest) => {
    setReviewing(null);
    pending.setData((list) => (list ?? []).filter((r) => r._id !== updated._id));
    stats.reload();
  };

  const pendingList = pending.data ?? [];

  return (
    <>
      <WelcomeBanner
        title={`${greeting()}, ${user.name.split(' ')[0]} 👋`}
        description={
          pending.data
            ? pendingList.length > 0
              ? `${plural(pendingList.length, 'request')} from ${user.department} need your review.`
              : `You're all caught up in ${user.department}.`
            : `Manager · ${user.department}`
        }
        actions={
          <>
            <Link to="/leave/requests" className={bannerButton}>
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              Review requests
            </Link>
            <Link to="/team" className={bannerGhostButton}>
              <CalendarRange className="h-4 w-4" aria-hidden="true" />
              Team calendar
            </Link>
          </>
        }
        aside={stats.data && <BannerFigure label="On leave today" value={stats.data.onLeaveToday} hint={`of ${plural(stats.data.teamSize, 'team member')}`} />}
      />

      <div className="space-y-8">
        {stats.loading && !stats.data ? (
          <StatsSkeleton />
        ) : stats.error && !stats.data ? (
          <Panel>
            <ErrorState message={stats.error} onRetry={stats.reload} />
          </Panel>
        ) : (
          stats.data && (
            <StatGroup
              items={[
                { label: 'Awaiting review', value: stats.data.counts.pending, hint: 'Pending decisions', icon: Clock3, tone: 'amber' },
                { label: 'On leave today', value: stats.data.onLeaveToday, hint: 'Approved absences', icon: Plane, tone: 'sky' },
                { label: 'Team members', value: stats.data.teamSize, hint: 'Active employees', icon: Users, tone: 'brand' },
                {
                  label: 'Approved',
                  value: stats.data.counts.approved,
                  hint: `of ${stats.data.counts.total} requests`,
                  icon: CheckCircle2,
                  tone: 'emerald',
                },
              ]}
            />
          )
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <Panel
            title="Awaiting your review"
            description="Oldest requests first"
            className="lg:col-span-3"
            actions={
              <Link to="/leave/requests" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
                All requests <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            }
          >
            {pending.loading && !pending.data ? (
              <LoadingState rows={4} />
            ) : pending.error ? (
              <ErrorState message={pending.error} onRetry={pending.reload} />
            ) : pendingList.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="You're all caught up" description="New requests from your team will appear here." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {pendingList.slice(0, PREVIEW).map((request) => (
                  <li key={request._id} className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-slate-50/70 sm:px-6">
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-6">
                      <div className="min-w-0 sm:w-56">
                        <EmployeeCell employee={request.employee} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pl-12 text-xs text-slate-500 sm:pl-0 sm:text-sm">
                        <LeaveTypeBadge type={request.leaveType} />
                        <span className="text-slate-700">{formatDateRange(request.startDate, request.endDate)}</span>
                        <span className="text-slate-400">· {plural(request.totalDays, 'day')}</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setReviewing(request)}>
                      Review
                    </Button>
                  </li>
                ))}
                {pendingList.length > PREVIEW && (
                  <li className="px-4 py-3 text-xs text-slate-500 sm:px-6">
                    {plural(pendingList.length - PREVIEW, 'more request')} —{' '}
                    <Link to="/leave/requests" className="font-semibold text-brand-600 hover:text-brand-700">
                      view all
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </Panel>

          <Panel title="Requests per month" description={`${user.department}, last 6 months`} className="lg:col-span-2" bodyClassName="p-4 sm:p-6">
            {stats.data ? (
              <BarChart
                title={`${user.department} leave requests per month, last 6 months`}
                labels={monthLabels(stats.data.monthly)}
                series={[{ label: 'Requests', data: stats.data.monthly.map((p) => p.count), color: SERIES_COLORS.primary }]}
                height={240}
              />
            ) : (
              <Skeleton className="h-[240px] w-full rounded-lg" />
            )}
          </Panel>
        </div>
      </div>

      <ReviewLeaveModal request={reviewing} onClose={() => setReviewing(null)} onDecided={onDecided} />
    </>
  );
}
