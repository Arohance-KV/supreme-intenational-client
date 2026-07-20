'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

// The signed-in customer's own profile. `b2bStatus` is optional because legacy
// cached profiles / users created before the approval backfill migration ran
// won't carry it — treat a missing value as approved, not locked out.
export interface Profile {
  firstName: string;
  lastName?: string;
  email: string;
  b2bStatus?: 'pending' | 'approved' | 'rejected';
}

// Shared with app/account/page.tsx's ['profile'] query key so both consumers
// hit the same cache entry instead of double-fetching.
export function useProfile(enabled: boolean) {
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => apiFetch<Profile>('/auth/profile'),
    enabled,
  });
}

export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      router.push('/');
    },
  });
}

export function useSignup() {
  const { login } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

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
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        router.push('/');
      } else {
        // email verification required before login
        router.push('/login?message=verify-email');
      }
    },
  });
}
