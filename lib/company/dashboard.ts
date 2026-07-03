'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export type Range = 'week' | 'month' | 'all';

export interface DashboardStats {
  pointsAllocated: number;
  pointsUsed: number;
  ordersPlaced: number;
  pointsRemaining: number;
}

export interface DashboardPool {
  used: number;
  total: number;
  redeemedPct: number;
}

export interface DashboardSeriesPoint {
  bucket: string;
  points: number;
}

export type RecentOrderStatus = string;

export interface DashboardRecentOrder {
  id: string;
  item: string;
  employeeName: string;
  points: number;
  status: RecentOrderStatus;
}

export interface Dashboard {
  stats: DashboardStats;
  pool: DashboardPool;
  redeemedSeries: DashboardSeriesPoint[];
  recentOrders: DashboardRecentOrder[];
}

export function useCompanyDashboard(range: Range) {
  return useQuery<Dashboard>({
    queryKey: ['company', 'dashboard', range],
    queryFn: () =>
      apiFetch<Dashboard>(`/company/dashboard?range=${range}`, { tokenKey: 'companyToken' }),
  });
}
