import { useField } from 'formik';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cx } from '../../lib/format';

interface FieldShellProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Label + control + hint/error, with the ARIA wiring between them. */
export function FieldShell({ id, label, hint, error, children, className }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-800">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-700">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: ReactNode) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

type Common = { name: string; label: string; hint?: ReactNode; className?: string };

export function TextField({ name, label, hint, className, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const [field, meta] = useField(name);
  const error = meta.touched ? meta.error : undefined;
  return (
    <FieldShell id={name} label={label} hint={hint} error={error} className={className}>
      <input
        id={name}
        {...field}
        value={field.value ?? ''}
        {...rest}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(name, error, hint)}
        className={cx('control', error && 'control-invalid')}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  hint,
  className,
  options,
  placeholder,
  ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement> & { options: Array<{ value: string; label: string }>; placeholder?: string }) {
  const [field, meta] = useField(name);
  const error = meta.touched ? meta.error : undefined;
  return (
    <FieldShell id={name} label={label} hint={hint} error={error} className={className}>
      <select
        id={name}
        {...field}
        {...rest}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(name, error, hint)}
        className={cx('control', error && 'control-invalid')}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function TextareaField({ name, label, hint, className, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [field, meta] = useField(name);
  const error = meta.touched ? meta.error : undefined;
  return (
    <FieldShell id={name} label={label} hint={hint} error={error} className={className}>
      <textarea
        id={name}
        {...field}
        {...rest}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(name, error, hint)}
        className={cx('control min-h-[5.5rem] resize-y', error && 'control-invalid')}
      />
    </FieldShell>
  );
}

export function CheckboxField({ name, label, hint }: { name: string; label: string; hint?: string }) {
  const [field] = useField({ name, type: 'checkbox' });
  return (
    <label className="flex items-start gap-2.5">
      <input
        type="checkbox"
        {...field}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-600"
      />
      <span>
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}
