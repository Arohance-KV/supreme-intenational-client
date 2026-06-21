'use client';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const T = { tokenKey: 'sellerToken' as const };

export interface ApplyBody {
  businessName: string;
  email: string;
  password: string;
  description?: string;
  contact?: { email?: string };
}

export function useSellerApply() {
  return useMutation({
    mutationFn: (body: ApplyBody) =>
      apiFetch<true>('/auth/seller/apply', { method: 'POST', body, ...T }),
  });
}

export function useSellerLogin() {
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      apiFetch<{ accessToken: string }>('/auth/seller/login', { method: 'POST', body, ...T }),
  });
}

export function useSellerForgotPassword() {
  return useMutation({
    mutationFn: (body: { email: string }) =>
      apiFetch<true>('/auth/seller/forgot-password', { method: 'POST', body, ...T }),
  });
}

export function useSellerResetPassword() {
  return useMutation({
    mutationFn: (body: { token: string; password: string }) =>
      apiFetch<true>('/auth/seller/reset-password', { method: 'POST', body, ...T }),
  });
}
