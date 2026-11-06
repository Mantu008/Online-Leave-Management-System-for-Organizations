import type { ReactNode } from 'react';

/** Gradient greeting card at the top of each dashboard. */
export function WelcomeBanner({
  title,
  description,
  actions,
  aside,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 px-6 py-7 text-white shadow-glow sm:px-8 sm:py-8">
      <div className="bg-grid absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 text-[15px] text-brand-100">{description}</p>}
          {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
    </section>
  );
}

/** A translucent figure shown on the banner. */
export function BannerFigure({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-xl bg-white/10 px-5 py-4 ring-1 ring-inset ring-white/20 backdrop-blur">
      <p className="text-xs font-medium uppercase tracking-wider text-brand-100">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-brand-100">{hint}</p>}
    </div>
  );
}

export const bannerButton =
  'inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-50';
export const bannerGhostButton =
  'inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/10';
