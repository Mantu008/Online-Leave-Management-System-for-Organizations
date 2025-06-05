import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { addNotification } from '../store/slices/notificationSlice';
import { Notification } from '../types/notification';

class NotificationService {
    private socket: Socket | null = null;
    private static instance: NotificationService;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000; // 1 second

    private constructor() { }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    initialize() {
        const state = store.getState();
        const user = state.auth.user;

        if (!user) return;

        // Connect to Socket.io server
        this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay,
            timeout: 10000
        });

        // Set up connection event handlers
        this.socket.on('connect', () => {
            console.log('Connected to notification server');
            this.reconnectAttempts = 0;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.handleReconnect();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected:', reason);
            if (reason === 'io server disconnect') {
                // Server initiated disconnect, try to reconnect
                this.socket?.connect();
            }
        });

        // Join user's room
        this.socket.emit('joinUser', user._id);

        // Join department room
        if (user.department) {
            this.socket.emit('joinDepartment', user.department);
        }

        // Set up notification listeners based on user role
        this.setupNotificationListeners(user);
    }

    // Method to emit leave request event
    emitLeaveRequest(data: any) {
        if (this.socket) {
            this.socket.emit('leaveRequestSubmitted', data);
        }
    }

    // Method to emit holiday announcement
    emitHolidayAnnouncement(data: any) {
        if (this.socket) {
            this.socket.emit('holidayAnnounced', data);
        }
    }

    // Method to emit user creation
    emitUserCreated(data: any) {
        if (this.socket) {
            this.socket.emit('userCreated', data);
        }
    }

    // Method to emit system alert
    emitSystemAlert(data: any) {
        if (this.socket) {
            this.socket.emit('systemAlert', data);
        }
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
                this.socket?.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
            this.handleNotification({
                id: Date.now().toString(),
                type: 'system',
                message: 'Lost connection to notification server. Please refresh the page.',
                timestamp: new Date().toISOString(),
                read: false
            });
        }
    }

    private setupNotificationListeners(user: any) {
        if (!this.socket) return;

        // Common notifications for all roles
        this.socket.on('leaveStatusUpdate', (data: any) => {
            this.handleNotification({
                id: Date.now().toString(),
                type: 'leave',
                message: data.message,
                timestamp: new Date().toISOString(),
                read: false,
                data: data.leaveRequest
            });
        });

        // Role-specific notifications
        switch (user.role) {
            case 'employee':
                this.setupEmployeeNotifications();
                break;
            case 'manager':
                this.setupManagerNotifications();
                break;
            case 'admin':
                this.setupAdminNotifications();
                break;
        }
    }

    private setupEmployeeNotifications() {
        if (!this.socket) return;

        // Notifications specific to employees
        this.socket.on('holidayAnnouncement', (data: any) => {
            this.handleNotification({
                id: Date.now().toString(),
                type: 'holiday',
                message: data.message,
                timestamp: new Date().toISOString(),
                read: false,
                data: data.holiday
            });
        });
    }

    private setupManagerNotifications() {
        if (!this.socket) return;

        // Notifications specific to managers
        this.socket.on('departmentLeaveUpdate', (data: any) => {
            this.handleNotification({
                id: Date.now().toString(),
                type: 'leave',
                message: data.message,
                timestamp: new Date().toISOString(),
                read: false,
                data: data.leaveRequest
            });
        });

        this.socket.on('leaveRequestSubmitted', (data: any) => {
            this.handleNotification({
                id: Date.now().toString(),
                type: 'leave',
                message: `New leave request from ${data.employee.name}`,
                timestamp: new Date().toISOString(),
                read: false,
                data: data.leaveRequest
            });
        });
    }

    private setupAdminNotifications() {
        if (!this.socket) return;

        // Notifications specific to admins
        this.socket.on('userCreated', (data: any) => {
            this.handleNotification({
                id: Date.now().toString(),
                type: 'user',
                message: `New user registered: ${data.user.name}`,
                timestamp: new Date().toISOString(),
                read: false,
                data: data.user
            });
        });

        this.socket.on('systemAlert', (data: any) => {
            this.handleNotification({
                id: Date.now().toString(),
                type: 'system',
                message: data.message,
                timestamp: new Date().toISOString(),
                read: false,
                data: data.alert
            });
        });
    }

    private handleNotification(notification: Notification) {
        store.dispatch(addNotification(notification));
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default NotificationService.getInstance(); 