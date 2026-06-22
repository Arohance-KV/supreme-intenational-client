import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────
// Mirrored from server/src/models/sellerPayout.model.ts
// All money fields (grossAmount, commissionAmount, earningAmount, unitPrice,
// lineTotal) are in RUPEES (not paise).

export type SellerPayoutStatus = 'pending' | 'settled' | 'voided';

export interface PayoutLineItem {
  productId: string;
  productName: string;
  sku: string;
  qty: number;
  /** Rupees */
  unitPrice: number;
  /** Rupees */
  lineTotal: number;
}

export interface AdminPayout {
  _id: string;
  sellerId: string;
  quotationId: string;
  quotationNumber: string;
  contactCompany: string;
  /** Rupees — total order value for this seller's lines */
  grossAmount: number;
  /** 0–100 — the admin margin percentage */
  marginPercent: number;
  /** Rupees — admin's commission cut */
  commissionAmount: number;
  /** Rupees — seller's net earning (grossAmount - commissionAmount) */
  earningAmount: number;
  currency: string;
  lineItems: PayoutLineItem[];
  status: SellerPayoutStatus;
  settledAt: string | null;
  settledBy: string | null;
  voidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutsListResponse {
  items: AdminPayout[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export interface PayoutsFilters {
  sellerId?: string;
  status?: SellerPayoutStatus | '';
  fromDate?: string;
  toDate?: string;
  page?: number;
}

// ── Query key helpers ─────────────────────────────────────────────────────────

const PAYOUTS_LIST_KEY = (filters: PayoutsFilters) =>
  ['admin', 'payouts', 'list', filters] as const;

const PAYOUT_KEY = (id: string) =>
  ['admin', 'payouts', 'detail', id] as const;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useAdminPayouts(filters: PayoutsFilters = {}) {
  const { sellerId, status, fromDate, toDate, page = 1 } = filters;

  const qs = new URLSearchParams();
  qs.set('page', String(page));
  if (sellerId) qs.set('sellerId', sellerId);
  if (status) qs.set('status', status);
  if (fromDate) qs.set('fromDate', fromDate);
  if (toDate) qs.set('toDate', toDate);

  return useQuery<PayoutsListResponse>({
    queryKey: PAYOUTS_LIST_KEY(filters),
    queryFn: () =>
      adminFetch<PayoutsListResponse>(`/admin/seller-payouts?${qs.toString()}`),
  });
}

export function useAdminPayout(id: string) {
  return useQuery<AdminPayout>({
    queryKey: PAYOUT_KEY(id),
    queryFn: () => adminFetch<AdminPayout>(`/admin/seller-payouts/${id}`),
    enabled: !!id,
  });
}

/**
 * Settle payout — POST /admin/seller-payouts/:id/settle
 * No request body. Precondition: status === 'pending'. Transitions to 'settled'.
 */
export function useSettlePayout(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      adminFetch<AdminPayout>(`/admin/seller-payouts/${id}/settle`, {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAYOUT_KEY(id) });
      qc.invalidateQueries({ queryKey: ['admin', 'payouts', 'list'] });
    },
  });
}
