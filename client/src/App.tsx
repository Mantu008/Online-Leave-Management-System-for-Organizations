import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from './store';
import { refreshUser } from './store/slices/authSlice';
import { addNotification } from './store/slices/notificationSlice';
import { connectRealtime } from './services/realtime';
import { AppShell } from './components/layout/AppShell';
import { GuestOnly, RequireAuth, RoleGate } from './components/layout/Guards';
import { LoadingState } from './components/ui/Feedback';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ApplyLeavePage = lazy(() => import('./pages/leave/ApplyLeavePage'));
const LeaveHistoryPage = lazy(() => import('./pages/leave/LeaveHistoryPage'));
const LeaveRequestsPage = lazy(() => import('./pages/leave/LeaveRequestsPage'));
const TeamCalendarPage = lazy(() => import('./pages/team/TeamCalendarPage'));
const HolidaysPage = lazy(() => import('./pages/holidays/HolidaysPage'));
const ManageHolidaysPage = lazy(() => import('./pages/holidays/ManageHolidaysPage'));
const UsersPage = lazy(() => import('./pages/users/UsersPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/** Keeps the signed-in user fresh and relays realtime notifications into the store. */
function SessionSync() {
  const token = useAppSelector((s) => s.auth.token);
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  // Role, department and leave balance can change server-side since sign-in.
  useEffect(() => {
    if (token) dispatch(refreshUser());
  }, [token, dispatch]);

  useEffect(() => {
    if (!token) return undefined;
    return connectRealtime(token, (notification) => {
      dispatch(addNotification(notification));
      enqueueSnackbar(notification.message, { variant: 'info' });
      // A decision on the user's own leave changes their balance.
      if (notification.type === 'leave' && notification.data?.status) dispatch(refreshUser());
    });
  }, [token, dispatch, enqueueSnackbar]);

  return null;
}

const gate = (roles: Parameters<typeof RoleGate>[0]['roles'], element: JSX.Element) => <RoleGate roles={roles}>{element}</RoleGate>;

export default function App() {
  return (
    <BrowserRouter>
      <SessionSync />
      <Suspense fallback={<LoadingState className="min-h-screen" />}>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/leave/apply" element={gate(['employee'], <ApplyLeavePage />)} />
              <Route path="/leave/history" element={gate(['employee'], <LeaveHistoryPage />)} />
              <Route path="/leave/requests" element={gate(['manager'], <LeaveRequestsPage />)} />
              <Route path="/team" element={gate(['manager'], <TeamCalendarPage />)} />
              <Route path="/holidays" element={<HolidaysPage />} />
              <Route path="/holidays/manage" element={gate(['admin'], <ManageHolidaysPage />)} />
              <Route path="/users" element={gate(['admin'], <UsersPage />)} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
