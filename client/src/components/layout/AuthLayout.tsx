import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, CalendarCheck2, ShieldCheck } from 'lucide-react';
import { APP_NAME } from '../../lib/brand';
import { BrandLogo } from './BrandMark';
import { ProductPreview } from '../marketing/ProductPreview';

const HIGHLIGHTS = [
  { icon: CalendarCheck2, text: 'Request leave in seconds with live balance checks' },
  { icon: BellRing, text: 'Managers approve instantly, with real-time notifications' },
  { icon: ShieldCheck, text: 'Role-based access for employees, managers and admins' },
];

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
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:flex-none lg:basis-1/2 lg:px-16 xl:px-24">
        <Link to="/" className="self-start" aria-label={`${APP_NAME} home`}>
          <BrandLogo />
        </Link>
        <div className="flex flex-1 items-center py-10">
          <div className={wide ? 'mx-auto w-full max-w-lg' : 'mx-auto w-full max-w-sm'}>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-2 text-[15px] text-slate-500">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-sm text-slate-500">{footer}</div>}
          </div>
        </div>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>

      <div className="relative hidden flex-1 overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-center">
        <div className="bg-grid absolute inset-0" aria-hidden="true" />
        <div
          className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-600/40 blur-3xl"
          aria-hidden="true"
        />
        <div className="absolute -bottom-40 -left-20 h-[26rem] w-[26rem] rounded-full bg-violet-600/30 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-xl px-12 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">{APP_NAME}</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
            Time off, without the back-and-forth.
          </h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[15px] text-slate-300">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-300 ring-1 ring-white/10">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <ProductPreview className="mt-12 origin-top-left scale-[0.96]" />
        </div>
      </div>
    </div>
  );
}
