'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const T = { tokenKey: 'sellerToken' as const };

export interface Payout {
  _id: string;
  quotationId: string;
  grossAmount: number;
  marginPercent: number;
  commissionAmount: number;
  earningAmount: number;
  status: 'pending' | 'settled' | 'voided';
  settledAt: string | null;
  createdAt: string;
}

interface Paginated<T> {
  items: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export function usePayouts(status?: string, page = 1) {
  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  qs.set('page', String(page));
  return useQuery({
    queryKey: ['seller', 'payouts', status ?? 'all', page],
    queryFn: () => apiFetch<Paginated<Payout>>(`/seller/payouts?${qs.toString()}`, T),
  });
}

export function useEarningsSummary() {
  return useQuery({
    queryKey: ['seller', 'earnings-summary'],
    queryFn: () =>
      apiFetch<{ outstanding: number; settled: number; lifetime: number }>(
        '/seller/earnings/summary',
        T,
      ),
  });
}
