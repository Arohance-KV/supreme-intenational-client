'use client';
import { useCookieAuth } from '../cookie-auth';

// H6: seller auth state via HttpOnly cookie + companion flag (no localStorage token).
export function useSellerAuth() {
  return useCookieAuth('sov_seller_auth', '/auth/seller/logout');
}
