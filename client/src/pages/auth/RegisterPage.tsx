import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearAuthMessages, register } from '../../store/slices/authSlice';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Feedback';
import { SelectField, TextField } from '../../components/ui/Form';
import { DEPARTMENTS } from '../../lib/constants';
import { todayInputValue } from '../../lib/dates';
import { rules } from '../../lib/validation';

const schema = Yup.object({
  name: rules.name(),
  email: rules.email(),
  password: rules.password(),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Confirm your password'),
  department: rules.department(),
  position: rules.position(),
  joiningDate: rules.joiningDate(),
});

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { submitting, error } = useAppSelector((s) => s.auth);

  useEffect(() => () => void dispatch(clearAuthMessages()), [dispatch]);

  return (
    <AuthLayout
      wide
      title="Create your account"
      subtitle="Get started in under a minute. New accounts join as employees; an admin can grant manager or admin access."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <Formik
        initialValues={{
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          department: '',
          position: '',
          joiningDate: '',
        }}
        validationSchema={schema}
        onSubmit={async ({ confirmPassword: _confirm, ...values }) => {
          const result = await dispatch(register({ ...values, email: values.email.trim(), name: values.name.trim() }));
          if (register.fulfilled.match(result)) navigate('/dashboard', { replace: true });
        }}
      >
        <Form noValidate className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <TextField name="name" label="Full name" autoComplete="name" placeholder="Jane Cooper" autoFocus />
          <TextField name="email" label="Work email" type="email" autoComplete="email" placeholder="you@company.com" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="password" label="Password" type="password" autoComplete="new-password" hint="At least 6 characters" />
            <TextField name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" />
          </div>
          <SelectField
            name="department"
            label="Department"
            placeholder="Select a department"
            options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="position" label="Job title" autoComplete="organization-title" placeholder="Product Designer" />
            <TextField name="joiningDate" label="Joining date" type="date" max={todayInputValue()} />
          </div>
          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            Create account
          </Button>
        </Form>
      </Formik>
    </AuthLayout>
  );
}
