import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearAuthMessages, demoLogin, login } from '../../store/slices/authSlice';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Feedback';
import { TextField } from '../../components/ui/Form';
import { rules } from '../../lib/validation';
import type { Role } from '../../types';

const schema = Yup.object({
  email: rules.email(),
  password: Yup.string().required('Password is required'),
});

/** Set VITE_DEMO_LOGIN=false to hide the one-click demo accounts. */
const DEMO_ENABLED = import.meta.env.VITE_DEMO_LOGIN !== 'false';

const DEMO_ROLES: { role: Role; label: string; hint: string }[] = [
  { role: 'employee', label: 'Employee', hint: 'Apply for leave' },
  { role: 'manager', label: 'Manager', hint: 'Review requests' },
  { role: 'admin', label: 'Admin', hint: 'Manage everything' },
];

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { submitting, error, notice } = useAppSelector((s) => s.auth);
  const from = (location.state as { from?: string } | null)?.from;
  const [demoRole, setDemoRole] = useState<Role | null>(null);

  // Messages belong to this visit of the page only.
  useEffect(() => () => void dispatch(clearAuthMessages()), [dispatch]);

  const goNext = () => navigate(from && from !== '/login' ? from : '/dashboard', { replace: true });

  const signInAsDemo = async (role: Role) => {
    setDemoRole(role);
    const result = await dispatch(demoLogin(role));
    setDemoRole(null);
    if (demoLogin.fulfilled.match(result)) goNext();
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Use your work email to access your leave account."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-brand-700 hover:text-brand-900 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={schema}
        onSubmit={async (values) => {
          const result = await dispatch(login({ email: values.email.trim(), password: values.password }));
          if (login.fulfilled.match(result)) goNext();
        }}
      >
        <Form noValidate className="space-y-4">
          {notice && <Alert tone="info">{notice}</Alert>}
          {error && <Alert>{error}</Alert>}
          <TextField name="email" label="Email" type="email" autoComplete="email" autoFocus />
          <TextField name="password" label="Password" type="password" autoComplete="current-password" />
          <Button type="submit" className="w-full" loading={submitting && !demoRole} disabled={submitting}>
            Sign in
          </Button>
        </Form>
      </Formik>

      {DEMO_ENABLED && (
        <div className="mt-6">
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            Or try a demo account
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {DEMO_ROLES.map(({ role, label, hint }) => (
              <Button
                key={role}
                variant="secondary"
                className="h-auto flex-col gap-0.5 whitespace-normal py-2"
                loading={demoRole === role}
                disabled={submitting}
                onClick={() => signInAsDemo(role)}
                title={`Sign in as the demo ${label.toLowerCase()}`}
              >
                <span>{label}</span>
                <span className="text-[11px] font-normal text-slate-500">{hint}</span>
              </Button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">No registration needed. Demo accounts are shared by all visitors.</p>
        </div>
      )}
    </AuthLayout>
  );
}
