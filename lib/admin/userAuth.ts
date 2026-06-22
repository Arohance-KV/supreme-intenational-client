'use client';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { adminFetch } from './api';

export function useAdminLogin() {
  return useMutation({
    mutationFn: (b: { email: string; password: string }) =>
      apiFetch<{ accessToken: string }>('/admin/auth/login', { method: 'POST', body: b, tokenKey: 'adminToken' }),
  });
}

export function useAdminChangePassword() {
  return useMutation({
    mutationFn: (b: { currentPassword: string; newPassword: string }) =>
      adminFetch<boolean>('/admin/auth/change-password', { method: 'PATCH', body: b }),
  });
}
