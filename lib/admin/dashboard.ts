import { useQuery } from '@tanstack/react-query';
import { adminFetch } from './api';

// ── Revenue ──────────────────────────────────────────────────────────────────
// GET /admin/analytics/revenue?dateFrom=&dateTo=
// Returns: { totalRevenue: number; orderCount: number; avgOrderValue: number }
export interface RevenueData {
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
}

/** Fetches revenue for the rolling last-30-days by default. */
export function useRevenue(dateFrom?: string, dateTo?: string) {
  // Default: last 30 days
  const to = dateTo ?? new Date().toISOString().slice(0, 10);
  const from = dateFrom ?? (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  })();

  return useQuery<RevenueData>({
    queryKey: ['admin', 'revenue', from, to],
    queryFn: () =>
      adminFetch<RevenueData>(`/admin/analytics/revenue?dateFrom=${from}&dateTo=${to}`),
  });
}

// ── Top Products ──────────────────────────────────────────────────────────────
// GET /admin/analytics/top-products?limit=10
// Returns: Array<{ _id: string; productName: string; totalQtySold: number; totalRevenue: number }>
export interface TopProduct {
  _id: string;
  productName: string;
  totalQtySold: number;
  totalRevenue: number;
}

export function useTopProducts(limit = 10) {
  return useQuery<TopProduct[]>({
    queryKey: ['admin', 'top-products', limit],
    queryFn: () =>
      adminFetch<TopProduct[]>(`/admin/analytics/top-products?limit=${limit}`),
  });
}

// ── Orders by Status ──────────────────────────────────────────────────────────
// GET /admin/analytics/orders-by-status
// Returns: Array<{ status: string; count: number }>
export interface OrderStatusCount {
  status: string;
  count: number;
}

export function useOrdersByStatus() {
  return useQuery<OrderStatusCount[]>({
    queryKey: ['admin', 'orders-by-status'],
    queryFn: () =>
      adminFetch<OrderStatusCount[]>('/admin/analytics/orders-by-status'),
  });
}

// ── Low Stock Variants ────────────────────────────────────────────────────────
// GET /admin/inventory/low-stock
// Returns: IProductVariant[] — Mongoose documents, key fields listed below
export interface LowStockVariant {
  _id: string;
  product: string;
  sku: string;
  price: number;
  originalPrice: number;
  stock: number;
  moq: number;
  images: string[];
  attributes: {
    attributeId: string;
    attributeName: string;
    attributeSlug: string;
    valueId: string;
    valueLabel: string;
    valueSlug: string;
  }[];
  variantKey: string;
  isActive: boolean;
}

export function useLowStock() {
  return useQuery<LowStockVariant[]>({
    queryKey: ['admin', 'low-stock'],
    queryFn: () =>
      adminFetch<LowStockVariant[]>('/admin/inventory/low-stock'),
  });
}
