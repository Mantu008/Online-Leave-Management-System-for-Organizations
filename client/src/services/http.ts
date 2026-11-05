import axios, { AxiosError } from 'axios';

export class ApiError extends Error {
  readonly status?: number;
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, status?: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface ErrorBody {
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

let getToken: () => string | null = () => null;
let onSessionExpired: (message: string) => void = () => undefined;

/** Wired up once at start-up so this module does not depend on the store. */
export function configureHttp(options: { getToken: () => string | null; onSessionExpired: (message: string) => void }) {
  getToken = options.getToken;
  onSessionExpired = options.onSessionExpired;
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    if (!error.response) {
      const message =
        error.code === 'ECONNABORTED'
          ? 'The server took too long to respond. Please try again.'
          : 'Unable to reach the server. Check your connection and try again.';
      return Promise.reject(new ApiError(message));
    }

    const { status, data } = error.response;
    const fieldErrors: Record<string, string> = {};
    data?.errors?.forEach((e) => {
      fieldErrors[e.field] = e.message;
    });
    const message = data?.message || error.message || 'Something went wrong';

    // Only a rejected token ends the session. A 401 from the login form itself
    // (no token sent) or a 403 for a forbidden action must not sign the user out.
    if (status === 401 && error.config?.headers?.Authorization) {
      onSessionExpired(message);
    }

    return Promise.reject(new ApiError(message, status, fieldErrors));
  }
);

export const errorMessage = (error: unknown, fallback = 'Something went wrong') =>
  error instanceof Error && error.message ? error.message : fallback;
