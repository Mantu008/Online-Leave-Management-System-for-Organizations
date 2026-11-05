import { describe, expect, it } from 'vitest';
import { buildLeaveReport } from './leaveReport';
import type { LeaveRequest, User } from '../types';

const user: User = {
  _id: 'u1',
  name: '<b>Asha</b>',
  email: 'asha@example.com',
  role: 'employee',
  department: 'IT',
  position: 'Engineer',
  joiningDate: '2023-01-10T00:00:00.000Z',
  leaveBalance: { annual: 12, sick: 10, casual: 9 },
  isActive: true,
};

const leave = (id: string, reason: string): LeaveRequest => ({
  _id: id,
  employee: null,
  leaveType: 'annual',
  startDate: '2025-03-10T00:00:00.000Z',
  endDate: '2025-03-12T00:00:00.000Z',
  status: 'approved',
  reason,
  totalDays: 3,
  department: 'IT',
  createdAt: '2025-03-01T00:00:00.000Z',
  updatedAt: '2025-03-01T00:00:00.000Z',
});

describe('buildLeaveReport', () => {
  it('includes every request, not just one page', () => {
    const leaves = Array.from({ length: 25 }, (_, i) => leave(String(i), `Reason number ${i}`));
    const report = buildLeaveReport(user, leaves);
    expect(report.querySelectorAll('tr')).toHaveLength(26); // header + 25 rows
  });

  it('renders user-supplied text as text, never as markup', () => {
    const report = buildLeaveReport(user, [leave('1', '<img src=x onerror="alert(1)">')]);
    expect(report.querySelector('img')).toBeNull();
    expect(report.querySelector('b')).toBeNull();
    expect(report.textContent).toContain('<img src=x onerror="alert(1)">');
  });
});
