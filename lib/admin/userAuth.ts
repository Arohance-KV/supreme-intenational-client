import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { adminFetch } from './api';

export interface AdminProfile {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useAdminProfile() {
  return useQuery<AdminProfile>({
    queryKey: ['admin', 'profile'],
    queryFn: () => adminFetch<AdminProfile>('/admin/auth/profile'),
  });
}

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
