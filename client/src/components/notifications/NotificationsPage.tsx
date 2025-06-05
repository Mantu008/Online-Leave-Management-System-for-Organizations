import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { markAllAsRead, markAsRead } from '../../store/slices/notificationSlice';
import {
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import {
  EventNote as LeaveIcon,
  Event as HolidayIcon,
  Person as UserIcon,
  Warning as SystemIcon,
  CheckCircle as ReadIcon,
} from '@mui/icons-material';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'leave':
      return <LeaveIcon className="text-blue-500" />;
    case 'holiday':
      return <HolidayIcon className="text-green-500" />;
    case 'user':
      return <UserIcon className="text-purple-500" />;
    case 'system':
      return <SystemIcon className="text-red-500" />;
    default:
      return null;
  }
};

const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.notifications);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Mark all notifications as read when viewing the page
    dispatch(markAllAsRead());
  }, [dispatch]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  if (!user) return null;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4">
            Notifications
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => dispatch(markAllAsRead())}
          >
            Mark All as Read
          </Button>
        </div>

        {notifications.length === 0 ? (
          <Paper className="p-6 text-center">
            <Typography color="textSecondary">
              No notifications yet
            </Typography>
          </Paper>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                className={`mb-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  !notification.read ? 'border-l-4 border-primary-main' : ''
                }`}
              >
                <Box className="flex items-start w-full">
                  <Box className="mr-4 mt-1">
                    {getNotificationIcon(notification.type)}
                  </Box>
                  <Box className="flex-grow">
                    <ListItemText
                      primary={notification.message}
                      secondary={new Date(notification.timestamp).toLocaleString()}
                    />
                    {notification.data && (
                      <Box className="mt-2 text-sm text-gray-600">
                        {notification.type === 'leave' && (
                          <div>
                            <p>Leave Type: {notification.data.leaveType}</p>
                            <p>Duration: {new Date(notification.data.startDate).toLocaleDateString()} to {new Date(notification.data.endDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {notification.type === 'holiday' && (
                          <div>
                            <p>Date: {new Date(notification.data.date).toLocaleDateString()}</p>
                            <p>Description: {notification.data.description}</p>
                          </div>
                        )}
                        {notification.type === 'user' && (
                          <div>
                            <p>Role: {notification.data.role}</p>
                            <p>Department: {notification.data.department}</p>
                          </div>
                        )}
                      </Box>
                    )}
                  </Box>
                  {!notification.read && (
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="ml-2"
                    >
                      <ReadIcon className="text-green-500" />
                    </IconButton>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage; 