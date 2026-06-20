'use client';
import { useMutation } from '@tanstack/react-query';
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
