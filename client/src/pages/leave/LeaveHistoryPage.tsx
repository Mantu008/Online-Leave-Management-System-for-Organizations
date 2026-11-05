import { useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store';
import { leavesApi } from '../../services/api';
import { errorMessage } from '../../services/http';
import { useAsync } from '../../hooks/useAsync';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import { StatusBadge } from '../../components/ui/Badge';
import { Button, ButtonLink } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { PageHeader, Panel, SegmentedControl } from '../../components/ui/Layout';
import { Pagination, Table, TBody, Td, Th, THead } from '../../components/ui/Table';
import { LEAVE_TYPE_LABELS } from '../../lib/constants';
import { formatDate, formatDateRange } from '../../lib/dates';
import { downloadLeaveReport } from '../../lib/leaveReport';
import type { LeaveStatus } from '../../types';

type Filter = 'all' | LeaveStatus;
const PAGE_SIZE = 10;

export default function LeaveHistoryPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const live = useLiveUpdates();
  const { data, loading, error, reload } = useAsync(() => leavesApi.list(), [live]);
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(0);
  const [exporting, setExporting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const leaves = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => (filter === 'all' ? leaves : leaves.filter((l) => l.status === filter)), [leaves, filter]);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const count = (status: LeaveStatus) => leaves.filter((l) => l.status === status).length;

  const exportPdf = async () => {
    setExporting(true);
    try {
      await downloadLeaveReport(user, filtered);
    } catch (err) {
      enqueueSnackbar(errorMessage(err, 'Could not create the PDF'), { variant: 'error' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="My leave"
        description="Every request you've made and its outcome."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={exportPdf}
              loading={exporting}
              disabled={filtered.length === 0}
              icon={<Download className="h-4 w-4" aria-hidden="true" />}
            >
              Export PDF
            </Button>
            <ButtonLink to="/leave/apply" icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
              Request leave
            </ButtonLink>
          </>
        }
      />

      <Panel
        actions={
          <SegmentedControl<Filter>
            label="Filter by status"
            value={filter}
            onChange={(value) => {
              setFilter(value);
              setPage(0);
            }}
            options={[
              { value: 'all', label: 'All', count: leaves.length },
              { value: 'pending', label: 'Pending', count: count('pending') },
              { value: 'approved', label: 'Approved', count: count('approved') },
              { value: 'rejected', label: 'Rejected', count: count('rejected') },
            ]}
          />
        }
        title="Requests"
      >
        {loading && !data ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filter === 'all' ? 'No leave requests yet' : `No ${filter} requests`}
            description={filter === 'all' ? 'When you request leave it will be listed here.' : undefined}
          />
        ) : (
          <>
            <Table caption="Your leave requests">
              <THead>
                <Th>Dates</Th>
                <Th>Type</Th>
                <Th className="text-right">Days</Th>
                <Th>Status</Th>
                <Th>Details</Th>
                <Th>Submitted</Th>
              </THead>
              <TBody>
                {visible.map((leave) => (
                  <tr key={leave._id}>
                    <Td className="whitespace-nowrap font-medium text-slate-900">{formatDateRange(leave.startDate, leave.endDate)}</Td>
                    <Td>{LEAVE_TYPE_LABELS[leave.leaveType]}</Td>
                    <Td className="text-right tabular-nums">{leave.totalDays}</Td>
                    <Td>
                      <StatusBadge status={leave.status} />
                    </Td>
                    <Td className="max-w-xs">
                      <p className="line-clamp-2 text-slate-700" title={leave.reason}>
                        {leave.reason}
                      </p>
                      {leave.managerNote && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500" title={leave.managerNote}>
                          {leave.manager?.name ?? 'Manager'}: {leave.managerNote}
                        </p>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-slate-500">{formatDate(leave.createdAt)}</Td>
                  </tr>
                ))}
              </TBody>
            </Table>
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </Panel>
    </>
  );
}
