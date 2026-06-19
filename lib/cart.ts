'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './api';

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  image: string;
  attributeLabels: string[];
  priceSnapshot: number;
  originalPriceSnapshot: number;
  currentPrice: number;
  priceChanged: boolean;
  qty: number;
  moq: number;
  belowMoq: boolean;
}

export interface Cart {
  sessionId: string;
  items: CartItem[];
  subtotal: number;
  coupon: { code: string; discountAmount: number } | null;
  total: number;
  itemCount: number;
  hasPriceChanges: boolean;
  hasMoqViolations: boolean;
}

export function useCart() {
  return useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: () => apiFetch<Cart>('/cart'),
  });
}

export function useCartMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['cart'] });

  const setQty = useMutation({
    mutationFn: ({ variantId, qty }: { variantId: string; qty: number }) =>
      apiFetch<Cart>(`/cart/items/${variantId}`, { method: 'PATCH', body: { qty } }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ variantId }: { variantId: string }) =>
      apiFetch<Cart>(`/cart/items/${variantId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const clear = useMutation({
    mutationFn: () => apiFetch<unknown>('/cart', { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const applyCoupon = useMutation({
    mutationFn: ({ code }: { code: string }) =>
      apiFetch<Cart>('/cart/coupon', { method: 'POST', body: { code } }),
    onSuccess: invalidate,
  });

  const removeCoupon = useMutation({
    mutationFn: () => apiFetch<Cart>('/cart/coupon', { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { setQty, remove, clear, applyCoupon, removeCoupon };
}
