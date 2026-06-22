/**
 * Tests for lib/admin/api.ts — 401 handler and basic pass-through.
 *
 * jsdom 26 freezes window.location, so we cannot spy on location.assign.
 * adminFetch calls its navigation helpers through the exported _nav object,
 * which we replace before each test — no jsdom tricks required.
 *
 * Note: @testing-library/react is NOT installed; these are logic-only tests.
 */

import { ApiError } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  },
}));

import { adminFetch, _nav } from './api';
import { apiFetch } from '@/lib/api';

const mockApiFetch = apiFetch as jest.Mock;

beforeEach(() => {
  localStorage.clear();
  mockApiFetch.mockReset();
  // Default: not on the login page
  _nav.getPathname = () => '/admin/dashboard';
  _nav.assign = jest.fn();
});

describe('adminFetch', () => {
  test('passes tokenKey adminToken and returns data on success', async () => {
    mockApiFetch.mockResolvedValueOnce({ id: '42' });
    const result = await adminFetch<{ id: string }>('/admin/something');
    expect(result).toEqual({ id: '42' });
    expect(mockApiFetch).toHaveBeenCalledWith('/admin/something', { tokenKey: 'adminToken' });
  });

  test('on 401: removes adminToken from localStorage and redirects to /admin/login, then rethrows', async () => {
    localStorage.setItem('adminToken', 'some-jwt');

    mockApiFetch.mockRejectedValueOnce(new ApiError('Session expired', 401));

    await expect(adminFetch('/admin/something')).rejects.toMatchObject({
      message: 'Session expired',
      status: 401,
    });

    expect(localStorage.getItem('adminToken')).toBeNull();
    expect(_nav.assign).toHaveBeenCalledWith('/admin/login');
  });

  test('on 401 while already on /admin/login: removes token but does NOT redirect', async () => {
    localStorage.setItem('adminToken', 'some-jwt');
    _nav.getPathname = () => '/admin/login';

    mockApiFetch.mockRejectedValueOnce(new ApiError('Unauthorized', 401));

    await expect(adminFetch('/admin/something')).rejects.toMatchObject({ status: 401 });

    expect(localStorage.getItem('adminToken')).toBeNull();
    expect(_nav.assign).not.toHaveBeenCalled();
  });

  test('non-401 errors are rethrown without touching localStorage or redirecting', async () => {
    localStorage.setItem('adminToken', 'some-jwt');

    mockApiFetch.mockRejectedValueOnce(new ApiError('Not found', 404));

    await expect(adminFetch('/admin/something')).rejects.toMatchObject({ status: 404 });

    expect(localStorage.getItem('adminToken')).toBe('some-jwt');
    expect(_nav.assign).not.toHaveBeenCalled();
  });
});
