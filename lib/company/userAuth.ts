'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../api';
import { useCompanyAuth } from './auth';

interface AuthResponse { accessToken: string; }

export function useCompanyLogin() {
  const { login } = useCompanyAuth();
  const router = useRouter();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      apiFetch<AuthResponse>('/auth/company/login', { method: 'POST', body, tokenKey: 'companyToken' }),
    onSuccess: (data) => { login(data.accessToken); router.push('/company'); },
  });
}
