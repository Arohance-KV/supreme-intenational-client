'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const T = { tokenKey: 'sellerToken' as const };

export interface SellerDashboard {
  liveProducts: number;
  inReview: number;
  inQuotations: number;
  catalogueViews: number;
  outstanding: number;
  viewsThisWeek: { date: string; count: number }[];
  recentActivity: { name: string; status: string; submittedAt: string }[];
}

export function useSellerDashboard() {
  return useQuery({
    queryKey: ['seller', 'dashboard'],
    queryFn: () => apiFetch<SellerDashboard>('/seller/dashboard', T),
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
