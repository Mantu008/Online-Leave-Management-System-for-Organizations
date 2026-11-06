import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearAuthMessages, login } from '../../store/slices/authSlice';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { DEMO_ENABLED, DEMO_ROLES, useDemoLogin } from '../../components/auth/demo';
import { Button } from '../../components/ui/Button';
import { Alert, Spinner } from '../../components/ui/Feedback';
import { TextField } from '../../components/ui/Form';
import { rules } from '../../lib/validation';

const schema = Yup.object({
  email: rules.email(),
  password: Yup.string().required('Password is required'),
});

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { submitting, error, notice } = useAppSelector((s) => s.auth);
  const from = (location.state as { from?: string } | null)?.from;
  const next = from && from !== '/login' ? from : '/dashboard';
  const { demoRole, signInAsDemo } = useDemoLogin(next);

  // Messages belong to this visit of the page only.
  useEffect(() => () => void dispatch(clearAuthMessages()), [dispatch]);

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your work email to continue."
      footer={
        <>
          New to the platform?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
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
          if (login.fulfilled.match(result)) navigate(next, { replace: true });
        }}
      >
        <Form noValidate className="space-y-5">
          {notice && <Alert tone="info">{notice}</Alert>}
          {error && <Alert>{error}</Alert>}
          <TextField name="email" label="Work email" type="email" autoComplete="email" placeholder="you@company.com" autoFocus />
          <TextField name="password" label="Password" type="password" autoComplete="current-password" placeholder="••••••••" />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={submitting && !demoRole}
            disabled={submitting}
          >
            Sign in
            {!(submitting && !demoRole) && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </Form>
      </Formik>

      {DEMO_ENABLED && (
        <div className="mt-8">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            Or explore a live demo
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {DEMO_ROLES.map(({ role, label, hint, icon: Icon }) => (
              <button
                key={role}
                type="button"
                disabled={submitting}
                onClick={() => signInAsDemo(role)}
                title={`Sign in as the demo ${label.toLowerCase()}`}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-glow disabled:pointer-events-none disabled:opacity-60"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  {demoRole === role ? <Spinner className="h-4 w-4" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                </span>
                <span className="text-sm font-semibold text-slate-800">{label}</span>
                <span className="text-[11px] leading-tight text-slate-500">{hint}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">No sign-up needed. Demo accounts are shared by all visitors.</p>
        </div>
      )}
    </AuthLayout>
  );
}
