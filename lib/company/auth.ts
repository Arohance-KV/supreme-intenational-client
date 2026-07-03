'use client';
import { useCookieAuth } from '../cookie-auth';

// H6: company auth state via HttpOnly cookie + companion flag (no localStorage token).
export function useCompanyAuth() {
  return useCookieAuth('sov_company_auth', '/auth/company/logout');
}
