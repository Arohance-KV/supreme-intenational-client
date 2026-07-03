'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const T = { tokenKey: 'companyToken' as const };

// Mirrors the row shape returned by companyCatalogService.listResolvedProducts
// (server/src/services/companyCatalog.service.ts). Includes hidden products so
// the UI can offer a "Show" action on them.
export interface CompanyProduct {
  productId: string;
  name: string;
  category: string | null;
  points: number;
  stock: number;
  hidden: boolean;
  status: 'Active' | 'Hidden';
}

interface ProductsResponse {
  products: CompanyProduct[];
}

interface PatchProductBody {
  hidden?: boolean;
  pointsOverride?: number | null;
}

interface PatchProductResult {
  productId: string;
  hidden: boolean;
  pointsOverride: number | null;
}

export interface ProductRequestBody {
  subject?: string;
  message?: string;
}

const PRODUCTS_KEY = ['company', 'products'] as const;

export function useCompanyProducts() {
  return useQuery<ProductsResponse>({
    queryKey: PRODUCTS_KEY,
    queryFn: () => apiFetch<ProductsResponse>('/company/products', T),
  });
}

export function usePatchProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PatchProductBody }) =>
      apiFetch<PatchProductResult>(`/company/products/${id}`, {
        method: 'PATCH',
        body,
        ...T,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useRequestProducts() {
  return useMutation({
    mutationFn: (body: ProductRequestBody) =>
      apiFetch('/company/products/requests', { method: 'POST', body, ...T }),
  });
}
