import { LEAVE_TYPES, LEAVE_TYPE_LABELS, STATUS_LABELS } from './constants';
import { formatDate, formatDateRange } from './dates';
import type { LeaveRequest, User } from '../types';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, style?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (style) node.setAttribute('style', style);
  return node;
}

/**
 * Builds the printable report. Content is set with textContent only, so user
 * supplied text (names, reasons) can never be interpreted as markup.
 */
export function buildLeaveReport(user: User, leaves: LeaveRequest[]): HTMLElement {
  const root = el('div', undefined, 'font-family: Arial, sans-serif; color: #0f172a; padding: 8px; font-size: 11px;');
  root.append(el('h1', 'Leave history', 'font-size: 18px; margin: 0 0 4px;'));
  root.append(
    el('p', `${user.name} · ${user.position} · ${user.department}`, 'margin: 0; color: #475569;'),
    el('p', `Generated ${formatDate(new Date())}`, 'margin: 0 0 12px; color: #475569;')
  );

  const balance = el('p', undefined, 'margin: 0 0 12px;');
  balance.textContent =
    'Remaining balance: ' + LEAVE_TYPES.map((t) => `${LEAVE_TYPE_LABELS[t]} ${user.leaveBalance[t] ?? 0}`).join(' · ');
  root.append(balance);

  const table = el('table', undefined, 'width: 100%; border-collapse: collapse;');
  const cell = 'border-bottom: 1px solid #e2e8f0; padding: 6px 4px; text-align: left; vertical-align: top;';
  const head = el('tr');
  ['Dates', 'Type', 'Days', 'Status', 'Reason', 'Manager note'].forEach((h) =>
    head.append(el('th', h, `${cell} color: #475569; font-weight: 600;`))
  );
  table.append(head);
  leaves.forEach((leave) => {
    const row = el('tr');
    [
      formatDateRange(leave.startDate, leave.endDate),
      LEAVE_TYPE_LABELS[leave.leaveType],
      String(leave.totalDays),
      STATUS_LABELS[leave.status],
      leave.reason,
      leave.managerNote ?? '',
    ].forEach((value) => row.append(el('td', value, cell)));
    table.append(row);
  });
  root.append(table);
  return root;
}

export async function downloadLeaveReport(user: User, leaves: LeaveRequest[]): Promise<void> {
  // Loaded on demand: the PDF toolchain is large and rarely used.
  const { default: html2pdf } = await import('html2pdf.js');
  await html2pdf()
    .set({
      margin: 0.5,
      filename: 'leave-history.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    })
    .from(buildLeaveReport(user, leaves))
    .save();
}
