import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SellerStatus = 'pending' | 'active' | 'rejected' | 'suspended';

export interface SellerContact {
  name?: string;
  email?: string;
  isdCode?: string;
  phoneNumber?: string;
}

export interface AdminSeller {
  _id: string;
  businessName: string;
  slug: string;
  status: SellerStatus;
  contact?: SellerContact;
  description?: string;
  marginPercent: number; // 0–100 (percentage the admin keeps)
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellersListResponse {
  items: AdminSeller[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export interface UpdateSellerStatusBody {
  status: SellerStatus;
  reason?: string; // required when status === 'rejected'
}

export interface UpdateSellerBody {
  businessName?: string;
  description?: string;
  marginPercent?: number; // float 0–100
  contact?: SellerContact;
}

// Seller products — reuse the minimal product shape from the list endpoint
export interface SellerProduct {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  isActive?: boolean;
  minPrice?: number;
}

export interface SellerProductsResponse {
  products: SellerProduct[];
  pagination?: { total: number; page: number; limit: number; pages: number };
}

// Performance — from sellerPayout.repository.ts#performance()
export interface SellerTopProduct {
  productId: string;
  productName: string;
  qty: number;
  revenue: number;
}

export interface SellerPerformance {
  gross: number;       // total order value
  commission: number;  // admin's cut
  earnings: number;    // seller's payout
  dealCount: number;   // number of quotations
  topProducts: SellerTopProduct[];
}

// ── Query key helpers ─────────────────────────────────────────────────────────

const SELLERS_LIST_KEY = (page: number, search?: string, status?: string) =>
  ['admin', 'sellers', 'list', page, search ?? '', status ?? ''] as const;

const SELLER_KEY = (id: string) =>
  ['admin', 'sellers', 'detail', id] as const;

const SELLER_PRODUCTS_KEY = (id: string) =>
  ['admin', 'sellers', 'products', id] as const;

const SELLER_PERFORMANCE_KEY = (id: string) =>
  ['admin', 'sellers', 'performance', id] as const;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useSellers(page = 1, search?: string, status?: string) {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  if (search) qs.set('search', search);
  if (status) qs.set('status', status);

  return useQuery<SellersListResponse>({
    queryKey: SELLERS_LIST_KEY(page, search, status),
    queryFn: () =>
      adminFetch<SellersListResponse>(`/admin/sellers?${qs.toString()}`),
  });
}

export function useSeller(id: string) {
  return useQuery<AdminSeller>({
    queryKey: SELLER_KEY(id),
    queryFn: () => adminFetch<AdminSeller>(`/admin/sellers/${id}`),
    enabled: !!id,
  });
}

export function useUpdateSellerStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSellerStatusBody) =>
      adminFetch<AdminSeller>(`/admin/sellers/${id}/status`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SELLER_KEY(id) });
      qc.invalidateQueries({ queryKey: ['admin', 'sellers', 'list'] });
    },
  });
}

export function useUpdateSeller(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSellerBody) =>
      adminFetch<AdminSeller>(`/admin/sellers/${id}`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SELLER_KEY(id) });
      qc.invalidateQueries({ queryKey: ['admin', 'sellers', 'list'] });
    },
  });
}

export function useSellerProducts(id: string) {
  return useQuery<SellerProductsResponse>({
    queryKey: SELLER_PRODUCTS_KEY(id),
    queryFn: () =>
      adminFetch<SellerProductsResponse>(`/admin/sellers/${id}/products`),
    enabled: !!id,
  });
}

export function useSellerPerformance(id: string) {
  return useQuery<SellerPerformance>({
    queryKey: SELLER_PERFORMANCE_KEY(id),
    queryFn: () =>
      adminFetch<SellerPerformance>(`/admin/sellers/${id}/performance`),
    enabled: !!id,
  });
}
