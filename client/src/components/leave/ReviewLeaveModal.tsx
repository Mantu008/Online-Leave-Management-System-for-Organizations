import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { leavesApi } from '../../services/api';
import { errorMessage } from '../../services/http';
import { LEAVE_TYPE_LABELS } from '../../lib/constants';
import { formatDateRange, formatDateTime } from '../../lib/dates';
import { plural } from '../../lib/format';
import { LeaveTypeBadge } from '../ui/Badge';
import { Avatar } from '../ui/Layout';
import type { LeaveRequest } from '../../types';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Feedback';
import { FieldShell } from '../ui/Form';
import { Modal } from '../ui/Modal';

interface Props {
  request: LeaveRequest | null;
  onClose: () => void;
  onDecided: (updated: LeaveRequest) => void;
}

export function ReviewLeaveModal({ request, onClose, onDecided }: Props) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState<'approved' | 'rejected' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const close = () => {
    setNote('');
    setError(null);
    onClose();
  };

  const decide = async (status: 'approved' | 'rejected') => {
    if (!request) return;
    setSubmitting(status);
    setError(null);
    try {
      const updated = await leavesApi.decide(request._id, { status, managerNote: note.trim() || undefined });
      enqueueSnackbar(`Request ${status}`, { variant: 'success' });
      setNote('');
      onDecided(updated);
    } catch (err) {
      setError(errorMessage(err, 'Could not update the request'));
    } finally {
      setSubmitting(null);
    }
  };

  const balance = request?.employee?.leaveBalance?.[request.leaveType];

  return (
    <Modal
      open={Boolean(request)}
      onClose={close}
      title="Review leave request"
      busy={submitting !== null}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={submitting !== null}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => decide('rejected')} loading={submitting === 'rejected'} disabled={submitting !== null}>
            Reject
          </Button>
          <Button variant="success" onClick={() => decide('approved')} loading={submitting === 'approved'} disabled={submitting !== null}>
            Approve
          </Button>
        </>
      }
    >
      {request && (
        <div className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5 ring-1 ring-inset ring-slate-200/70">
            <Avatar name={request.employee?.name ?? '?'} className="h-11 w-11 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{request.employee?.name ?? 'Removed user'}</p>
              {request.employee?.email && <p className="truncate text-xs text-slate-500">{request.employee.email}</p>}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold leading-none tabular-nums text-slate-900">{request.totalDays}</p>
              <p className="text-xs text-slate-500">{request.totalDays === 1 ? 'day' : 'days'}</p>
            </div>
          </div>
          <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-3 text-sm">
            <dt className="text-slate-500">Leave</dt>
            <dd>
              <LeaveTypeBadge type={request.leaveType} />
            </dd>
            <dt className="text-slate-500">Dates</dt>
            <dd>{formatDateRange(request.startDate, request.endDate)}</dd>
            {balance !== undefined && (
              <>
                <dt className="text-slate-500">Balance</dt>
                <dd className={balance < request.totalDays ? 'font-medium text-rose-700' : undefined}>
                  {plural(balance, 'day')} of {LEAVE_TYPE_LABELS[request.leaveType].toLowerCase()} leave available
                  {balance < request.totalDays && ' — not enough to approve'}
                </dd>
              </>
            )}
            <dt className="text-slate-500">Submitted</dt>
            <dd>{formatDateTime(request.createdAt)}</dd>
            <dt className="text-slate-500">Reason</dt>
            <dd className="whitespace-pre-line text-slate-700">{request.reason}</dd>
          </dl>
          <FieldShell id="managerNote" label="Note to employee (optional)">
            <textarea
              id="managerNote"
              className="control min-h-[4.5rem]"
              value={note}
              maxLength={500}
              onChange={(e) => setNote(e.target.value)}
            />
          </FieldShell>
        </div>
      )}
    </Modal>
  );
}
