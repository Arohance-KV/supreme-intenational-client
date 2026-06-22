'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SubmissionStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface DraftVariantAttribute {
  name: string;
  value: string;
}

export interface DraftVariant {
  sku: string;
  price: number;
  originalPrice: number;
  stock: number;
  moq: number;
  images: string[];
  attributes: DraftVariantAttribute[];
}

export interface SubmissionBadge {
  label: string;
  variant: 'primary' | 'accent';
}

export interface AdminSubmission {
  _id: string;
  sellerId: string;
  status: SubmissionStatus;
  name: string;
  description: string;
  details: string;
  materials: string;
  shipping: string;
  categoryId: string;
  images: string[];
  badge: SubmissionBadge | null;
  variants: DraftVariant[];
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  /** Present on approved submissions — the MongoDB ObjectId of the created product */
  createdProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionsListResponse {
  items: AdminSubmission[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export interface RejectSubmissionBody {
  reason: string;
}

// ── Query key helpers ─────────────────────────────────────────────────────────

const SUBMISSIONS_LIST_KEY = (status?: string, page?: number) =>
  ['admin', 'submissions', 'list', status ?? '', page ?? 1] as const;

const SUBMISSION_KEY = (id: string) =>
  ['admin', 'submissions', 'detail', id] as const;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useSubmissions(filters: { status?: SubmissionStatus | ''; page?: number } = {}) {
  const { status, page = 1 } = filters;
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  if (status) qs.set('status', status);

  return useQuery<SubmissionsListResponse>({
    queryKey: SUBMISSIONS_LIST_KEY(status, page),
    queryFn: () =>
      adminFetch<SubmissionsListResponse>(`/admin/seller-submissions?${qs.toString()}`),
  });
}

export function useSubmission(id: string) {
  return useQuery<AdminSubmission>({
    queryKey: SUBMISSION_KEY(id),
    queryFn: () => adminFetch<AdminSubmission>(`/admin/seller-submissions/${id}`),
    enabled: !!id,
  });
}

export function useApproveSubmission(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      adminFetch<AdminSubmission>(`/admin/seller-submissions/${id}/approve`, {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBMISSION_KEY(id) });
      qc.invalidateQueries({ queryKey: ['admin', 'submissions', 'list'] });
    },
  });
}

export function useRejectSubmission(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RejectSubmissionBody) =>
      adminFetch<AdminSubmission>(`/admin/seller-submissions/${id}/reject`, {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBMISSION_KEY(id) });
      qc.invalidateQueries({ queryKey: ['admin', 'submissions', 'list'] });
    },
  });
}
