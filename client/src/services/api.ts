import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, LeaveRequestData, LeaveRequest, LeaveUpdateData, HolidayData, Holiday } from '../types';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const API_URL = 'https://online-leave-management-system-for-phi.vercel.app/api';
console.log('Using API URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Add token to requests if available
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');

    console.log('Making request with token:', token ? 'Present' : 'Missing'); // Debug log

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header set:', config.headers.Authorization); // Debug log
    }

    // Add user role and department to headers for role-based access control
    if (user) {
        try {
            const userData = JSON.parse(user);
            config.headers['X-User-Role'] = userData.role;
            config.headers['X-User-Department'] = userData.department;
            console.log('User headers set:', { role: userData.role, department: userData.department }); // Debug log
        } catch (error) {
            console.error('Error parsing user data:', error); // Debug log
        }
    }

    return config;
}, (error) => {
    console.error('Request interceptor error:', error); // Debug log
    return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        console.error('Response error:', error.response?.status, error.response?.data); // Debug log

        if (error.response) {
            // Handle 401 Unauthorized errors
            if (error.response.status === 401) {
                console.log('Unauthorized error, logging out...'); // Debug log
                store.dispatch(logout());
                window.location.href = '/login';
            }
            // Handle 403 Forbidden errors (role-based access)
            if (error.response.status === 403) {
                console.log('Forbidden error, logging out...'); // Debug log
                store.dispatch(logout());
                window.location.href = '/login';
            }
            return Promise.reject(error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request); // Debug log
            return Promise.reject({ message: 'No response from server' });
        } else {
            console.error('Request setup error:', error.message); // Debug log
            return Promise.reject({ message: 'Error setting up request' });
        }
    }
);

// Auth Services
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
};

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

// Leave Services
export const createLeaveRequest = async (data: LeaveRequestData): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>('/leaves', data);
    return response.data;
};

export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
    const response = await api.get<LeaveRequest[]>('/leaves');
    return response.data;
};

export const getMyLeaves = () =>
    api.get('/leaves/my-leaves');

export const getDepartmentLeaves = () =>
    api.get('/leaves/department');

export const updateLeaveRequest = async (id: string, status: 'approved' | 'rejected'): Promise<LeaveRequest> => {
    const response = await api.patch<LeaveRequest>(`/leaves/${id}`, { status });
    return response.data;
};

// Holiday Services
export const createHoliday = (data: HolidayData) =>
    api.post('/holidays', data);

export const getHolidays = async (year?: number): Promise<Holiday[]> => {
    const response = await api.get<Holiday[]>('/holidays', { params: { year } });
    return response.data;
};

export const deleteHoliday = (holidayId: string) =>
    api.delete(`/holidays/${holidayId}`);

export const getHolidaysByYear = (year: number) =>
    api.get<Holiday[]>(`/holidays?year=${year}`);

export const updateHoliday = (id: string, holidayData: Partial<HolidayData>) =>
    api.patch(`/holidays/${id}`, holidayData);

export const applyLeave = (leaveData: {
    startDate: string;
    endDate: string;
    leaveType: string;
    reason: string;
}) =>
    api.post('/leaves', leaveData);

export const getPendingLeaves = () =>
    api.get<LeaveRequest[]>('/leaves/pending');

export const approveLeave = (leaveId: string) =>
    api.patch(`/leaves/${leaveId}/approve`);

export const rejectLeave = (leaveId: string) =>
    api.patch(`/leaves/${leaveId}/reject`);

export const getTeamLeaves = async (): Promise<LeaveRequest[]> => {
    const response = await api.get<LeaveRequest[]>('/leaves/team');
    return response.data;
};

export default api; 