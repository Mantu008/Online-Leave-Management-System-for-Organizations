import { useMemo, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useAppSelector } from '../../store';
import { leavesApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import { EmployeeCell } from '../../components/leave/LeaveBits';
import { ReviewLeaveModal } from '../../components/leave/ReviewLeaveModal';
import { LeaveTypeBadge, StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { PageHeader, Panel, SegmentedControl } from '../../components/ui/Layout';
import { Pagination, Table, TBody, Td, Th, THead } from '../../components/ui/Table';
import { formatDate, formatDateRange } from '../../lib/dates';
import type { LeaveRequest, LeaveStatus } from '../../types';

type Filter = 'all' | LeaveStatus;
const PAGE_SIZE = 15;

export default function LeaveRequestsPage() {
  const department = useAppSelector((s) => s.auth.user?.department);
  const live = useLiveUpdates();
  const { data, loading, error, reload, setData } = useAsync(() => leavesApi.list(), [live]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [page, setPage] = useState(0);
  const [reviewing, setReviewing] = useState<LeaveRequest | null>(null);

  const requests = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => (filter === 'all' ? requests : requests.filter((r) => r.status === filter)), [requests, filter]);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const count = (status: LeaveStatus) => requests.filter((r) => r.status === status).length;

  const onDecided = (updated: LeaveRequest) => {
    setReviewing(null);
    setData((list) => (list ?? []).map((r) => (r._id === updated._id ? updated : r)));
  };

  return (
    <>
      <PageHeader eyebrow="Approvals" title="Leave requests" description={`Review and decide on requests from the ${department} department.`} />

      <Panel
        title="Requests"
        actions={
          <SegmentedControl<Filter>
            label="Filter by status"
            value={filter}
            onChange={(value) => {
              setFilter(value);
              setPage(0);
            }}
            options={[
              { value: 'pending', label: 'Pending', count: count('pending') },
              { value: 'approved', label: 'Approved', count: count('approved') },
              { value: 'rejected', label: 'Rejected', count: count('rejected') },
              { value: 'all', label: 'All', count: requests.length },
            ]}
          />
        }
      >
        {loading && !data ? (
          <LoadingState rows={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title={filter === 'pending' ? 'Nothing waiting for review' : 'No requests to show'}
            description={filter === 'pending' ? 'New requests from your team will appear here.' : undefined}
          />
        ) : (
          <>
            <Table caption="Department leave requests">
              <THead>
                <Th>Employee</Th>
                <Th>Leave</Th>
                <Th>Dates</Th>
                <Th className="text-right">Days</Th>
                <Th>Status</Th>
                <Th>Submitted</Th>
                <Th>
                  <span className="sr-only">Actions</span>
                </Th>
              </THead>
              <TBody>
                {visible.map((request) => (
                  <tr key={request._id}>
                    <Td className="max-w-[14rem]">
                      <EmployeeCell employee={request.employee} />
                    </Td>
                    <Td>
                      <LeaveTypeBadge type={request.leaveType} />
                    </Td>
                    <Td className="whitespace-nowrap">{formatDateRange(request.startDate, request.endDate)}</Td>
                    <Td className="text-right font-semibold tabular-nums text-slate-900">{request.totalDays}</Td>
                    <Td>
                      <StatusBadge status={request.status} />
                    </Td>
                    <Td className="whitespace-nowrap text-slate-500">{formatDate(request.createdAt)}</Td>
                    <Td className="text-right">
                      {request.status === 'pending' ? (
                        <Button size="sm" onClick={() => setReviewing(request)}>
                          Review
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-500">by {request.manager?.name ?? '—'}</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </TBody>
            </Table>
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </Panel>

      <ReviewLeaveModal request={reviewing} onClose={() => setReviewing(null)} onDecided={onDecided} />
    </>
  );
}
