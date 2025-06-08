import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { RootState } from './store';
import notificationService from './services/notificationService';

// Layout
import Navbar from './components/layout/Navbar';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// Leave Components
import LeaveRequestForm from './components/leave/LeaveRequestForm';
import LeaveHistory from './components/leave/LeaveHistory';
import LeaveRequests from './components/leave/LeaveRequests';

// Holiday Components
import HolidayCalendar from './components/holiday/HolidayCalendar';
import HolidayManagement from './components/admin/HolidayManagement';

// Dashboard Components
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';
import ManagerDashboard from './components/dashboard/ManagerDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';

// Team Components
import TeamCalendar from './components/team/TeamCalendar';

// Notification Components
import Notification from './components/common/Notification';
import NotificationsPage from './components/notifications/NotificationsPage';

// User Management
import UsersPage from './pages/users';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useSelector((state: RootState) => state.auth);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  
  useEffect(() => {
    if (user) {
      notificationService.initialize();
    }
    return () => {
      notificationService.disconnect();
    };
  }, [user]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Notification />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={user ? <Navigate to="/dashboard" replace /> : <LoginForm />}
              />
              <Route
                path="/register"
                element={user ? <Navigate to="/dashboard" replace /> : <RegisterForm />}
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    {user?.role === 'manager' ? (
                      <ManagerDashboard />
                    ) : user?.role === 'admin' ? (
                      <AdminDashboard />
                    ) : (
                      <EmployeeDashboard />
                    )}
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/leave/apply"
                element={
                  <ProtectedRoute>
                    <LeaveRequestForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/leave/history"
                element={
                  <ProtectedRoute>
                    <LeaveHistory />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/leave/requests"
                element={
                  <ProtectedRoute>
                    <LeaveRequests />
                  </ProtectedRoute>
                }
              />

              {/* Holiday Routes */}
              <Route
                path="/holidays"
                element={
                  <ProtectedRoute>
                    <HolidayCalendar />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/holidays/manage"
                element={
                  <ProtectedRoute>
                    <HolidayManagement />
                  </ProtectedRoute>
                }
              />

              {/* Team Routes */}
              <Route
                path="/team"
                element={
                  <ProtectedRoute>
                    <TeamCalendar />
                  </ProtectedRoute>
                }
              />

              {/* User Management Routes */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />

              {/* Redirect to dashboard if authenticated, otherwise to login */}
              <Route
                path="/"
                element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
              />
            </Routes>
          </main>
        </div>
      </Router>
    </LocalizationProvider>
  );
};

export default App;