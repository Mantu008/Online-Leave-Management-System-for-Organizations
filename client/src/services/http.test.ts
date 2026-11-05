import { afterEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { ApiError, configureHttp, http } from './http';

/** Makes every request fail with the given status and body. */
function respondWith(status: number, data: unknown) {
  http.defaults.adapter = (config: InternalAxiosRequestConfig) =>
    Promise.reject(
      new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, {
        status,
        statusText: '',
        data,
        headers: {},
        config: { ...config, headers: new AxiosHeaders(config.headers) },
      })
    );
}

describe('http error handling', () => {
  afterEach(() => {
    configureHttp({ getToken: () => null, onSessionExpired: () => undefined });
  });

  it('ends the session when a sent token is rejected', async () => {
    const onSessionExpired = vi.fn();
    configureHttp({ getToken: () => 'abc', onSessionExpired });
    respondWith(401, { message: 'Your session has expired' });

    await expect(http.get('/leaves')).rejects.toBeInstanceOf(ApiError);
    expect(onSessionExpired).toHaveBeenCalledWith('Your session has expired');
  });

  it('does not sign the user out on 403 Forbidden', async () => {
    const onSessionExpired = vi.fn();
    configureHttp({ getToken: () => 'abc', onSessionExpired });
    respondWith(403, { message: 'You do not have permission' });

    await expect(http.get('/users')).rejects.toMatchObject({ status: 403, message: 'You do not have permission' });
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('does not treat a failed sign-in as an expired session', async () => {
    const onSessionExpired = vi.fn();
    configureHttp({ getToken: () => null, onSessionExpired });
    respondWith(401, { message: 'Invalid email or password' });

    await expect(http.post('/auth/login', {})).rejects.toMatchObject({ message: 'Invalid email or password' });
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('exposes field-level validation errors', async () => {
    respondWith(400, { message: 'Enter a valid email address', errors: [{ field: 'email', message: 'Enter a valid email address' }] });
    await expect(http.post('/auth/register', {})).rejects.toMatchObject({
      fieldErrors: { email: 'Enter a valid email address' },
    });
  });
});
