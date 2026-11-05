import * as Yup from 'yup';
import { todayInputValue } from './dates';

// Shared rules, matching the server's validators (server/validators/userRules.js).
export const rules = {
  name: () => Yup.string().trim().required('Name is required').max(100, 'Name is too long'),
  email: () => Yup.string().trim().email('Enter a valid email address').required('Email is required'),
  password: () => Yup.string().min(6, 'Password must be at least 6 characters').max(128).required('Password is required'),
  department: () => Yup.string().trim().required('Department is required'),
  position: () => Yup.string().trim().required('Position is required').max(80),
  joiningDate: () =>
    Yup.string()
      .required('Joining date is required')
      .test('not-future', 'Joining date cannot be in the future', (value) => !value || value <= todayInputValue()),
};

/** Turns server-side field errors into Formik errors so they show next to the field. */
export function applyFieldErrors(
  error: unknown,
  setErrors: (errors: Record<string, string>) => void
): boolean {
  const fieldErrors = (error as { fieldErrors?: Record<string, string> })?.fieldErrors;
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    setErrors(fieldErrors);
    return true;
  }
  return false;
}
