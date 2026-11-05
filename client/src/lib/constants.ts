import type { HolidayType, LeaveBalance, LeaveStatus, LeaveType, Role } from '../types';

export const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Marketing', 'Operations'] as const;

export const POSITIONS = ['Employee', 'Senior Employee', 'Team Lead', 'Manager', 'Senior Manager', 'Director'] as const;

export const LEAVE_TYPES: LeaveType[] = ['annual', 'sick', 'casual'];

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual: 'Annual',
  sick: 'Sick',
  casual: 'Casual',
};

/** Yearly entitlement for a new account. Mirrors DEFAULT_LEAVE_BALANCE on the server. */
export const LEAVE_ENTITLEMENT: LeaveBalance = { annual: 20, sick: 10, casual: 10 };

export const STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const ROLES: Role[] = ['employee', 'manager', 'admin'];

export const ROLE_LABELS: Record<Role, string> = {
  employee: 'Employee',
  manager: 'Manager',
  admin: 'Administrator',
};

export const HOLIDAY_TYPES: HolidayType[] = ['public', 'company', 'optional'];

export const HOLIDAY_TYPE_LABELS: Record<HolidayType, string> = {
  public: 'Public',
  company: 'Company',
  optional: 'Optional',
};
