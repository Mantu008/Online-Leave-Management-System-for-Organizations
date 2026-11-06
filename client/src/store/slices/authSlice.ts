import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';
import { errorMessage } from '../../services/http';
import type { LoginCredentials, RegisterInput, Role, User } from '../../types';

export interface AuthState {
  user: User | null;
  token: string | null;
  /** True while a login or registration request is in flight. */
  submitting: boolean;
  error: string | null;
  /** Explains why the user was signed out (e.g. expired session). */
  notice: string | null;
}

export const STORAGE_KEYS = { token: 'token', user: 'user' } as const;

function readStoredSession(): Pick<AuthState, 'user' | 'token'> {
  try {
    const token = sessionStorage.getItem(STORAGE_KEYS.token);
    const user = sessionStorage.getItem(STORAGE_KEYS.user);
    return token && user ? { token, user: JSON.parse(user) as User } : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

export const initialAuthState = (): AuthState => ({
  ...readStoredSession(),
  submitting: false,
  error: null,
  notice: null,
});

export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    return await authApi.login(credentials);
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'Sign in failed'));
  }
});

export const demoLogin = createAsyncThunk('auth/demoLogin', async (role: Role, { rejectWithValue }) => {
  try {
    return await authApi.demoLogin(role);
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'Demo sign in failed'));
  }
});

export const register = createAsyncThunk('auth/register', async (input: RegisterInput, { rejectWithValue }) => {
  try {
    return await authApi.register(input);
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'Registration failed'));
  }
});

/** Re-reads the signed-in user (role, department and leave balance can change server-side). */
export const refreshUser = createAsyncThunk('auth/refreshUser', () => authApi.me());

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.notice = null;
    },
    sessionExpired: (state, action: PayloadAction<string>) => {
      if (!state.token) return;
      state.user = null;
      state.token = null;
      state.notice = `${action.payload}. Please sign in again.`;
    },
    clearAuthMessages: (state) => {
      state.error = null;
      state.notice = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: AuthState) => {
      state.submitting = true;
      state.error = null;
      state.notice = null;
    };
    const fulfilled = (state: AuthState, action: PayloadAction<{ user: User; token: string }>) => {
      state.submitting = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    };
    const rejected = (state: AuthState, action: { payload?: unknown }) => {
      state.submitting = false;
      state.error = typeof action.payload === 'string' ? action.payload : 'Something went wrong';
    };

    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
      .addCase(demoLogin.pending, pending)
      .addCase(demoLogin.fulfilled, fulfilled)
      .addCase(demoLogin.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected, rejected)
      .addCase(refreshUser.fulfilled, (state, action) => {
        if (state.token) state.user = action.payload;
      });
  },
});

export const { logout, sessionExpired, clearAuthMessages } = authSlice.actions;
export default authSlice.reducer;
