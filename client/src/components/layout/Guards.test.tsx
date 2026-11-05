import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createStore } from '../../store';
import authReducer, { sessionExpired } from '../../store/slices/authSlice';
import type { User } from '../../types';
import { RequireAuth, RoleGate } from './Guards';

const employee: User = {
  _id: 'u1',
  name: 'Asha Rao',
  email: 'asha@example.com',
  role: 'employee',
  department: 'IT',
  position: 'Engineer',
  joiningDate: '2023-01-10T00:00:00.000Z',
  leaveBalance: { annual: 20, sick: 10, casual: 10 },
  isActive: true,
};

const signedIn = { user: employee, token: 't', submitting: false, error: null, notice: null };
const signedOut = { user: null, token: null, submitting: false, error: null, notice: null };

function renderAt(path: string, auth: typeof signedIn | typeof signedOut) {
  const store = createStore({ auth });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<p>Sign in page</p>} />
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<p>Dashboard</p>} />
            <Route
              path="/users"
              element={
                <RoleGate roles={['admin']}>
                  <p>User management</p>
                </RoleGate>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('route guards', () => {
  it('sends signed-out visitors to sign in', () => {
    renderAt('/dashboard', signedOut);
    expect(screen.getByText('Sign in page')).toBeInTheDocument();
  });

  it('shows a no-access message instead of signing the user out', () => {
    renderAt('/users', signedIn);
    expect(screen.queryByText('User management')).not.toBeInTheDocument();
    expect(screen.getByText("You don't have access to this page")).toBeInTheDocument();
  });

  it('renders permitted pages', () => {
    renderAt('/dashboard', signedIn);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});

describe('auth state', () => {
  it('explains why the session ended', () => {
    const state = authReducer(signedIn, sessionExpired('Your session has expired'));
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.notice).toBe('Your session has expired. Please sign in again.');
  });

  it('ignores late session-expiry events after sign-out', () => {
    const state = authReducer(signedOut, sessionExpired('Invalid session'));
    expect(state.notice).toBeNull();
  });
});
