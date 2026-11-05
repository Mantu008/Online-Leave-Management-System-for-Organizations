import type { ReactNode } from 'react';
import { useAppSelector } from '../../store';
import { LeaveBalanceSummary } from '../../components/leave/LeaveBits';
import { Avatar, PageHeader, Panel } from '../../components/ui/Layout';
import { ROLE_LABELS } from '../../lib/constants';
import { formatDate, formatDateTime } from '../../lib/dates';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4 sm:px-5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900 sm:col-span-2">{children}</dd>
    </div>
  );
}

export default function ProfilePage() {
  // The session user is refreshed from the server on load (see SessionSync).
  const user = useAppSelector((s) => s.auth.user)!;

  return (
    <>
      <PageHeader title="Profile" description="Your account details. Contact an administrator to change them." />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel>
            <div className="flex items-center gap-4 border-b border-slate-200 px-4 py-5 sm:px-5">
              <Avatar name={user.name} className="h-12 w-12 text-base" />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">{user.name}</p>
                <p className="truncate text-slate-500">
                  {user.position} · {user.department}
                </p>
              </div>
            </div>
            <dl className="divide-y divide-slate-100">
              <Row label="Email">{user.email}</Row>
              <Row label="Role">{ROLE_LABELS[user.role]}</Row>
              <Row label="Department">{user.department}</Row>
              <Row label="Position">{user.position}</Row>
              <Row label="Joining date">{formatDate(user.joiningDate)}</Row>
            </dl>
          </Panel>

          {user.role !== 'admin' && (
            <Panel title="Leave balance">
              <LeaveBalanceSummary balance={user.leaveBalance} />
            </Panel>
          )}
        </div>

        <Panel title="Account">
          <dl className="divide-y divide-slate-100">
            <Row label="Status">{user.isActive ? 'Active' : 'Inactive'}</Row>
            <Row label="Last sign-in">{formatDateTime(user.lastLogin)}</Row>
            <Row label="Member since">{formatDate(user.createdAt)}</Row>
          </dl>
        </Panel>
      </div>
    </>
  );
}
