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

  // Write the server's authoritative cart straight into the cache. Mutation
  // responses (PATCH/DELETE/POST) aren't HTTP-cached, so this reflects instantly
  // and doesn't depend on a GET /cart refetch that a stale cache might serve.
  const write = (data: Cart) => queryClient.setQueryData(['cart'], data);

  const setQty = useMutation<Cart, Error, { variantId: string; qty: number }, { prev?: Cart }>({
    mutationFn: ({ variantId, qty }) =>
      apiFetch<Cart>(`/cart/items/${variantId}`, { method: 'PATCH', body: { qty } }),
    // Optimistic: reflect the new qty immediately, roll back on error.
    onMutate: async ({ variantId, qty }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const prev = queryClient.getQueryData<Cart>(['cart']);
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
      apiFetch<Cart>(`/cart/items/${variantId}`, { method: 'DELETE' }),
    onSuccess: (data) => write(data),
  });

  const clear = useMutation({
    mutationFn: () => apiFetch<unknown>('/cart', { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const applyCoupon = useMutation({
    mutationFn: ({ code }: { code: string }) =>
      apiFetch<Cart>('/cart/coupon', { method: 'POST', body: { code } }),
    onSuccess: (data) => write(data),
  });

  const removeCoupon = useMutation({
    mutationFn: () => apiFetch<Cart>('/cart/coupon', { method: 'DELETE' }),
    onSuccess: (data) => write(data),
  });

  return { setQty, remove, clear, applyCoupon, removeCoupon };
}
