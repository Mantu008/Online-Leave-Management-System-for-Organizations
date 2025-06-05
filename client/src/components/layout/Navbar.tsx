import React from 'react';
import {
  AccountCircle,
  Notifications,
  Dashboard,
  EventNote,
  People,
  CalendarMonth,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-gradient-to-r from-primary-main to-primary-dark text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-semibold tracking-wide">
            Leave Management System
          </h1>
          
          <div className="flex items-center space-x-4">
            {user?.role === 'employee' && (
              <>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Dashboard />
                  <span>Dashboard</span>
                </button>
                <button 
                  onClick={() => navigate('/leave/apply')}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <EventNote />
                  <span>Apply Leave</span>
                </button>
                <button 
                  onClick={() => navigate('/leave/history')}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <CalendarMonth />
                  <span>Leave History</span>
                </button>
              </>
            )}

            {user?.role === 'manager' && (
              <>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Dashboard />
                  <span>Dashboard</span>
                </button>
                <button 
                  onClick={() => navigate('/leave/requests')}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <EventNote />
                  <span>Leave Requests</span>
                </button>
                <button 
                  onClick={() => navigate('/team')}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <CalendarMonth />
                  <span>Team Calendar</span>
                </button>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Dashboard />
                  <span>Dashboard</span>
                </button>
                <button 
                  onClick={() => navigate('/holidays/manage')}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <CalendarMonth />
                  <span>Manage Holidays</span>
                </button>
                <button 
                  onClick={() => navigate('/users')}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <People />
                  <span>Manage Users</span>
                </button>
              </>
            )}

            <button
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
            >
              <Notifications />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={handleMenu}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <AccountCircle />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Menu */}
      {anchorEl && (
        <div className="absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
          <button
            onClick={() => {
              navigate('/profile');
              handleClose();
            }}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Profile
          </button>
          <button
            onClick={() => {
              handleLogout();
              handleClose();
            }}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 