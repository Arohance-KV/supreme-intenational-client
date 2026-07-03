'use client';
import { useCookieAuth } from '../cookie-auth';

// H6: employee auth state via HttpOnly cookie + companion flag (no localStorage token).
export function useEmployeeAuth() {
  return useCookieAuth('sov_emp_auth', '/auth/employee/logout');
}
