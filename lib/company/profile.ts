'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';
import { getSessionId } from '@/lib/session';

const T = { tokenKey: 'companyToken' as const };

export interface CompanyProfile {
  name: string;
  logo: string | null;
  walletMode: 'points' | 'coupon';
}

const PROFILE_KEY = ['company', 'profile'] as const;

export function useCompanyProfile() {
  return useQuery<CompanyProfile>({
    queryKey: PROFILE_KEY,
    queryFn: () => apiFetch<CompanyProfile>('/company/profile', T),
  });
}

// Logo upload is multipart — apiFetch is JSON-only, so use fetch directly here.
// The server uploads to R2 and persists company.logo in one call.
async function uploadCompanyLogo(file: File): Promise<{ logo: string | null }> {
  const fd = new FormData();
  fd.append('file', file);
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';
  const token = typeof window !== 'undefined' ? localStorage.getItem('companyToken') : null;
  const res = await fetch(`${base}/company/logo`, {
    method: 'POST',
    headers: { 'x-session-id': getSessionId(), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: 'include',
    body: fd,
  });
  const json = await res.json();
  if (!res.ok || json?.success === false) throw new ApiError(json?.message ?? 'Upload failed', res.status);
  return json.data as { logo: string | null };
}

export function useUploadCompanyLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadCompanyLogo,
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}
