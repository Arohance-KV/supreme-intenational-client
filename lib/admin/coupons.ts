import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminCoupon {
  _id: string;
  code: string;
  description: string;
  type: 'flat' | 'percent';
  value: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  usageLimit: number;
  perUserLimit: number;
  usedCount: number;
  applicableCategories: string[];
  applicableProducts: string[];
  isActive: boolean;
  startsAt: string;   // ISO string from JSON serialisation
  expiresAt: string | null;
  createdBy: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponBody {
  code: string;
  description?: string;
  type: 'flat' | 'percent';
  value: number;
  startsAt: string;              // ISO 8601
  expiresAt?: string | null;     // ISO 8601 or null/omitted
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  companyId?: string;
}

export type UpdateCouponBody = Partial<Omit<CreateCouponBody, 'code'>>;

// ── Query key helpers ─────────────────────────────────────────────────────────

const COUPONS_LIST_KEY = ['admin', 'coupons', 'list'] as const;
const COUPON_DETAIL_KEY = (id: string) => ['admin', 'coupons', 'detail', id] as const;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useCoupons() {
  return useQuery<AdminCoupon[]>({
    queryKey: COUPONS_LIST_KEY,
    queryFn: () => adminFetch<AdminCoupon[]>('/admin/coupons'),
  });
}

export function useCoupon(id: string) {
  return useQuery<AdminCoupon>({
    queryKey: COUPON_DETAIL_KEY(id),
    queryFn: () => adminFetch<AdminCoupon>(`/admin/coupons/${id}`),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCouponBody) =>
      adminFetch<AdminCoupon>('/admin/coupons', { method: 'POST', body }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: COUPONS_LIST_KEY }),
  });
}

export function useUpdateCoupon(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCouponBody) =>
      adminFetch<AdminCoupon>(`/admin/coupons/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COUPONS_LIST_KEY });
      qc.invalidateQueries({ queryKey: COUPON_DETAIL_KEY(id) });
    },
  });
}

export function useDeactivateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch<AdminCoupon>(`/admin/coupons/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: COUPONS_LIST_KEY });
      qc.invalidateQueries({ queryKey: COUPON_DETAIL_KEY(id) });
    },
  });
}
