import { useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { holidaysApi } from '../../services/api';
import { errorMessage } from '../../services/http';
import { useAsync } from '../../hooks/useAsync';
import { HolidayTable, YearSwitcher } from '../../components/holidays/HolidayTable';
import { Button } from '../../components/ui/Button';
import { Alert, EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { CheckboxField, SelectField, TextareaField, TextField } from '../../components/ui/Form';
import { PageHeader, Panel } from '../../components/ui/Layout';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { HOLIDAY_TYPES, HOLIDAY_TYPE_LABELS } from '../../lib/constants';
import { formatDate, toDateInputValue } from '../../lib/dates';
import { applyFieldErrors } from '../../lib/validation';
import type { Holiday, HolidayInput } from '../../types';

const schema = Yup.object({
  name: Yup.string().trim().required('Name is required').max(100),
  date: Yup.string().required('Date is required'),
  type: Yup.string().oneOf(HOLIDAY_TYPES).required(),
  description: Yup.string().max(500),
  isRecurring: Yup.boolean(),
});

type Editing = { mode: 'create' } | { mode: 'edit'; holiday: Holiday } | null;

function HolidayFormModal({ editing, onClose, onSaved }: { editing: Editing; onClose: () => void; onSaved: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const holiday = editing?.mode === 'edit' ? editing.holiday : null;

  const initialValues: HolidayInput = holiday
    ? {
        name: holiday.name,
        // Recurring holidays are edited as a series, using their original date.
        date: toDateInputValue(holiday.originalDate ?? holiday.date),
        type: holiday.type,
        description: holiday.description ?? '',
        isRecurring: holiday.isRecurring,
      }
    : { name: '', date: '', type: 'public', description: '', isRecurring: false };

  return (
    <Modal
      open={editing !== null}
      onClose={() => {
        setServerError(null);
        onClose();
      }}
      title={holiday ? 'Edit holiday' : 'Add holiday'}
      description={
        holiday?.isRecurring
          ? `Repeats every year. Changes apply to the whole series, first observed ${formatDate(holiday.originalDate ?? holiday.date)}.`
          : undefined
      }
    >
      <Formik<HolidayInput>
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={async (values, { setErrors }) => {
          setServerError(null);
          try {
            const input = { ...values, name: values.name.trim(), description: values.description.trim() };
            if (holiday) await holidaysApi.update(holiday._id, input);
            else await holidaysApi.create(input);
            enqueueSnackbar(holiday ? 'Holiday updated' : 'Holiday added', { variant: 'success' });
            onSaved();
          } catch (error) {
            if (!applyFieldErrors(error, setErrors)) setServerError(errorMessage(error, 'Could not save the holiday'));
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form noValidate className="space-y-4">
            {serverError && <Alert>{serverError}</Alert>}
            <TextField name="name" label="Name" autoFocus />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="date" label="Date" type="date" />
              <SelectField name="type" label="Type" options={HOLIDAY_TYPES.map((t) => ({ value: t, label: HOLIDAY_TYPE_LABELS[t] }))} />
            </div>
            <TextareaField name="description" label="Notes (optional)" rows={2} maxLength={500} />
            <CheckboxField name="isRecurring" label="Repeats every year" hint="Observed on the same date in following years." />
            <div className="-mx-6 -mb-5 mt-2 flex justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
              <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {holiday ? 'Save changes' : 'Add holiday'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

export default function ManageHolidaysPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, loading, error, reload } = useAsync(() => holidaysApi.list(year), [year]);
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<Holiday | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await holidaysApi.remove(deleting._id);
      enqueueSnackbar('Holiday deleted', { variant: 'success' });
      setDeleting(null);
      reload();
    } catch (err) {
      enqueueSnackbar(errorMessage(err, 'Could not delete the holiday'), { variant: 'error' });
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Holidays"
        description="Holidays are visible to everyone and block leave requests on those dates."
        actions={
          <Button onClick={() => setEditing({ mode: 'create' })} icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
            Add holiday
          </Button>
        }
      />

      <Panel title={`${year} holidays`} actions={<YearSwitcher year={year} onChange={setYear} />}>
        {loading ? (
          <LoadingState rows={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={`No holidays for ${year}`}
            description="Publish public and company holidays so employees can plan around them."
            action={
              <Button variant="secondary" onClick={() => setEditing({ mode: 'create' })}>
                Add the first one
              </Button>
            }
          />
        ) : (
          <HolidayTable
            holidays={data}
            actions={(holiday) => (
              <div className="flex justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing({ mode: 'edit', holiday })}
                  icon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => setDeleting(holiday)}
                  icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                >
                  Delete
                </Button>
              </div>
            )}
          />
        )}
      </Panel>

      <HolidayFormModal
        editing={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete holiday?"
        message={
          deleting && (
            <>
              <strong className="font-medium text-slate-900">{deleting.name}</strong> will be removed
              {deleting.isRecurring ? ' from every year it repeats in' : ''}. Employees will be able to request leave on that date.
            </>
          )
        }
        confirmLabel="Delete holiday"
        busy={deletingBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
