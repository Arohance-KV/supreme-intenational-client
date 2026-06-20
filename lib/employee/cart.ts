'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Cart } from '@/lib/cart';

export function useEmployeeCart() {
  return useQuery<Cart>({
    queryKey: ['employee', 'cart'],
    queryFn: () => apiFetch<Cart>('/cart', { tokenKey: 'employeeToken' }),
  });
}

export function useEmployeeCartMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['employee', 'cart'] });

  const setQty = useMutation({
    mutationFn: ({ variantId, qty }: { variantId: string; qty: number }) =>
      apiFetch<Cart>(`/cart/items/${variantId}`, {
        method: 'PATCH',
        body: { qty },
        tokenKey: 'employeeToken',
      }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ variantId }: { variantId: string }) =>
      apiFetch<Cart>(`/cart/items/${variantId}`, {
        method: 'DELETE',
        tokenKey: 'employeeToken',
      }),
    onSuccess: invalidate,
  });

  const clear = useMutation({
    mutationFn: () =>
      apiFetch<unknown>('/cart', { method: 'DELETE', tokenKey: 'employeeToken' }),
    onSuccess: invalidate,
  });

  const applyCoupon = useMutation({
    mutationFn: ({ code }: { code: string }) =>
      apiFetch<Cart>('/cart/coupon', {
        method: 'POST',
        body: { code },
        tokenKey: 'employeeToken',
      }),
    onSuccess: invalidate,
  });

  const removeCoupon = useMutation({
    mutationFn: () =>
      apiFetch<Cart>('/cart/coupon', { method: 'DELETE', tokenKey: 'employeeToken' }),
    onSuccess: invalidate,
  });

  return { setQty, remove, clear, applyCoupon, removeCoupon };
}
