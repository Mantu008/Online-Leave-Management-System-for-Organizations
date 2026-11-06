import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CalendarCheck2,
  CalendarRange,
  Check,
  FileDown,
  Menu,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearAuthMessages } from '../../store/slices/authSlice';
import { DEMO_ENABLED, DEMO_ROLES, useDemoLogin } from '../../components/auth/demo';
import { BrandLogo } from '../../components/layout/BrandMark';
import { ProductPreview } from '../../components/marketing/ProductPreview';
import { ButtonLink } from '../../components/ui/Button';
import { Alert, Spinner } from '../../components/ui/Feedback';
import { APP_NAME } from '../../lib/brand';
import { cx } from '../../lib/format';
import type { Role } from '../../types';

const FEATURES: { icon: LucideIcon; title: string; body: string; tone: string }[] = [
  {
    icon: CalendarCheck2,
    title: 'Self-service requests',
    body: 'Employees pick dates and a leave type and see exactly how many days remain before they submit.',
    tone: 'bg-brand-50 text-brand-600',
  },
  {
    icon: BellRing,
    title: 'Real-time approvals',
    body: 'Managers are notified the moment a request lands and can approve or reject with a note in one click.',
    tone: 'bg-amber-50 text-amber-600',
  },
  {
    icon: CalendarRange,
    title: 'Team calendar',
    body: "See who's out this month at a glance, so cover is planned before it becomes a problem.",
    tone: 'bg-sky-50 text-sky-600',
  },
  {
    icon: PartyPopper,
    title: 'Holiday-aware',
    body: 'Publish public and company holidays once. Recurring dates roll forward and are excluded automatically.',
    tone: 'bg-rose-50 text-rose-600',
  },
  {
    icon: BarChart3,
    title: 'Insightful dashboards',
    body: 'Track pending work, absence trends and department breakdowns with clear, accessible charts.',
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: FileDown,
    title: 'PDF reports',
    body: 'Export a clean leave history report for payroll, audits or personal records in a single click.',
    tone: 'bg-violet-50 text-violet-600',
  },
];

const STEPS = [
  { title: 'Request', body: 'An employee chooses dates and a reason. Balances and holidays are checked instantly.' },
  { title: 'Review', body: 'Their manager gets a live notification and approves or rejects with an optional note.' },
  { title: 'Plan', body: 'Balances update automatically and the absence appears on the team calendar.' },
];

const ROLE_COPY: Record<Role, { title: string; points: string[] }> = {
  employee: {
    title: 'For employees',
    points: ['Request leave in seconds', 'Track balances by leave type', 'Download your leave history'],
  },
  manager: {
    title: 'For managers',
    points: ['One-click approvals with notes', 'Team absence calendar', 'Department trends at a glance'],
  },
  admin: {
    title: 'For HR & admins',
    points: ['Manage people, roles and balances', 'Publish holiday calendars', 'Organisation-wide analytics'],
  },
};

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#roles', label: 'Who it’s for' },
];

