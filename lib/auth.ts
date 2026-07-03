'use client';
import { useCookieAuth } from './cookie-auth';

// H6: storefront auth state via HttpOnly cookie + companion flag (no localStorage token).
export function useAuth() {
  return useCookieAuth('sov_auth', '/auth/logout');
}
