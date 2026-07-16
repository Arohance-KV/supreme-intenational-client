'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const T = { tokenKey: 'sellerToken' as const };

export interface SellerPerformance {
  funnel: { viewed: number; addedToQuote: number; won: number; conversionRate: number };
  topByViews: { productId: string; name: string; views: number }[];
  topByRevenue: { productId: string; productName: string; qty: number; revenue: number }[];
}

export function useSellerPerformance() {
  return useQuery({
    queryKey: ['seller', 'performance'],
    queryFn: () => apiFetch<SellerPerformance>('/seller/performance', T),
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
