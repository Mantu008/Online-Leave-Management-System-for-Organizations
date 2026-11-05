import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cx } from '../../lib/format';

/** Horizontally scrollable table that keeps its layout on small screens. */
export function Table({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    // `relative` makes this the containing block for absolutely positioned
    // descendants (e.g. sr-only labels), so they scroll with the table instead
    // of widening the page.
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50/70">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ className, children, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th scope="col" className={cx('whitespace-nowrap px-4 py-2.5 text-xs font-medium text-slate-500 sm:px-5', className)} {...rest}>
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function Td({ className, children, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cx('px-4 py-3 align-middle text-slate-700 sm:px-5', className)} {...rest}>
      {children}
    </td>
  );
}

/** Previous / next pagination for client-side lists. */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  const btn =
    'h-8 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50';
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:px-5">
      <span className="tabular-nums">
        {from}–{to} of {total}
      </span>
      <div className="flex gap-2">
        <button type="button" className={btn} onClick={() => onPageChange(page - 1)} disabled={page === 0}>
          Previous
        </button>
        <button type="button" className={btn} onClick={() => onPageChange(page + 1)} disabled={page >= pages - 1}>
          Next
        </button>
      </div>
    </nav>
  );
}
