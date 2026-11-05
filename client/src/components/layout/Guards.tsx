import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import type { Role } from '../../types';
import { ButtonLink } from '../ui/Button';
import { EmptyState } from '../ui/Feedback';

/** Renders child routes only for a signed-in user; otherwise sends them to sign in. */
export function RequireAuth() {
  const { user, token } = useAppSelector((s) => s.auth);
  const location = useLocation();
  if (!user || !token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Sign-in and registration pages are only for signed-out visitors. */
export function GuestOnly() {
  const user = useAppSelector((s) => s.auth.user);
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

/** Restricts a page to certain roles without signing the user out. */
export function RoleGate({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  if (!user || !roles.includes(user.role)) {
    return (
      <EmptyState
        className="min-h-[50vh]"
        title="You don't have access to this page"
        description="It's available to a different role. If you think this is a mistake, contact your administrator."
        action={
          <ButtonLink to="/dashboard" variant="secondary">
            Back to dashboard
          </ButtonLink>
        }
      />
    );
  }
  return <>{children}</>;
}
