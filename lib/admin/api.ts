import { apiFetch, ApiError } from '@/lib/api';
import { getSessionId } from '@/lib/session';

/**
 * Navigation and storage helpers — kept as module-level references so
 * unit tests can replace them without fighting jsdom's frozen Location object.
 */
export const _nav = {
  getPathname: () => (typeof window !== 'undefined' ? window.location.pathname : ''),
  assign: (url: string) => { window.location.assign(url); },
};

export async function adminFetch<T>(path: string, opts?: { method?: string; body?: unknown }): Promise<T> {
  try {
    return await apiFetch<T>(path, { ...opts, tokenKey: 'adminToken' });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      if (!_nav.getPathname().startsWith('/admin/login')) _nav.assign('/admin/login');
    }
    throw e;
  }
}

/**
 * Multipart file upload (bulk imports). apiFetch always JSON-encodes, so uploads
 * need their own path: let the browser set the multipart boundary, keep the
 * admin auth header/cookie, and unwrap the same { success, data, message } envelope.
 */
export async function adminUpload<T>(path: string, file: File): Promise<T> {
  const form = new FormData();
  form.append('file', file);
  const headers: Record<string, string> = { 'x-session-id': getSessionId() };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';
  const res = await fetch(`${base}${path}`, { method: 'POST', headers, credentials: 'include', body: form });
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.message ?? 'Upload failed', res.status);
  }
  return json.data as T;
}
