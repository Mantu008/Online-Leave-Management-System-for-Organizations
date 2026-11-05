import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className={wide ? "w-full max-w-md" : "w-full max-w-sm"}>
        <div className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BrandMark />
          Leave Management
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1.5 text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-sm text-slate-500">{footer}</div>}
      </div>
    </div>
  );
}