function DemoButtons() {
  const { demoRole, signInAsDemo } = useDemoLogin();
  const { submitting, error } = useAppSelector((s) => s.auth);
  if (!DEMO_ENABLED) return null;
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
        {DEMO_ROLES.map(({ role, label, icon: Icon }) => (
          <button
            key={role}
            type="button"
            disabled={submitting}
            onClick={() => signInAsDemo(role)}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur transition-all hover:-translate-y-0.5 hover:text-brand-700 hover:ring-brand-300 disabled:opacity-60"
          >
            {demoRole === role ? <Spinner className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {label} demo
          </button>
        ))}
      </div>
      {error && <Alert className="mt-3 text-left">{error}</Alert>}
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { demoRole, signInAsDemo } = useDemoLogin();
  const submitting = useAppSelector((s) => s.auth.submitting);
  const dispatch = useAppDispatch();

  useEffect(() => () => void dispatch(clearAuthMessages()), [dispatch]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label={`${APP_NAME} home`}>
            <BrandLogo />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <ButtonLink to="/login" variant="ghost">
              Sign in
            </ButtonLink>
            <ButtonLink to="/register">Get started free</ButtonLink>
          </div>
          <button
            type="button"
            className="ml-auto rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="landing-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div id="landing-menu" className="border-t border-slate-200 px-4 py-3 md:hidden">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <ButtonLink to="/login" variant="secondary">
                Sign in
              </ButtonLink>
              <ButtonLink to="/register">Get started</ButtonLink>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="bg-grid-light absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" aria-hidden="true" />
          <div className="absolute left-1/2 top-0 -z-0 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-200/60 via-violet-200/40 to-transparent blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-2 lg:px-8 lg:pb-28">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Real-time approvals for every team
              </span>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                Time off,{' '}
                <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">without the back-and-forth.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 lg:mx-0">
                {APP_NAME} replaces leave spreadsheets and email chains with one simple workspace to request, approve and plan
                time off — for employees, managers and HR.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <ButtonLink to="/register" size="lg" className="shadow-glow">
                  Get started free
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink to="/login" size="lg" variant="secondary">
                  Sign in
                </ButtonLink>
              </div>
              {DEMO_ENABLED && (
                <div className="mt-8">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">Or jump straight into a live demo</p>
                  <DemoButtons />
                </div>
              )}
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-brand-500/20 to-violet-500/20 blur-2xl" aria-hidden="true" />
              <ProductPreview className="relative" />
            </div>
          </div>
        </section>

        {/* Value strip */}
        <section className="border-y border-slate-100 bg-slate-50/60">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[
              ['3 roles', 'Employee, manager & admin'],
              ['Live', 'Socket-powered notifications'],
              ['1 click', 'Approve or reject requests'],
              ['PDF', 'Exportable leave reports'],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <dt className="sr-only">{label}</dt>
                <dd className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{value}</dd>
                <dd className="mt-1 text-sm text-slate-500">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Features</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Everything your team needs to manage leave</h2>
              <p className="mt-4 text-lg text-slate-600">
                Thoughtfully designed workflows that stay out of the way, so people spend less time on admin and more time on work.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, body, tone }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-raised"
                >
                  <span className={cx('flex h-11 w-11 items-center justify-center rounded-xl', tone)}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="relative scroll-mt-20 overflow-hidden bg-slate-950 py-20 text-white sm:py-28">
          <div className="bg-grid absolute inset-0" aria-hidden="true" />
          <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">How it works</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From request to approved in minutes</h2>
            </div>
            <ol className="mt-16 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-bold">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-300">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="scroll-mt-20 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Built for everyone</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">A tailored workspace for every role</h2>
              <p className="mt-4 text-lg text-slate-600">Each person sees exactly what they need — nothing more, nothing less.</p>
            </div>
            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              {DEMO_ROLES.map(({ role, icon: Icon }, i) => {
                const copy = ROLE_COPY[role];
                const featured = i === 1;
                return (
                  <div
                    key={role}
                    className={cx(
                      'flex flex-col rounded-2xl p-8',
                      featured
                        ? 'bg-gradient-to-b from-brand-600 to-brand-800 text-white shadow-glow ring-1 ring-brand-700'
                        : 'border border-slate-200 bg-white shadow-card'
                    )}
                  >
                    <span
                      className={cx(
                        'flex h-11 w-11 items-center justify-center rounded-xl',
                        featured ? 'bg-white/15 text-white' : 'bg-brand-50 text-brand-600'
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold">{copy.title}</h3>
                    <ul className="mt-5 flex-1 space-y-3">
                      {copy.points.map((p) => (
                        <li key={p} className={cx('flex items-start gap-2.5', featured ? 'text-brand-50' : 'text-slate-600')}>
                          <Check className={cx('mt-0.5 h-4 w-4 shrink-0', featured ? 'text-brand-200' : 'text-brand-600')} aria-hidden="true" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    {DEMO_ENABLED && (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => signInAsDemo(role)}
                        className={cx(
                          'mt-8 inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60',
                          featured
                            ? 'bg-white text-brand-700 hover:bg-brand-50'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        )}
                      >
                        {demoRole === role && <Spinner className="h-4 w-4" />}
                        Try the {role} demo
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 px-6 py-16 text-center shadow-glow sm:px-16">
            <div className="bg-grid absolute inset-0 opacity-60" aria-hidden="true" />
            <div className="relative">
              <ShieldCheck className="mx-auto h-10 w-10 text-brand-200" aria-hidden="true" />
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to simplify time off?</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
                Set up your workspace in minutes. No spreadsheets, no lost emails, no surprises.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-base font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
                >
                  Create your account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center justify-center rounded-lg px-6 text-base font-semibold text-white ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <BrandLogo />
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
