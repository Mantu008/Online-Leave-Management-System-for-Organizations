import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppNotification } from '../../types';

const MAX_NOTIFICATIONS = 50;

interface NotificationState {
  items: AppNotification[];
}

const initialState: NotificationState = { items: [] };

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<AppNotification, 'read'>>) => {
      if (state.items.some((n) => n.id === action.payload.id)) return;
      state.items.unshift({ ...action.payload, read: false });
      state.items.length = Math.min(state.items.length, MAX_NOTIFICATIONS);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) item.read = true;
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => {
        n.read = true;
      });
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const selectUnreadCount = (state: { notifications: NotificationState }) =>
  state.notifications.items.filter((n) => !n.read).length;

export const { addNotification, markAsRead, markAllAsRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
