import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Product } from '@/lib/catalog';

// Backend mounts the user router at /user (singular).
const WISHLIST = '/user/wishlist';

export function useWishlist(enabled = true) {
  return useQuery<{ products: Product[] }>({
    queryKey: ['wishlist'],
    queryFn: () => apiFetch<{ products: Product[] }>(WISHLIST),
    enabled,
  });
}

export function useWishlistMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['wishlist'] });
  const add = useMutation({
    mutationFn: (productId: string) => apiFetch(WISHLIST, { method: 'POST', body: { productId } }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (productId: string) => apiFetch(`${WISHLIST}/${productId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });
  return { add, remove };
}
