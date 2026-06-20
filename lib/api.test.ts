/**
 * Tests for api.ts and session.ts
 * Written FIRST (TDD) — these fail until the implementation exists.
 */

// NEXT_PUBLIC_API_URL is set in jest.setup.js

import { apiFetch, ApiError } from './api';

beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe('apiFetch', () => {
  test('unwraps .data on success', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { id: '1' }, success: true, statusCode: 200, message: 'OK' }),
    } as Response);

    const result = await apiFetch<{ id: string }>('/test');

    expect(result).toEqual({ id: '1' });
  });

  test('throws ApiError with server message and status on failure', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        errors: [{ message: 'nope' }],
        message: 'nope',
        success: false,
        statusCode: 400,
      }),
    } as Response);

    await expect(apiFetch('/test')).rejects.toMatchObject({
      message: 'nope',
      status: 400,
    });
  });

  test('sends an x-session-id header of length 24', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: null, success: true, statusCode: 200, message: 'OK' }),
    } as Response);

    await apiFetch('/test');

    const callArgs = fetchSpy.mock.calls[0];
    const headers = callArgs[1]?.headers as Record<string, string>;
    const sessionId = headers['x-session-id'];

    expect(typeof sessionId).toBe('string');
    expect(sessionId.length).toBe(24);
  });

  test('reads Bearer token from the tokenKey option when provided', async () => {
    localStorage.setItem('employeeToken', 'emp-jwt');
    localStorage.setItem('token', 'b2b-jwt');
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true, status: 200, json: async () => ({ data: null, success: true }),
    } as Response);

    await apiFetch('/employee/wallet', { tokenKey: 'employeeToken' });

    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer emp-jwt');
  });
});
