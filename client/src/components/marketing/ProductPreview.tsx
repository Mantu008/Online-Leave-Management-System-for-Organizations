import { CalendarCheck2, CheckCircle2, Clock3, Plane, Users } from 'lucide-react';
import { cx } from '../../lib/format';

/**
 * A static, decorative rendering of the dashboard used on the landing and
 * sign-in pages. It is hidden from assistive technology.
 */
export function ProductPreview({ className }: { className?: string }) {
  const bars = [38, 52, 44, 70, 58, 82, 64, 90, 72, 60, 76, 88];
  const people = [
    { name: 'Priya Shah', type: 'Annual · 3 days', tone: 'bg-sky-100 text-sky-700', initials: 'PS' },
    { name: 'Daniel Okafor', type: 'Sick · 1 day', tone: 'bg-rose-100 text-rose-700', initials: 'DO' },
    { name: 'Mei Tanaka', type: 'Casual · 2 days', tone: 'bg-violet-100 text-violet-700', initials: 'MT' },
  ];
  return (
    <div aria-hidden="true" className={cx('select-none overflow-hidden rounded-2xl bg-white text-left shadow-2xl ring-1 ring-slate-900/10', className)}>
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-3 h-4 w-48 rounded bg-slate-200/70" />
      </div>
      <div className="grid gap-4 p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pending', value: '12', icon: Clock3, tone: 'bg-amber-50 text-amber-600' },
            { label: 'On leave today', value: '4', icon: Plane, tone: 'bg-sky-50 text-sky-600' },
            { label: 'Team members', value: '48', icon: Users, tone: 'bg-brand-50 text-brand-600' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-xl border border-slate-100 p-3">
              <span className={cx('flex h-7 w-7 items-center justify-center rounded-lg', tone)}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <p className="mt-2 text-[10px] font-medium text-slate-500">{label}</p>
              <p className="text-lg font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-slate-100 p-3 sm:col-span-3">
            <p className="text-[11px] font-semibold text-slate-700">Requests per month</p>
            <div className="mt-3 flex h-24 items-end gap-1.5">
              {bars.map((h, i) => (
                <span
                  key={i}
                  className={cx('flex-1 rounded-t', i === bars.length - 1 ? 'bg-brand-500' : 'bg-brand-200')}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 p-3 sm:col-span-2">
            <p className="text-[11px] font-semibold text-slate-700">Awaiting review</p>
            <ul className="mt-2 space-y-2">
              {people.map((p) => (
                <li key={p.name} className="flex items-center gap-2">
                  <span className={cx('flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold', p.tone)}>
                    {p.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-semibold text-slate-800">{p.name}</span>
                    <span className="block text-[9px] text-slate-500">{p.type}</span>
                  </span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 p-3 text-white">
          <CalendarCheck2 className="h-5 w-5 shrink-0" />
          <p className="text-[11px] font-medium">Leave approved · Your annual leave for 12–14 Dec was approved</p>
        </div>
      </div>
    </div>
  );
}
