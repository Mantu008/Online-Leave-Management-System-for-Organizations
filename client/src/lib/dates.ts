// Leave and holiday dates are calendar days stored as UTC midnight. They must be
// formatted in UTC, otherwise users west of Greenwich see the previous day.
// Timestamps (createdAt, lastLogin) are real instants and use local time.

const DAY_MS = 24 * 60 * 60 * 1000;

type DateInput = string | Date;
const toDate = (value: DateInput) => (value instanceof Date ? value : new Date(value));

export function formatDate(value: DateInput | undefined | null, options: { year?: boolean } = {}): string {
  if (!value) return '—';
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    ...(options.year === false ? {} : { year: 'numeric' }),
    timeZone: 'UTC',
  });
}

export function formatDateRange(start: DateInput, end: DateInput): string {
  const s = toDate(start);
  const e = toDate(end);
  if (s.getTime() === e.getTime()) return formatDate(s);
  const sameYear = s.getUTCFullYear() === e.getUTCFullYear();
  return `${formatDate(s, { year: !sameYear })} – ${formatDate(e)}`;
}

export function formatWeekday(value: DateInput): string {
  return toDate(value).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' });
}

export function formatDateTime(value: DateInput | undefined | null): string {
  if (!value) return '—';
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

export function formatRelative(value: DateInput, now: Date = new Date()): string {
  const seconds = Math.round((toDate(value).getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return relative.format(seconds, 'second');
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), 'hour');
  return relative.format(Math.round(seconds / 86400), 'day');
}

/** "YYYY-MM-DD" in the user's local calendar — what a date input shows as today. */
export function todayInputValue(now: Date = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

/** The calendar-day part of a stored UTC date, for <input type="date">. */
export function toDateInputValue(value: DateInput | undefined | null): string {
  if (!value) return '';
  const date = toDate(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Inclusive calendar days between two "YYYY-MM-DD" values; 0 when invalid or reversed. */
export function countDays(start: string, end: string): number {
  if (!DATE_ONLY.test(start) || !DATE_ONLY.test(end)) return 0;
  const diff = Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`);
  if (Number.isNaN(diff) || diff < 0) return 0;
  return Math.round(diff / DAY_MS) + 1;
}

/** Whether a stored date-only range overlaps a calendar month (month is 0-based). */
export function overlapsMonth(start: DateInput, end: DateInput, year: number, month: number): boolean {
  const monthStart = Date.UTC(year, month, 1);
  const monthEnd = Date.UTC(year, month + 1, 0);
  return toDate(start).getTime() <= monthEnd && toDate(end).getTime() >= monthStart;
}

export function monthLabel(year: number, month: number, style: 'short' | 'long' = 'short'): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, { month: style, timeZone: 'UTC' });
}

/** Axis labels for a monthly series; the year is shown on the first point and each January. */
export function monthLabels(series: Array<{ year: number; month: number }>): string[] {
  return series.map((p, i) =>
    i === 0 || p.month === 1 ? `${monthLabel(p.year, p.month)} ${String(p.year).slice(2)}` : monthLabel(p.year, p.month)
  );
}
