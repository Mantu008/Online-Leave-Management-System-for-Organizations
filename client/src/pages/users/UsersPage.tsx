import { useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Pencil, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../store';
import { usersApi } from '../../services/api';
import { errorMessage } from '../../services/http';
import { useAsync } from '../../hooks/useAsync';
import { Tag } from '../../components/ui/Badge';
import { cx } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Alert, EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { CheckboxField, SelectField, TextField } from '../../components/ui/Form';
import { Avatar, PageHeader, Panel } from '../../components/ui/Layout';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { Pagination, Table, TBody, Td, Th, THead } from '../../components/ui/Table';
import { DEPARTMENTS, POSITIONS, ROLES, ROLE_LABELS } from '../../lib/constants';
import { formatDate, toDateInputValue, todayInputValue } from '../../lib/dates';
import { applyFieldErrors, rules } from '../../lib/validation';
import type { Role, User } from '../../types';

const PAGE_SIZE = 15;

interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: Role | '';
  department: string;
  position: string;
  joiningDate: string;
  isActive: boolean;
}

const baseSchema = {
  name: rules.name(),
  email: rules.email(),
  role: Yup.string().oneOf(ROLES, 'Choose a role').required('Choose a role'),
  department: rules.department(),
  position: rules.position(),
  joiningDate: rules.joiningDate(),
};
const createSchema = Yup.object({ ...baseSchema, password: rules.password() });
const editSchema = Yup.object(baseSchema);

/** Keep a user's existing value selectable even if it is not in the standard list. */
const withCurrent = (list: readonly string[], current?: string) =>
  (current && !list.includes(current) ? [...list, current] : [...list]).map((v) => ({ value: v, label: v }));

