'use client';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from './api';

export interface RequestOtpBody {
  email: string;
  name?: string;
  phone?: string;
}

export interface RequestOtpResult {
  sent: true;
}

export interface VerifyOtpBody {
  email: string;
  code: string;
}

export interface VerifyOtpResult {
  verified: true;
  userId: string;
  /** Present only when the OTP flow created a new guest-buyer account */
  token?: string;
}

export function useRequestOtp() {
  return useMutation<RequestOtpResult, Error, RequestOtpBody>({
    mutationFn: (body) =>
      apiFetch<RequestOtpResult>('/generation/otp/request', {
        method: 'POST',
        body,
      }),
  });
}

export function useVerifyOtp() {
  return useMutation<VerifyOtpResult, Error, VerifyOtpBody>({
    mutationFn: (body) =>
      apiFetch<VerifyOtpResult>('/generation/otp/verify', {
        method: 'POST',
        body,
      }),
  });
}
