import { http } from './http';
import type {
  AdminStats,
  AuthResponse,
  CreateUserInput,
  EmployeeStats,
  Holiday,
  HolidayInput,
  LeaveDecision,
  LeaveRequest,
  LeaveRequestInput,
  LeaveStatus,
  LoginCredentials,
  ManagerStats,
  RegisterInput,
  UpdateUserInput,
  User,
} from '../types';

const data = <T>(promise: Promise<{ data: T }>) => promise.then((res) => res.data);

export const authApi = {
  login: (credentials: LoginCredentials) => data(http.post<AuthResponse>('/auth/login', credentials)),
  register: (input: RegisterInput) => data(http.post<AuthResponse>('/auth/register', input)),
  me: () => data(http.get<User>('/auth/me')),
};

export const leavesApi = {
  /** Scoped by role on the server: own, department, or all requests. */
  list: (status?: LeaveStatus) => data(http.get<LeaveRequest[]>('/leaves', { params: status ? { status } : {} })),
  create: (input: LeaveRequestInput) => data(http.post<LeaveRequest>('/leaves', input)),
  decide: (id: string, decision: LeaveDecision) => data(http.patch<LeaveRequest>(`/leaves/${id}`, decision)),
  employeeStats: () => data(http.get<EmployeeStats>('/leaves/employee/stats')),
  managerStats: () => data(http.get<ManagerStats>('/leaves/manager/stats')),
};

export const holidaysApi = {
  list: (year: number) => data(http.get<Holiday[]>('/holidays', { params: { year } })),
  create: (input: HolidayInput) => data(http.post<Holiday>('/holidays', input)),
  update: (id: string, input: Partial<HolidayInput>) => data(http.patch<Holiday>(`/holidays/${id}`, input)),
  remove: (id: string) => data(http.delete<{ message: string }>(`/holidays/${id}`)),
};

export const usersApi = {
  list: () => data(http.get<User[]>('/users')),
  create: (input: CreateUserInput) => data(http.post<User>('/users', input)),
  update: (id: string, input: UpdateUserInput) => data(http.put<User>(`/users/${id}`, input)),
  remove: (id: string) => data(http.delete<{ message: string }>(`/users/${id}`)),
};

export const adminApi = {
  stats: () => data(http.get<AdminStats>('/admin/stats')),
};
