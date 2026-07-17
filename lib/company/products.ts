'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';
import { getSessionId } from '@/lib/session';

const T = { tokenKey: 'companyToken' as const };

// Mirrors the row shape returned by companyCatalogService.listResolvedProducts
// (server/src/services/companyCatalog.service.ts). Includes hidden products so
// the UI can offer a "Show" action on them.
export interface CompanyProduct {
  productId: string;
  name: string;
  image: string | null;
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
  image?: File;
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

// Multipart (an optional reference image rides along) — apiFetch is JSON-only, so this
// posts directly, mirroring uploadCompanyLogo in lib/company/profile.ts.
async function postProductRequest(body: ProductRequestBody): Promise<unknown> {
  const fd = new FormData();
  if (body.subject) fd.append('subject', body.subject);
  if (body.message) fd.append('message', body.message);
  if (body.image) fd.append('file', body.image);

  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';
  const token = typeof window !== 'undefined' ? localStorage.getItem(T.tokenKey) : null;
  const res = await fetch(`${base}/company/products/requests`, {
    method: 'POST',
    headers: { 'x-session-id': getSessionId(), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: 'include',
    body: fd,
  });
  const json = await res.json();
  if (!res.ok || json?.success === false) throw new ApiError(json?.message ?? 'Request failed', res.status);
  return json.data;
}

export function useRequestProducts() {
  return useMutation({ mutationFn: postProductRequest });
}
