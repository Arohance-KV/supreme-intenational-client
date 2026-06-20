'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../api';
import { useEmployeeAuth } from './auth';

interface AuthResponse { accessToken: string; }

export function useEmployeeLogin() {
  const { login } = useEmployeeAuth();
  const router = useRouter();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      apiFetch<AuthResponse>('/auth/employee/login', { method: 'POST', body, tokenKey: 'employeeToken' }),
    onSuccess: (data) => { login(data.accessToken); router.push('/employee'); },
  });
}

export function useVerifyInvite(token: string | null) {
  return useQuery({
    queryKey: ['employee', 'invite', token],
    queryFn: () => apiFetch<unknown>(`/auth/employee/activate/${token}`, { tokenKey: 'employeeToken' }),
    enabled: !!token,
    retry: false,
  });
}

export function useActivate() {
  const { login } = useEmployeeAuth();
  const router = useRouter();
  return useMutation({
    mutationFn: (body: { token: string; password: string }) =>
      apiFetch<AuthResponse>('/auth/employee/activate', { method: 'POST', body, tokenKey: 'employeeToken' }),
    onSuccess: (data) => { login(data.accessToken); router.push('/employee'); },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (body: { email: string }) =>
      apiFetch<boolean>('/auth/employee/forgot-password', { method: 'POST', body, tokenKey: 'employeeToken' }),
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: (body: { token: string; password: string }) =>
      apiFetch<unknown>('/auth/employee/reset-password', { method: 'POST', body, tokenKey: 'employeeToken' }),
    onSuccess: () => { router.push('/employee/login?message=reset-ok'); },
  });
}
