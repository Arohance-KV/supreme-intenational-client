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

// ── Dashboard summary (quotations / catalogues / enquiries counts) ─────────────
// GET /admin/analytics/dashboard-summary
export interface DashboardSummary {
  quotations: number;
  catalogues: number;
  enquiries: number;
}

export function useDashboardSummary(dateFrom?: string, dateTo?: string) {
  const qs = new URLSearchParams();
  if (dateFrom) qs.set('dateFrom', dateFrom);
  if (dateTo) qs.set('dateTo', dateTo);
  const q = qs.toString();
  return useQuery<DashboardSummary>({
    queryKey: ['admin', 'dashboard-summary', dateFrom ?? '', dateTo ?? ''],
    queryFn: () => adminFetch<DashboardSummary>(`/admin/analytics/dashboard-summary${q ? `?${q}` : ''}`),
  });
}

// ── Generated-per-month (downloads-over-time chart) ────────────────────────────
// GET /admin/analytics/generated-timeseries?months=10
export interface GeneratedPoint {
  month: string;
  quotations: number;
  catalogues: number;
}

export function useGeneratedTimeseries(months = 10) {
  return useQuery<GeneratedPoint[]>({
    queryKey: ['admin', 'generated-timeseries', months],
    queryFn: () => adminFetch<GeneratedPoint[]>(`/admin/analytics/generated-timeseries?months=${months}`),
  });
}

// ── Recent activity feed ────────────────────────────────────────────────────────
// GET /admin/analytics/recent-activity?limit=8
export interface ActivityItem {
  who: string;
  what: string;
  when: string;
  type: 'quotation' | 'catalogue' | 'order';
}

export function useRecentActivity(limit = 8) {
  return useQuery<ActivityItem[]>({
    queryKey: ['admin', 'recent-activity', limit],
    queryFn: () => adminFetch<ActivityItem[]>(`/admin/analytics/recent-activity?limit=${limit}`),
  });
}

// ── Analytics page: enquiry headline metrics ───────────────────────────────────
// GET /admin/analytics/enquiries-summary
export interface EnquiriesSummary {
  totalEnquiries: number;
  conversionRate: number; // fraction 0..1
  avgQuotationValue: number;
}

export function useEnquiriesSummary() {
  return useQuery<EnquiriesSummary>({
    queryKey: ['admin', 'enquiries-summary'],
    queryFn: () => adminFetch<EnquiriesSummary>('/admin/analytics/enquiries-summary'),
  });
}

// ── Analytics page: enquiries vs quotations (monthly) ──────────────────────────
// GET /admin/analytics/enquiries-vs-quotations?months=6
export interface EnqVsQuotePoint {
  month: string;
  enquiries: number;
  quotations: number;
}

export function useEnquiriesVsQuotations(months = 6) {
  return useQuery<EnqVsQuotePoint[]>({
    queryKey: ['admin', 'enq-vs-quote', months],
    queryFn: () => adminFetch<EnqVsQuotePoint[]>(`/admin/analytics/enquiries-vs-quotations?months=${months}`),
  });
}

// ── Analytics page: seller performance leaderboard ─────────────────────────────
// GET /admin/analytics/seller-performance?limit=10
export interface SellerPerf {
  sellerId: string;
  name: string;
  gross: number;
  earnings: number;
  deals: number;
}

export function useSellerPerformance(limit = 10) {
  return useQuery<SellerPerf[]>({
    queryKey: ['admin', 'seller-performance', limit],
    queryFn: () => adminFetch<SellerPerf[]>(`/admin/analytics/seller-performance?limit=${limit}`),
  });
}