function UserFormModal({
  open,
  user,
  isSelf,
  onClose,
  onSaved,
}: {
  open: boolean;
  user: User | null;
  isSelf: boolean;
  onClose: () => void;
  onSaved: (user: User, created: boolean) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const initialValues: UserFormValues = user
    ? {
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        department: user.department,
        position: user.position,
        joiningDate: toDateInputValue(user.joiningDate),
        isActive: user.isActive,
      }
    : { name: '', email: '', password: '', role: 'employee', department: '', position: '', joiningDate: todayInputValue(), isActive: true };

  const close = () => {
    setServerError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title={user ? 'Edit user' : 'Add user'}>
      <Formik<UserFormValues>
        initialValues={initialValues}
        validationSchema={user ? editSchema : createSchema}
        onSubmit={async (values, { setErrors }) => {
          setServerError(null);
          const common = {
            name: values.name.trim(),
            email: values.email.trim(),
            role: values.role as Role,
            department: values.department,
            position: values.position.trim(),
            joiningDate: values.joiningDate,
          };
          try {
            const saved = user
              ? await usersApi.update(user._id, { ...common, isActive: values.isActive })
              : await usersApi.create({ ...common, password: values.password });
            onSaved(saved, !user);
          } catch (error) {
            if (!applyFieldErrors(error, setErrors)) setServerError(errorMessage(error, 'Could not save the user'));
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form noValidate className="space-y-4">
            {serverError && <Alert>{serverError}</Alert>}
            <TextField name="name" label="Full name" autoFocus />
            <TextField name="email" label="Email" type="email" />
            {!user && <TextField name="password" label="Temporary password" type="password" autoComplete="new-password" hint="Share it securely; at least 6 characters." />}
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                name="role"
                label="Role"
                disabled={isSelf}
                hint={isSelf ? "You can't change your own role." : undefined}
                options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
              />
              <SelectField name="department" label="Department" placeholder="Select…" options={withCurrent(DEPARTMENTS, user?.department)} />
              <SelectField name="position" label="Position" placeholder="Select…" options={withCurrent(POSITIONS, user?.position)} />
              <TextField name="joiningDate" label="Joining date" type="date" max={todayInputValue()} />
            </div>
            {user && !isSelf && (
              <CheckboxField name="isActive" label="Account active" hint="Inactive accounts can't sign in. Their leave history is kept." />
            )}
            <div className="-mx-6 -mb-5 mt-2 flex justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
              <Button variant="secondary" onClick={close} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {user ? 'Save changes' : 'Add user'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

const ROLE_STYLES: Record<Role, string> = {
  employee: 'bg-slate-50 text-slate-700 ring-slate-200',
  manager: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  admin: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={cx('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset', ROLE_STYLES[role])}>
      {ROLE_LABELS[role]}
    </span>
  );
}

export default function UsersPage() {
  const currentUserId = useAppSelector((s) => s.auth.user?._id);
  const { data, loading, error, reload, setData } = useAsync(() => usersApi.list(), []);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [page, setPage] = useState(0);
  const [form, setForm] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [deleting, setDeleting] = useState<User | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter(
      (u) =>
        (roleFilter === 'all' || u.role === roleFilter) &&
        (!q || [u.name, u.email, u.department, u.position].some((v) => v?.toLowerCase().includes(q)))
    );
  }, [data, query, roleFilter]);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await usersApi.remove(deleting._id);
      setData((list) => (list ?? []).filter((u) => u._id !== deleting._id));
      enqueueSnackbar(`${deleting.name} was deleted`, { variant: 'success' });
      setDeleting(null);
    } catch (err) {
      enqueueSnackbar(errorMessage(err, 'Could not delete the user'), { variant: 'error' });
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="People"
        description="Manage accounts, roles, departments and leave access."
        actions={
          <Button onClick={() => setForm({ open: true, user: null })} icon={<UserPlus className="h-4 w-4" aria-hidden="true" />}>
            Add person
          </Button>
        }
      />

      <Panel>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              className="control pl-9"
              placeholder="Search name, email, department"
              aria-label="Search users"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <select
            className="control sm:w-44"
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as Role | 'all');
              setPage(0);
            }}
          >
            <option value="all">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          {data && (
            <span className="text-xs font-medium text-slate-500 sm:ml-auto">
              Showing {filtered.length} of {data.length} people
            </span>
          )}
        </div>

        {loading && !data ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No people match your filters" description="Try a different search term or role." />
        ) : (
          <>
            <Table caption="Users">
              <THead>
                <Th>Name</Th>
                <Th>Role</Th>
                <Th>Department</Th>
                <Th>Position</Th>
                <Th>Joined</Th>
                <Th>Status</Th>
                <Th>
                  <span className="sr-only">Actions</span>
                </Th>
              </THead>
              <TBody>
                {visible.map((u) => {
                  const isSelf = u._id === currentUserId;
                  return (
                    <tr key={u._id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {u.name}
                              {isSelf && <span className="ml-1.5 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">You</span>}
                            </p>
                            <p className="truncate text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <RoleBadge role={u.role} />
                      </Td>
                      <Td>{u.department}</Td>
                      <Td>{u.position}</Td>
                      <Td className="whitespace-nowrap text-slate-500">{formatDate(u.joiningDate)}</Td>
                      <Td>
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                            Active
                          </span>
                        ) : (
                          <Tag className="text-slate-500">Inactive</Tag>
                        )}
                      </Td>
                      <Td className="whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setForm({ open: true, user: u })}
                            icon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                          >
                            Edit
                          </Button>
                          {!isSelf && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              onClick={() => setDeleting(u)}
                              icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </TBody>
            </Table>
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </Panel>

      <UserFormModal
        open={form.open}
        user={form.user}
        isSelf={form.user?._id === currentUserId}
        onClose={() => setForm({ open: false, user: null })}
        onSaved={(saved, created) => {
          setForm({ open: false, user: null });
          setData((list) =>
            created ? [...(list ?? []), saved].sort((a, b) => a.name.localeCompare(b.name)) : (list ?? []).map((u) => (u._id === saved._id ? saved : u))
          );
          enqueueSnackbar(created ? `${saved.name} was added` : 'Changes saved', { variant: 'success' });
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete user?"
        message={
          deleting && (
            <>
              <strong className="font-medium text-slate-900">{deleting.name}</strong> will lose access immediately. Their past
              leave requests are kept for records. To keep the account but block sign-in, deactivate it instead.
            </>
          )
        }
        confirmLabel="Delete user"
        busy={deletingBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
