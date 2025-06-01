import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { RootState } from '../../store';
import { Snackbar, Alert } from '@mui/material';

interface Notification {
  type: string;
  message: string;
  leaveRequest?: any;
}

const Notification: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user) return;

    // Connect to Socket.io server
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    setSocket(socket);

    // Join user's room
    socket.emit('joinUser', user._id);

    // Join department room
    if (user.department) {
      socket.emit('joinDepartment', user.department);
    }

    // Listen for notifications
    socket.on('leaveStatusUpdate', (data: Notification) => {
      setNotification(data);
    });

    socket.on('departmentLeaveUpdate', (data: Notification) => {
      if (user.role === 'manager') {
        setNotification(data);
      }
    });

    return () => {
      socket.close();
    };
  }, [user]);

  const handleClose = () => {
    setNotification(null);
  };

  if (!notification) return null;

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={notification.type === 'leaveStatusUpdate' ? 'info' : 'success'}
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification; 