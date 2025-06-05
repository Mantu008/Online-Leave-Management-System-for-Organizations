export interface Notification {
    id: string;
    type: 'leave' | 'holiday' | 'user' | 'system';
    message: string;
    timestamp: string;
    read: boolean;
    data?: any;
}

export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
} 