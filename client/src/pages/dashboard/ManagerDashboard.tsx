import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { leavesApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import { BarChart, SERIES_COLORS } from '../../components/charts/Charts';
import { EmployeeCell } from '../../components/leave/LeaveBits';
import { ReviewLeaveModal } from '../../components/leave/ReviewLeaveModal';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { PageHeader, Panel, StatGroup } from '../../components/ui/Layout';
import { LEAVE_TYPE_LABELS } from '../../lib/constants';
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
      <PageHeader title={`${greeting()}, ${user.name.split(' ')[0]}`} description={`Manager · ${user.department}`} />

      <div className="space-y-6">
        {stats.loading && !stats.data ? (
          <LoadingState className="min-h-[6rem]" />
        ) : stats.error && !stats.data ? (
          <Panel>
            <ErrorState message={stats.error} onRetry={stats.reload} />
          </Panel>
        ) : (
          stats.data && (
            <StatGroup
              items={[
                { label: 'Awaiting review', value: stats.data.counts.pending },
                { label: 'On leave today', value: stats.data.onLeaveToday },
                { label: 'Team members', value: stats.data.teamSize, hint: 'Active employees' },
                { label: 'Approved', value: stats.data.counts.approved, hint: `of ${stats.data.counts.total} requests` },
              ]}
            />
          )
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <Panel
            title="Awaiting your review"
            className="lg:col-span-3"
            actions={
              <Link to="/leave/requests" className="text-xs font-medium text-brand-700 hover:text-brand-900 hover:underline">
                All requests
              </Link>
            }
          >
            {pending.loading && !pending.data ? (
              <LoadingState className="min-h-[8rem]" />
            ) : pending.error ? (
              <ErrorState message={pending.error} onRetry={pending.reload} />
            ) : pendingList.length === 0 ? (
              <EmptyState title="You're all caught up" description="New requests from your team will appear here." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {pendingList.slice(0, PREVIEW).map((request) => (
                  <li key={request._id} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-6">
                      <div className="sm:w-48">
                        <EmployeeCell employee={request.employee} />
                      </div>
                      <p className="text-xs text-slate-500 sm:text-sm sm:text-slate-700">
                        {LEAVE_TYPE_LABELS[request.leaveType]} · {formatDateRange(request.startDate, request.endDate)}
                        <span className="text-slate-400"> · {plural(request.totalDays, 'day')}</span>
                      </p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => setReviewing(request)}>
                      Review
                    </Button>
                  </li>
                ))}
                {pendingList.length > PREVIEW && (
                  <li className="px-4 py-2.5 text-xs text-slate-500 sm:px-5">
                    {plural(pendingList.length - PREVIEW, 'more request')} —{' '}
                    <Link to="/leave/requests" className="font-medium text-brand-700 hover:underline">
                      view all
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </Panel>

          <Panel title="Requests per month" description={`${user.department}, last 6 months`} className="lg:col-span-2" bodyClassName="p-4 sm:p-5">
            {stats.data ? (
              <BarChart
                title={`${user.department} leave requests per month, last 6 months`}
                labels={monthLabels(stats.data.monthly)}
                series={[{ label: 'Requests', data: stats.data.monthly.map((p) => p.count), color: SERIES_COLORS.primary }]}
                height={220}
              />
            ) : (
              <LoadingState className="min-h-[220px]" />
            )}
          </Panel>
        </div>
      </div>

      <ReviewLeaveModal request={reviewing} onClose={() => setReviewing(null)} onDecided={onDecided} />
    </>
  );
}
