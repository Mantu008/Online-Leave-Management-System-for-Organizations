export type Role = 'employee' | 'manager' | 'admin';
export type LeaveType = 'annual' | 'sick' | 'casual';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type HolidayType = 'public' | 'company' | 'optional';

export type LeaveBalance = Record<LeaveType, number>;

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  position: string;
  joiningDate: string;
  leaveBalance: LeaveBalance;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** The populated employee on a leave request; null when the account was deleted. */
export interface LeaveEmployee {
  _id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
  leaveBalance?: LeaveBalance;
}

export interface LeaveRequest {
  _id: string;
  employee: LeaveEmployee | null;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  reason: string;
  manager?: { _id: string; name: string; email: string } | null;
  managerNote?: string;
  totalDays: number;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: HolidayType;
  description?: string;
  isRecurring: boolean;
  /** Set on recurring holidays: the date the series was created with. */
  originalDate?: string;
  isOccurrence?: boolean;
}

export interface StatusCounts {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface MonthlyPoint {
  year: number;
  month: number;
  count: number;
  approved?: number;
  pending?: number;
  rejected?: number;
}

export interface EmployeeStats {
  counts: StatusCounts;
  daysTaken: LeaveBalance;
  monthly: MonthlyPoint[];
  recent: LeaveRequest[];
}

export interface ManagerStats {
  department: string;
  teamSize: number;
  onLeaveToday: number;
  counts: StatusCounts;
  monthly: MonthlyPoint[];
}

export interface DepartmentBreakdown {
  department: string;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface AdminStats {
  users: Record<Role, number> & { total: number };
  departments: number;
  requests: StatusCounts;
  holidaysThisMonth: number;
  onLeaveToday: number;
  byDepartment: DepartmentBreakdown[];
  monthly: MonthlyPoint[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  department: string;
  position: string;
  joiningDate: string;
}

export interface LeaveRequestInput {
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason: string;
}

export interface LeaveDecision {
  status: 'approved' | 'rejected';
  managerNote?: string;
}

export interface HolidayInput {
  name: string;
  date: string;
  type: HolidayType;
  description: string;
  isRecurring: boolean;
}

export interface CreateUserInput extends RegisterInput {
  role: Role;
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>> & { isActive?: boolean };

export type NotificationType = 'leave' | 'holiday' | 'user' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  read: boolean;
  data?: Record<string, unknown>;
}
