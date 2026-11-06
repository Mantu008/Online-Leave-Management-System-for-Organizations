import type { ReactNode } from 'react';
import { Briefcase, Building2, CalendarDays, Mail, ShieldCheck, Wallet, type LucideIcon } from 'lucide-react';
import { useAppSelector } from '../../store';
import { LeaveBalanceSummary } from '../../components/leave/LeaveBits';
import { Avatar, PageHeader, Panel } from '../../components/ui/Layout';
import { ROLE_LABELS } from '../../lib/constants';
import { formatDate, formatDateTime } from '../../lib/dates';

function Row({ label, icon: Icon, children }: { label: string; icon?: LucideIcon; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-3.5 sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt className="flex items-center gap-2 text-slate-500">
        {Icon && <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />}
        {label}
      </dt>
      <dd className="font-medium text-slate-900 sm:col-span-2">{children}</dd>
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
            <div className="relative h-28 bg-gradient-to-r from-brand-600 via-brand-700 to-violet-700">
              <div className="bg-grid absolute inset-0 opacity-70" aria-hidden="true" />
            </div>
            <div className="-mt-10 flex flex-col gap-4 border-b border-slate-100 px-4 pb-5 sm:flex-row sm:items-end sm:px-6">
              <Avatar name={user.name} className="h-20 w-20 text-2xl ring-4" />
              <div className="min-w-0 pb-1">
                <p className="truncate text-xl font-bold tracking-tight text-slate-900">{user.name}</p>
                <p className="truncate text-slate-500">
                  {user.position} · {user.department}
                </p>
              </div>
              <span className="mb-1 inline-flex items-center gap-1.5 self-start rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 sm:ml-auto sm:self-end">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {ROLE_LABELS[user.role]}
              </span>
            </div>
            <dl className="divide-y divide-slate-100">
              <Row label="Email" icon={Mail}>
                {user.email}
              </Row>
              <Row label="Department" icon={Building2}>
                {user.department}
              </Row>
              <Row label="Position" icon={Briefcase}>
                {user.position}
              </Row>
              <Row label="Joining date" icon={CalendarDays}>
                {formatDate(user.joiningDate)}
              </Row>
            </dl>
          </Panel>

          {user.role !== 'admin' && (
            <Panel title="Leave balance" icon={Wallet}>
              <LeaveBalanceSummary balance={user.leaveBalance} compact />
            </Panel>
          )}
        </div>

        <Panel title="Account" icon={ShieldCheck}>
          <dl className="divide-y divide-slate-100">
            <Row label="Status">
              {user.isActive ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  Active
                </span>
              ) : (
                'Inactive'
              )}
            </Row>
            <Row label="Last sign-in">{formatDateTime(user.lastLogin)}</Row>
            <Row label="Member since">{formatDate(user.createdAt)}</Row>
          </dl>
        </Panel>
      </div>
    </>
  );
}
