import { apiFetch, ApiError } from '@/lib/api';

/**
 * Navigation and storage helpers: kept as module-level references so
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
 * Multipart file upload (bulk imports). apiFetch now handles FormData bodies
 * (skips Content-Type/JSON.stringify) while keeping the shared auth header/cookie
 * and { success, data, message } envelope unwrap, so this is just a thin wrapper.
 */
export async function adminUpload<T>(path: string, file: File): Promise<T> {
  const form = new FormData();
  form.append('file', file);
  return apiFetch<T>(path, { method: 'POST', body: form, tokenKey: 'adminToken' });
}
