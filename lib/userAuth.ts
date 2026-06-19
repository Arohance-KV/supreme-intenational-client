'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiFetch } from './api';
import { useAuth } from './auth';

interface LoginBody {
  email: string;
  password: string;
}

interface SignupBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isdCode?: string;
  phoneNumber?: string;
}

interface AuthResponse {
  accessToken: string;
}

export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: LoginBody) =>
      apiFetch<AuthResponse>('/auth/login', { method: 'POST', body }),
    onSuccess: async (data) => {
      login(data.accessToken);
      try {
        await apiFetch('/cart/merge', { method: 'POST' });
      } catch {
        // ignore cart merge errors
      }
      router.push('/');
    },
  });
}

export function useSignup() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: SignupBody) =>
      apiFetch<AuthResponse>('/auth/signup', { method: 'POST', body }),
    onSuccess: async (data) => {
      if (data?.accessToken) {
        login(data.accessToken);
        try {
          await apiFetch('/cart/merge', { method: 'POST' });
        } catch {
          // ignore cart merge errors
        }
        router.push('/');
      } else {
        // email verification required before login
        router.push('/login?message=verify-email');
      }
    },
  });
}
