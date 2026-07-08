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

const KEY = ['employee', 'cart'] as const;

export function useEmployeeCartMutations() {
  const queryClient = useQueryClient();

  // Write the server's authoritative cart straight into the cache — instant and
  // independent of a GET refetch. See useCartMutations for the rationale.
  const write = (data: Cart) => queryClient.setQueryData(KEY, data);

  const setQty = useMutation<Cart, Error, { variantId: string; qty: number }, { prev?: Cart }>({
    mutationFn: ({ variantId, qty }) =>
      apiFetch<Cart>(`/cart/items/${variantId}`, { method: 'PATCH', body: { qty }, tokenKey: 'employeeToken' }),
    onMutate: async ({ variantId, qty }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Cart>(KEY);
      if (prev) {
        write({ ...prev, items: prev.items.map((i) => (i.variantId === variantId ? { ...i, qty } : i)) });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) write(ctx.prev); },
    onSuccess: (data) => write(data),
  });

  const remove = useMutation({
    mutationFn: ({ variantId }: { variantId: string }) =>
      apiFetch<Cart>(`/cart/items/${variantId}`, { method: 'DELETE', tokenKey: 'employeeToken' }),
    onSuccess: (data) => write(data),
  });

  const clear = useMutation({
    mutationFn: () =>
      apiFetch<unknown>('/cart', { method: 'DELETE', tokenKey: 'employeeToken' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const applyCoupon = useMutation({
    mutationFn: ({ code }: { code: string }) =>
      apiFetch<Cart>('/cart/coupon', { method: 'POST', body: { code }, tokenKey: 'employeeToken' }),
    onSuccess: (data) => write(data),
  });

  const removeCoupon = useMutation({
    mutationFn: () =>
      apiFetch<Cart>('/cart/coupon', { method: 'DELETE', tokenKey: 'employeeToken' }),
    onSuccess: (data) => write(data),
  });

  return { setQty, remove, clear, applyCoupon, removeCoupon };
}
