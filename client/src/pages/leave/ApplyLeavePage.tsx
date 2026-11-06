import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik, useField } from 'formik';
import { CalendarDays, Clock3, Send, Wallet } from 'lucide-react';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store';
import { leavesApi } from '../../services/api';
import { errorMessage } from '../../services/http';
import { LEAVE_TYPE_ICONS, LeaveBalanceSummary } from '../../components/leave/LeaveBits';
import { LEAVE_TYPE_TONES } from '../../components/ui/Badge';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Feedback';
import { TextareaField, TextField } from '../../components/ui/Form';
import { PageHeader, Panel } from '../../components/ui/Layout';
import { LEAVE_TYPES, LEAVE_TYPE_LABELS } from '../../lib/constants';
import { countDays, formatDateRange, todayInputValue } from '../../lib/dates';
import { cx, plural } from '../../lib/format';
import { applyFieldErrors } from '../../lib/validation';
import type { LeaveBalance, LeaveRequestInput, LeaveType } from '../../types';

const buildSchema = (balance: LeaveBalance) =>
  Yup.object({
    leaveType: Yup.mixed<LeaveType>().oneOf(LEAVE_TYPES).required('Choose a leave type'),
    startDate: Yup.string()
      .required('Start date is required')
      .test('not-past', 'Start date cannot be in the past', (v) => !v || v >= todayInputValue()),
    endDate: Yup.string()
      .required('End date is required')
      .test('after-start', 'End date must be on or after the start date', function check(v) {
        return !v || !this.parent.startDate || v >= this.parent.startDate;
      })
      .test('balance', function check(v) {
        const { startDate, leaveType } = this.parent as LeaveRequestInput;
        const days = countDays(startDate, v ?? '');
        const available = balance[leaveType] ?? 0;
        return days <= available
          ? true
          : this.createError({ message: `Only ${plural(available, 'day')} of ${leaveType} leave available` });
      }),
    reason: Yup.string()
      .trim()
      .required('Give a short reason for your manager')
      .min(10, 'Reason must be at least 10 characters')
      .max(1000, 'Reason must be 1000 characters or fewer'),
  });

/** Leave type as a group of selectable cards, each showing the days available. */
function LeaveTypePicker({ balance }: { balance: LeaveBalance }) {
  const [field, , helpers] = useField<LeaveType>('leaveType');
  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium text-slate-800">Leave type</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {LEAVE_TYPES.map((type) => {
          const Icon = LEAVE_TYPE_ICONS[type];
          const selected = field.value === type;
          const available = balance[type] ?? 0;
          return (
            <label
              key={type}
              className={cx(
                'relative flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3.5 transition-all focus-within:ring-4 focus-within:ring-brand-500/15',
                selected ? 'border-brand-500 shadow-glow' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              )}
            >
              <input
                type="radio"
                name={field.name}
                value={type}
                checked={selected}
                onChange={() => helpers.setValue(type)}
                onBlur={field.onBlur}
                className="sr-only"
              />
              <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', LEAVE_TYPE_TONES[type].icon)}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-slate-900">{LEAVE_TYPE_LABELS[type]}</span>
                <span className={cx('block text-xs', available === 0 ? 'text-rose-600' : 'text-slate-500')}>
                  {plural(available, 'day')} available
                </span>
              </span>
              <span
                className={cx(
                  'absolute right-3 top-3 h-4 w-4 rounded-full border-2 transition-colors',
                  selected ? 'border-brand-600 bg-brand-600 shadow-[inset_0_0_0_2px_white]' : 'border-slate-300'
                )}
                aria-hidden="true"
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function ApplyLeavePage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [serverError, setServerError] = useState<string | null>(null);
  const today = todayInputValue();

  return (
    <>
      <PageHeader eyebrow="Time off" title="Request leave" description="Your manager is notified the moment you submit." />

      <Formik<LeaveRequestInput>
        initialValues={{ leaveType: 'annual', startDate: '', endDate: '', reason: '' }}
        validationSchema={buildSchema(user.leaveBalance)}
        onSubmit={async (values, { setErrors }) => {
          setServerError(null);
          try {
            await leavesApi.create({ ...values, reason: values.reason.trim() });
            enqueueSnackbar('Leave request submitted', { variant: 'success' });
            navigate('/leave/history');
          } catch (error) {
            if (!applyFieldErrors(error, setErrors)) setServerError(errorMessage(error, 'Could not submit your request'));
          }
        }}
      >
        {({ values, isSubmitting }) => {
          const days = countDays(values.startDate, values.endDate);
          const available = user.leaveBalance[values.leaveType] ?? 0;
          return (
            <div className="grid items-start gap-6 lg:grid-cols-3">
              <Panel className="lg:col-span-2" title="Request details" icon={CalendarDays}>
                <Form noValidate>
                  <div className="space-y-6 p-4 sm:p-6">
                  {serverError && <Alert>{serverError}</Alert>}
                  <LeaveTypePicker balance={user.leaveBalance} />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField name="startDate" label="First day" type="date" min={today} />
                    <TextField name="endDate" label="Last day" type="date" min={values.startDate || today} />
                  </div>
                  <TextareaField
                    name="reason"
                    label="Reason"
                    rows={4}
                    maxLength={1000}
                    hint="Visible to your manager. Dates that include a holiday can't be requested."
                  />
                  </div>
                  <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                    <ButtonLink to="/dashboard" variant="secondary">
                      Cancel
                    </ButtonLink>
                    <Button type="submit" loading={isSubmitting} icon={<Send className="h-4 w-4" aria-hidden="true" />}>
                      Submit request
                    </Button>
                  </div>
                </Form>
              </Panel>

              <div className="space-y-6">
                <Panel title="Summary" icon={Clock3} bodyClassName="px-4 py-5 sm:px-6">
                  {days > 0 ? (
                    <dl className="space-y-3">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Dates</dt>
                        <dd className="text-right">{formatDateRange(`${values.startDate}T00:00:00Z`, `${values.endDate}T00:00:00Z`)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Duration</dt>
                        <dd className="font-medium tabular-nums">{plural(days, 'calendar day')}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Balance after approval</dt>
                        <dd className={available - days < 0 ? 'font-medium text-rose-700' : 'font-medium tabular-nums'}>
                          {plural(available - days, 'day')}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="flex flex-col items-center py-4 text-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <CalendarDays className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <p className="mt-3 text-slate-500">Choose your first and last day to see how many days this uses.</p>
                    </div>
                  )}
                </Panel>
                <Panel title="Your balance" icon={Wallet}>
                  <LeaveBalanceSummary balance={user.leaveBalance} compact />
                </Panel>
              </div>
            </div>
          );
        }}
      </Formik>
    </>
  );
}
