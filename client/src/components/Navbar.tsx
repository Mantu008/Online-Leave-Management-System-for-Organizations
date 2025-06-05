import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { markAllAsRead } from '../store/slices/notificationSlice';
import { Badge, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
        setNotificationAnchorEl(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    const handleViewNotifications = () => {
        navigate('/notifications');
        handleNotificationClose();
    };

    if (!user) return null;

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-xl font-bold text-gray-800">
                                HRMS
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <IconButton
                            color="inherit"
                            onClick={handleNotificationMenu}
                            className="mr-4"
                        >
                            <Badge badgeContent={unreadCount} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>

                        <IconButton
                            color="inherit"
                            onClick={handleMenu}
                        >
                            <AccountCircleIcon />
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                                Profile
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <LogoutIcon className="mr-2" />
                                Logout
                            </MenuItem>
                        </Menu>

                        <Menu
                            anchorEl={notificationAnchorEl}
                            open={Boolean(notificationAnchorEl)}
                            onClose={handleNotificationClose}
                        >
                            {notifications.length > 0 ? (
                                <>
                                    <MenuItem onClick={handleViewNotifications}>
                                        View All Notifications
                                    </MenuItem>
                                    <MenuItem onClick={handleMarkAllAsRead}>
                                        Mark All as Read
                                    </MenuItem>
                                </>
                            ) : (
                                <MenuItem disabled>
                                    <Typography variant="body2" color="textSecondary">
                                        No notifications
                                    </Typography>
                                </MenuItem>
                            )}
                        </Menu>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 