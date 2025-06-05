import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from sessionStorage
const getAuthToken = () => {
    const token = sessionStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
};

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add token to all requests
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export interface User {
    _id: string;
    id?: string; // Optional id field for DataGrid
    name: string;
    email: string;
    role: string;
    department: string;
    status?: string; // Optional status field for display
    isActive: boolean;
    position: string;
    joiningDate: string;
    leaveBalance: {
        annual: number;
        sick: number;
        casual: number;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateUserDto {
    name: string;
    email: string;
    role: string;
    department: string;
    position: string;
    password: string;
    joiningDate: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: string;
    department?: string;
    position?: string;
    status?: string;
    joiningDate?: string;
}

const userService = {
    getAllUsers: async (): Promise<User[]> => {
        const response = await api.get('/users');
        return response.data;
    },

    getUserById: async (id: string): Promise<User> => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    createUser: async (userData: CreateUserDto): Promise<User> => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    updateUser: async (id: string, userData: UpdateUserDto): Promise<User> => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
};

export default userService; 