import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store';
import { leavesApi } from '../../services/api';
import { errorMessage } from '../../services/http';
import { LeaveBalanceSummary } from '../../components/leave/LeaveBits';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Feedback';
import { SelectField, TextareaField, TextField } from '../../components/ui/Form';
import { PageHeader, Panel } from '../../components/ui/Layout';
import { LEAVE_TYPES, LEAVE_TYPE_LABELS } from '../../lib/constants';
import { countDays, formatDateRange, todayInputValue } from '../../lib/dates';
import { plural } from '../../lib/format';
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

export default function ApplyLeavePage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [serverError, setServerError] = useState<string | null>(null);
  const today = todayInputValue();

  return (
    <>
      <PageHeader title="Request leave" description="Your manager is notified as soon as you submit." />

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
              <Panel className="lg:col-span-2" bodyClassName="p-4 sm:p-6">
                <Form noValidate className="space-y-5">
                  {serverError && <Alert>{serverError}</Alert>}
                  <SelectField
                    name="leaveType"
                    label="Leave type"
                    options={LEAVE_TYPES.map((t) => ({
                      value: t,
                      label: `${LEAVE_TYPE_LABELS[t]} leave (${plural(user.leaveBalance[t] ?? 0, 'day')} available)`,
                    }))}
                  />
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
                  <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <ButtonLink to="/dashboard" variant="secondary">
                      Cancel
                    </ButtonLink>
                    <Button type="submit" loading={isSubmitting}>
                      Submit request
                    </Button>
                  </div>
                </Form>
              </Panel>

              <div className="space-y-6">
                <Panel title="This request" bodyClassName="px-4 py-4 sm:px-5">
                  {days > 0 ? (
                    <dl className="space-y-2.5">
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
                    <p className="text-slate-500">Choose your first and last day to see how many days this uses.</p>
                  )}
                </Panel>
                <Panel title="Your balance">
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
