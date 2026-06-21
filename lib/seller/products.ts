'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Product, ProductVariant } from '@/lib/catalog';

const T = { tokenKey: 'sellerToken' as const };

export type SellerProduct = Product & { isActive: boolean; suspendedHidden?: boolean };

export type SellerProductDetail = SellerProduct & {
  description: string;
  details: string;
  materials: string;
  shipping: string;
};

interface Paginated<U> {
  products: U[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export function useMyProducts(isActive?: boolean, page = 1) {
  const qs = new URLSearchParams();
  if (isActive !== undefined) qs.set('isActive', String(isActive));
  qs.set('page', String(page));
  return useQuery({
    queryKey: ['seller', 'products', String(isActive ?? 'all'), page],
    queryFn: () => apiFetch<Paginated<SellerProduct>>(`/seller/products?${qs.toString()}`, T),
  });
}

export function useMyProduct(id: string) {
  return useQuery({
    queryKey: ['seller', 'product', id],
    queryFn: () =>
      apiFetch<{ product: SellerProductDetail; variants: ProductVariant[] }>(
        `/seller/products/${id}`,
        T,
      ),
    enabled: !!id,
  });
}

function useInvalidate(id: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['seller', 'product', id] });
    qc.invalidateQueries({ queryKey: ['seller', 'products'] });
  };
}

export function useUpdateProduct(id: string) {
  const inv = useInvalidate(id);
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch(`/seller/products/${id}`, { method: 'PATCH', body, ...T }),
    onSuccess: inv,
  });
}

export function useSetProductActive(id: string) {
  const inv = useInvalidate(id);
  return useMutation({
    mutationFn: (isActive: boolean) =>
      apiFetch(`/seller/products/${id}/active`, { method: 'PATCH', body: { isActive }, ...T }),
    onSuccess: inv,
  });
}

export function useAddVariant(id: string) {
  const inv = useInvalidate(id);
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch(`/seller/products/${id}/variants`, { method: 'POST', body, ...T }),
    onSuccess: inv,
  });
}

export function useUpdateVariant(productId: string) {
  const inv = useInvalidate(productId);
  return useMutation({
    mutationFn: (args: { variantId: string; body: Record<string, unknown> }) =>
      apiFetch(`/seller/variants/${args.variantId}`, { method: 'PATCH', body: args.body, ...T }),
    onSuccess: inv,
  });
}

export function useAdjustStock(productId: string) {
  const inv = useInvalidate(productId);
  return useMutation({
    mutationFn: (args: { variantId: string; delta: number }) =>
      apiFetch(`/seller/variants/${args.variantId}/stock`, {
        method: 'PATCH',
        body: { delta: args.delta },
        ...T,
      }),
    onSuccess: inv,
  });
}

export function useDeleteVariant(productId: string) {
  const inv = useInvalidate(productId);
  return useMutation({
    mutationFn: (variantId: string) =>
      apiFetch(`/seller/variants/${variantId}`, { method: 'DELETE', ...T }),
    onSuccess: inv,
  });
}
