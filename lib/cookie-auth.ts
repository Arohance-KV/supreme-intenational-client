'use client';
import { useSyncExternalStore } from 'react';

// H6: the access token now lives in an HttpOnly cookie the API sets on login, so XSS
// can't read it. JS can't see that cookie, so we track auth state via a companion,
// non-secret flag cookie (sov_*_auth) the API also sets/clears.
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

function hasCookie(name: string): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${name}=`));
}
function clearCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';

export function useCookieAuth(flagCookie: string, logoutPath: string) {
  const isLoggedIn = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => hasCookie(flagCookie),
    () => false,
  );
  return {
    token: null as string | null, // kept for back-compat; the real token is HttpOnly now
    isLoggedIn,
    // The API already set the auth cookie on the login response — just re-read state.
    login: (_t?: string) => { emit(); },
    logout: () => {
      clearCookie(flagCookie); // instant UI logout
      emit();
      // clear the HttpOnly token cookie server-side (fire-and-forget)
      fetch(`${API_BASE}${logoutPath}`, { method: 'POST', credentials: 'include' }).catch(() => {});
    },
  };
}
