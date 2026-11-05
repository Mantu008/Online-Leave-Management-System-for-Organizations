import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearAuthMessages, login } from '../../store/slices/authSlice';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Feedback';
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

  // Messages belong to this visit of the page only.
  useEffect(() => () => void dispatch(clearAuthMessages()), [dispatch]);

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
          if (login.fulfilled.match(result)) navigate(from && from !== '/login' ? from : '/dashboard', { replace: true });
        }}
      >
        <Form noValidate className="space-y-4">
          {notice && <Alert tone="info">{notice}</Alert>}
          {error && <Alert>{error}</Alert>}
          <TextField name="email" label="Email" type="email" autoComplete="email" autoFocus />
          <TextField name="password" label="Password" type="password" autoComplete="current-password" />
          <Button type="submit" className="w-full" loading={submitting}>
            Sign in
          </Button>
        </Form>
      </Formik>
    </AuthLayout>
  );
}
