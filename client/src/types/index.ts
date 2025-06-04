export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'employee';
    department: string;
    leaveBalance: {
        annual: number;
        sick: number;
        casual: number;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    department: string;
    role: string;
    leaveBalance?: {
        annual: number;
        sick: number;
        casual: number;
    };
}

export interface LeaveRequestData {
    startDate: string;
    endDate: string;
    leaveType: 'annual' | 'sick' | 'casual';
    reason: string;
}

export interface LeaveRequest {
    _id: string;
    employee: User;
    leaveType: 'annual' | 'sick' | 'casual';
    startDate: string;
    endDate: string;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    comments?: string;
    manager?: User;
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
    type: 'public' | 'company' | 'optional';
    description?: string;
    isRecurring: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LeaveState {
    leaves: LeaveRequest[];
    selectedLeave: LeaveRequest | null;
    isLoading: boolean;
    error: string | null;
}

export interface HolidayState {
    holidays: Holiday[];
    isLoading: boolean;
    error: string | null;
}

export interface LeaveUpdateData {
    status: 'approved' | 'rejected';
    managerNote?: string;
}

export interface HolidayData {
    name: string;
    date: string;
    type: 'public' | 'company';
    description?: string;
}

export interface RootState {
    auth: AuthState;
} 