import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { adminFetch } from './api';

import type { Role } from './roles';

export interface AdminProfile {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useAdminProfile(opts?: { enabled?: boolean }) {
  return useQuery<AdminProfile>({
    queryKey: ['admin', 'profile'],
    queryFn: () => adminFetch<AdminProfile>('/admin/auth/profile'),
    enabled: opts?.enabled,
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
