'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';
import { getSessionId } from '@/lib/session';

const T = { tokenKey: 'sellerToken' as const };

export interface DraftVariant {
  sku: string; price: number; originalPrice: number; stock: number; moq: number;
  images?: string[]; attributes: { name: string; value: string }[];
}
export interface Submission {
  _id: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  name: string; categoryId: string; images: string[];
  badge: { label: string; variant: 'primary' | 'accent' } | null;
  variants: DraftVariant[]; rejectionReason?: string; productId?: string; createdAt: string;
}
export interface SubmissionInput {
  name: string; categoryId: string; images?: string[];
  badge?: { label: string; variant: 'primary' | 'accent' } | null;
  variants: DraftVariant[]; description?: string; details?: string; materials?: string; shipping?: string;
}
interface Paginated<T> { items: T[]; pagination: { total: number; page: number; limit: number; pages: number }; }

export function useMySubmissions(status?: string, page = 1) {
  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  qs.set('page', String(page));
  return useQuery({
    queryKey: ['seller', 'submissions', status ?? 'all', page],
    queryFn: () => apiFetch<Paginated<Submission>>(`/seller/submissions?${qs.toString()}`, T),
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: ['seller', 'submission', id],
    queryFn: () => apiFetch<Submission>(`/seller/submissions/${id}`, T),
    enabled: !!id,
  });
}

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SubmissionInput) => apiFetch<Submission>('/seller/submissions', { method: 'POST', body, ...T }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller', 'submissions'] }),
  });
}

export function useUpdateSubmission(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<SubmissionInput>) => apiFetch<Submission>(`/seller/submissions/${id}`, { method: 'PATCH', body, ...T }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller', 'submission', id] });
      qc.invalidateQueries({ queryKey: ['seller', 'submissions'] });
    },
  });
}

export function useSubmitSubmission(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<Submission>(`/seller/submissions/${id}/submit`, { method: 'POST', ...T }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller', 'submission', id] });
      qc.invalidateQueries({ queryKey: ['seller', 'submissions'] });
    },
  });
}

export function useReviseSubmission(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<Submission>(`/seller/submissions/${id}/revise`, { method: 'POST', ...T }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller', 'submission', id] });
      qc.invalidateQueries({ queryKey: ['seller', 'submissions'] });
    },
  });
}

// Image upload is multipart — apiFetch is JSON-only, so use fetch directly here.
export async function uploadSubmissionImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';
  const token = typeof window !== 'undefined' ? localStorage.getItem('sellerToken') : null;
  const res = await fetch(`${base}/seller/upload/image`, {
    method: 'POST',
    headers: { 'x-session-id': getSessionId(), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: 'include', // H6: send HttpOnly auth cookie
    body: fd,
  });
  const json = await res.json();
  if (!res.ok || json?.success === false) throw new ApiError(json?.message ?? 'Upload failed', res.status);
  return (json.data as { url: string }).url;
}
