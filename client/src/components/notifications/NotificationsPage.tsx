import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { io, Socket } from 'socket.io-client';
import { Alert, CircularProgress, List, ListItem, ListItemText, Typography, Paper, Snackbar } from '@mui/material';

interface Notification {
  type: string;
  message: string;
  leaveRequest?: any;
  timestamp: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user) return;

    // Connect to Socket.io server
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Join user's room
    socket.emit('joinUser', user._id);

    // Join department room
    if (user.department) {
      socket.emit('joinDepartment', user.department);
    }

    // Listen for notifications
    socket.on('leaveStatusUpdate', (data: Notification) => {
      const newNotification = {
        ...data,
        timestamp: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev]);
      setCurrentNotification(newNotification);
    });

    socket.on('departmentLeaveUpdate', (data: Notification) => {
      if (user.role === 'manager') {
        const newNotification = {
          ...data,
          timestamp: new Date().toISOString()
        };
        setNotifications(prev => [newNotification, ...prev]);
        setCurrentNotification(newNotification);
      }
    });

    setLoading(false);

    return () => {
      socket.close();
    };
  }, [user]);

  const handleCloseNotification = () => {
    setCurrentNotification(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Typography variant="h4" className="mb-6">
          Notifications
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {notifications.length === 0 ? (
          <Paper className="p-6 text-center">
            <Typography color="textSecondary">
              No notifications yet
            </Typography>
          </Paper>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <ListItem
                key={index}
                className="mb-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.timestamp).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        )}
      </div>

      <Snackbar
        open={!!currentNotification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={currentNotification?.type === 'leaveStatusUpdate' ? 'info' : 'success'}
          sx={{ width: '100%' }}
        >
          {currentNotification?.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default NotificationsPage; 