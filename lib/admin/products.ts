'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch, _nav } from './api';
import { ApiError } from '@/lib/api';
import { getSessionId } from '@/lib/session';
import type { ProductBadge, ProductVariant } from '@/lib/catalog';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  badge: ProductBadge | null;
  rating: number;
  totalReviews: number;
  minPrice: number;
  originalMinPrice: number;
  category?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface AdminProductDetail {
  _id: string;
  name: string;
  slug: string;
  description: string;
  details: string;
  materials: string;
  shipping: string;
  images: string[];
  badge: ProductBadge | null;
  rating: number;
  totalReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  totalPurchases: number;
  visibility: 'public' | 'company';
  ownerCompanyId?: string;
  category: string;
}

export interface AdminProductsResponse {
  products: AdminProduct[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export interface AdminProductDetailResponse {
  product: AdminProductDetail;
  variants: ProductVariant[];
}

// Create product body — matches createProductValidator + controller
export interface CreateProductBody {
  name: string;
  categoryId: string;
  images: string[];
  slug?: string;
  description?: string;
  details?: string;
  materials?: string;
  shipping?: string;
  badge?: { label: string; variant: 'primary' | 'accent' } | null;
  isFeatured?: boolean;
  visibility?: 'public' | 'company';
  ownerCompanyId?: string;
}

// Update product body — matches updateProductValidator + controller
export interface UpdateProductBody {
  name?: string;
  description?: string;
  details?: string;
  materials?: string;
  shipping?: string;
  images?: string[];
  badge?: { label: string; variant: 'primary' | 'accent' } | null;
  isFeatured?: boolean;
  isActive?: boolean;
  rating?: number;
  totalReviews?: number;
  totalPurchases?: number;
}

// Create variant — matches createVariantValidator + controller
export interface CreateVariantBody {
  price: number;
  originalPrice: number;
  stock: number;
  sku?: string;
  moq?: number;
  images?: string[];
  attributes: { attributeId: string; valueId: string }[];
}

// Update variant — matches updateVariantValidator + controller
export interface UpdateVariantBody {
  price?: number;
  originalPrice?: number;
  stock?: number;
  moq?: number;
  images?: string[];
  sku?: string;
  isActive?: boolean;
}

// Flash sale — matches flashSaleValidator + controller (null clears the sale)
export interface FlashSaleBody {
  flashSalePrice: number | null;
  flashSaleEndsAt: string | null; // ISO 8601
}

// ── Query key helpers ─────────────────────────────────────────────────────────

const PRODUCT_LIST_KEY = (page: number, search?: string) =>
  ['admin', 'products', 'list', page, search ?? ''] as const;

const PRODUCT_DETAIL_KEY = (slug: string) =>
  ['admin', 'products', 'detail', slug] as const;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useAdminProducts(page = 1, search?: string) {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  if (search) qs.set('search', search);

  return useQuery<AdminProductsResponse>({
    queryKey: PRODUCT_LIST_KEY(page, search),
    queryFn: () =>
      adminFetch<AdminProductsResponse>(`/admin/products?${qs.toString()}`),
  });
}

export function useAdminProduct(slug: string) {
  return useQuery<AdminProductDetailResponse>({
    queryKey: PRODUCT_DETAIL_KEY(slug),
    queryFn: () =>
      adminFetch<AdminProductDetailResponse>(`/admin/products/${slug}`),
    enabled: !!slug,
  });
}

function useInvalidate(slug: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: PRODUCT_DETAIL_KEY(slug) });
    qc.invalidateQueries({ queryKey: ['admin', 'products', 'list'] });
  };
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductBody) =>
      adminFetch<AdminProductDetail>('/admin/products', { method: 'POST', body }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['admin', 'products', 'list'] }),
  });
}

export function useUpdateProduct(productId: string, slug: string) {
  const inv = useInvalidate(slug);
  return useMutation({
    mutationFn: (body: UpdateProductBody) =>
      adminFetch<AdminProductDetail>(`/admin/products/${productId}`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: inv,
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      adminFetch<boolean>(`/admin/products/${productId}`, { method: 'DELETE' }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['admin', 'products', 'list'] }),
  });
}

export function useCreateVariant(productId: string, slug: string) {
  const inv = useInvalidate(slug);
  return useMutation({
    mutationFn: (body: CreateVariantBody) =>
      adminFetch<ProductVariant>(`/admin/products/${productId}/variants`, {
        method: 'POST',
        body,
      }),
    onSuccess: inv,
  });
}

export function useUpdateVariant(productId: string, slug: string) {
  const inv = useInvalidate(slug);
  return useMutation({
    mutationFn: (args: { variantId: string; body: UpdateVariantBody }) =>
      adminFetch<ProductVariant>(`/admin/variants/${args.variantId}`, {
        method: 'PATCH',
        body: args.body,
      }),
    onSuccess: inv,
  });
}

export function useAdjustStock(productId: string, slug: string) {
  const inv = useInvalidate(slug);
  return useMutation({
    mutationFn: (args: { variantId: string; delta: number }) =>
      adminFetch<ProductVariant>(`/admin/variants/${args.variantId}/stock`, {
        method: 'PATCH',
        body: { delta: args.delta },
      }),
    onSuccess: inv,
  });
}

export function useDeleteVariant(productId: string, slug: string) {
  const inv = useInvalidate(slug);
  return useMutation({
    mutationFn: (variantId: string) =>
      adminFetch<boolean>(`/admin/variants/${variantId}`, { method: 'DELETE' }),
    onSuccess: inv,
  });
}

export function useSetFlashSale(productId: string, slug: string) {
  const inv = useInvalidate(slug);
  return useMutation({
    mutationFn: (args: { variantId: string; body: FlashSaleBody }) =>
      adminFetch<ProductVariant>(`/admin/variants/${args.variantId}/flash-sale`, {
        method: 'PATCH',
        body: args.body,
      }),
    onSuccess: inv,
  });
}

// ── Image upload (multipart — raw fetch, mirrors uploadSubmissionImage) ────────

export async function uploadAdminImage(
  file: File,
  folder: 'products' | 'categories' | 'variants' | 'reviews' = 'products',
): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);

  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const res = await fetch(`${base}/admin/upload/image`, {
    method: 'POST',
    headers: {
      'x-session-id': getSessionId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: fd,
  });

  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.message ?? 'Upload failed', res.status);
  }
  // Controller returns: next({ url }) → response is { success: true, data: { url } }
  return (json.data as { url: string }).url;
}

// Hook wrapper for useUploadImage (integrates with React state but keeps upload async)
export function useUploadImage() {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const upload = async (
    file: File,
    folder: 'products' | 'categories' | 'variants' | 'reviews' = 'products',
  ): Promise<string | null> => {
    setIsPending(true);
    setError(null);
    try {
      const url = await uploadAdminImage(file, folder);
      return url;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Upload failed'));
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { upload, isPending, error };
}

// Import React for the hook
import React from 'react';
