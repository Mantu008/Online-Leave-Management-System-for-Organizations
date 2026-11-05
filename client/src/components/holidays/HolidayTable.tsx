import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { Tag } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Table, TBody, Td, Th, THead } from '../ui/Table';
import { HOLIDAY_TYPE_LABELS } from '../../lib/constants';
import { formatDate, formatWeekday, toDateInputValue, todayInputValue } from '../../lib/dates';
import { cx } from '../../lib/format';
import type { Holiday } from '../../types';

export function YearSwitcher({ year, onChange }: { year: number; onChange: (year: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="secondary" onClick={() => onChange(year - 1)} aria-label="Previous year">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="w-12 text-center text-sm font-semibold tabular-nums" aria-live="polite">
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
              <Td className={cx('whitespace-nowrap', past ? 'text-slate-400' : 'font-medium text-slate-900')}>
                {formatDate(holiday.date)}
                <span className="ml-2 text-xs font-normal text-slate-400">{formatWeekday(holiday.date)}</span>
              </Td>
              <Td className={past ? 'text-slate-400' : 'text-slate-900'}>
                <span className="inline-flex items-center gap-1.5">
                  {holiday.name}
                  {holiday.isRecurring && <Repeat className="h-3.5 w-3.5 text-slate-400" aria-label="Repeats every year" />}
                </span>
              </Td>
              <Td>
                <Tag>{HOLIDAY_TYPE_LABELS[holiday.type]}</Tag>
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
