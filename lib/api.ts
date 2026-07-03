import { getSessionId } from './session';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface ApiFetchOptions {
  method?: string;
  body?: unknown;
  tokenKey?: string;
}

export async function apiFetch<T>(
  path: string,
  opts?: ApiFetchOptions,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId(),
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(opts?.tokenKey ?? 'token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';
  const res = await fetch(`${base}${path}`, {
    method: opts?.method ?? 'GET',
    headers,
    // H6: send the HttpOnly auth cookie on cross-origin (same-site subdomain) requests
    credentials: 'include',
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });

  const json = await res.json();

  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.message ?? 'Request failed', res.status);
  }

  return json.data as T;
}
