import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { markAllAsRead } from '../../store/slices/notificationSlice';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Chip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'leave':
            return <EventIcon color="primary" />;
        case 'holiday':
            return <EventIcon color="secondary" />;
        case 'user':
            return <PersonIcon color="info" />;
        case 'system':
            return <WarningIcon color="error" />;
        default:
            return <NotificationsIcon />;
    }
};

const getNotificationColor = (type: string) => {
    switch (type) {
        case 'leave':
            return 'primary';
        case 'holiday':
            return 'secondary';
        case 'user':
            return 'info';
        case 'system':
            return 'error';
        default:
            return 'default';
    }
};

const NotificationsPage = () => {
    const dispatch = useDispatch();
    const { notifications } = useSelector((state: RootState) => state.notifications);

    useEffect(() => {
        dispatch(markAllAsRead());
    }, [dispatch]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <Box className="p-6">
            <Card>
                <CardContent>
                    <Box className="flex justify-between items-center mb-4">
                        <Typography variant="h5" component="h1">
                            Notifications
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => dispatch(markAllAsRead())}
                        >
                            Mark All as Read
                        </Button>
                    </Box>

                    <List>
                        {notifications.length > 0 ? (
                            notifications.map((notification, index) => (
                                <Box key={notification.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemIcon>
                                            {getNotificationIcon(notification.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box className="flex items-center gap-2">
                                                    <Typography variant="subtitle1">
                                                        {notification.message}
                                                    </Typography>
                                                    <Chip
                                                        label={notification.type}
                                                        size="small"
                                                        color={getNotificationColor(notification.type)}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Typography
                                                    variant="body2"
                                                    color="textSecondary"
                                                >
                                                    {formatDate(notification.timestamp)}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    {index < notifications.length - 1 && <Divider />}
                                </Box>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <Typography variant="body1" color="textSecondary">
                                            No notifications
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        )}
                    </List>
                </CardContent>
            </Card>
        </Box>
    );
};

export default NotificationsPage; 