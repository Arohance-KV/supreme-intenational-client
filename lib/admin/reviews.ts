'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

/** Populated product sub-document (from .populate('productId', 'name slug')) */
export interface ReviewProduct {
  _id: string;
  name: string;
  slug: string;
}

/** Populated user sub-document (from .populate('userId', 'firstName lastName email')) */
export interface ReviewUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AdminReview {
  _id: string;
  /** Populated object OR raw ObjectId string depending on whether populate ran */
  productId: ReviewProduct | string;
  userId?: ReviewUser | string | null;
  orderId?: string | null;
  reviewerName?: string | null;
  isAdminCreated: boolean;
  rating: number;
  title: string;
  body: string;
  images: string[];
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsListResponse {
  reviews: AdminReview[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateReviewBody {
  productId: string;
  reviewerName: string;
  userId?: string;
  rating: number;
  title: string;
  body?: string;
  images?: string[];
}

// ── Query key helpers ─────────────────────────────────────────────────────────

const REVIEWS_LIST_KEY = (page: number) => ['admin', 'reviews', 'list', page] as const;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useReviews(page = 1, limit = 20) {
  return useQuery<ReviewsListResponse>({
    queryKey: REVIEWS_LIST_KEY(page),
    queryFn: () =>
      adminFetch<ReviewsListResponse>(`/admin/reviews?page=${page}&limit=${limit}`),
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReviewBody) =>
      adminFetch<AdminReview>('/admin/reviews', { method: 'POST', body }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch<AdminReview>(`/admin/reviews/${id}`, { method: 'DELETE' }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  });
}
