import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { Tag } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Table, TBody, Td, Th, THead } from '../ui/Table';
import { HOLIDAY_TYPE_LABELS } from '../../lib/constants';
import { formatWeekday, toDateInputValue, todayInputValue } from '../../lib/dates';
import { cx } from '../../lib/format';
import type { Holiday, HolidayType } from '../../types';

const TYPE_STYLES: Record<HolidayType, string> = {
  public: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  company: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  optional: 'bg-amber-50 text-amber-700 ring-amber-600/25',
};

function DateTile({ value, muted }: { value: string; muted: boolean }) {
  const date = new Date(value);
  const month = date.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });
  return (
    <span
      className={cx(
        'flex h-11 w-11 shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg ring-1 ring-inset',
        muted ? 'bg-slate-50 text-slate-400 ring-slate-200' : 'bg-white text-slate-900 ring-slate-200 shadow-sm'
      )}
      aria-hidden="true"
    >
      <span className={cx('w-full text-center text-[9px] font-bold uppercase leading-4', muted ? 'bg-slate-200 text-slate-500' : 'bg-rose-500 text-white')}>
        {month}
      </span>
      <span className="text-base font-bold leading-6 tabular-nums">{date.getUTCDate()}</span>
    </span>
  );
}

export function YearSwitcher({ year, onChange }: { year: number; onChange: (year: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="secondary" onClick={() => onChange(year - 1)} aria-label="Previous year">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="w-14 text-center text-sm font-bold tabular-nums text-slate-900" aria-live="polite">
        {year}
      </span>
      <Button size="sm" variant="secondary" onClick={() => onChange(year + 1)} aria-label="Next year">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function HolidayTable({ holidays, actions }: { holidays: Holiday[]; actions?: (holiday: Holiday) => ReactNode }) {
  const today = todayInputValue();
  return (
    <Table caption="Holidays">
      <THead>
        <Th>Date</Th>
        <Th>Holiday</Th>
        <Th>Type</Th>
        <Th>Notes</Th>
        {actions && (
          <Th>
            <span className="sr-only">Actions</span>
          </Th>
        )}
      </THead>
      <TBody>
        {holidays.map((holiday) => {
          const past = toDateInputValue(holiday.date) < today;
          return (
            <tr key={`${holiday._id}-${holiday.date}`} className={cx(past && 'text-slate-400')}>
              <Td className="whitespace-nowrap">
                <span className="flex items-center gap-3">
                  <DateTile value={holiday.date} muted={past} />
                  <span className={cx('text-xs', past ? 'text-slate-400' : 'text-slate-500')}>
                    {formatWeekday(holiday.date)}
                    {past && <span className="block">Passed</span>}
                  </span>
                </span>
              </Td>
              <Td className={past ? 'text-slate-400' : 'font-semibold text-slate-900'}>
                <span className="inline-flex items-center gap-1.5">
                  {holiday.name}
                  {holiday.isRecurring && <Repeat className="h-3.5 w-3.5 text-slate-400" aria-label="Repeats every year" />}
                </span>
              </Td>
              <Td>
                <Tag className={cx(TYPE_STYLES[holiday.type], past && 'opacity-60')}>{HOLIDAY_TYPE_LABELS[holiday.type]}</Tag>
              </Td>
              <Td className={cx('max-w-xs', past ? 'text-slate-400' : 'text-slate-500')}>{holiday.description || '—'}</Td>
              {actions && <Td className="whitespace-nowrap text-right">{actions(holiday)}</Td>}
            </tr>
          );
        })}
      </TBody>
    </Table>
  );
}
