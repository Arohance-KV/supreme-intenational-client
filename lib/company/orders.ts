'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const T = { tokenKey: 'companyToken' as const };

// Mirrors server/src/models/order.model.ts OrderStatus.
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// Mirrors OrderService._toCompanyOrderDTO (server/src/services/order.service.ts) —
// the SAME flat shape is returned by both listByCompany (list) and getForCompany
// (detail): item/qty/points are already joined/summed server-side, there is no
// separate per-line-item breakdown exposed to the company.
export interface CompanyOrderSummary {
  orderId: string;
  employeeName: string;
  item: string;
  qty: number;
  points: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrdersPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface OrdersPage {
  orders: CompanyOrderSummary[];
  pagination: OrdersPagination;
}

export interface CompanyOrdersFilter {
  status?: OrderStatus;
  search?: string;
  page?: number;
}

function buildQuery(filter: CompanyOrdersFilter): string {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.search) params.set('search', filter.search);
  if (filter.page) params.set('page', String(filter.page));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useCompanyOrders(filter: CompanyOrdersFilter = {}) {
  const { status, search, page } = filter;
  return useQuery<OrdersPage>({
    queryKey: ['company', 'orders', { status, search, page }] as const,
    queryFn: () => apiFetch<OrdersPage>(`/company/orders${buildQuery(filter)}`, T),
    placeholderData: (prev) => prev,
  });
}

export function useCompanyOrder(orderId: string) {
  return useQuery<CompanyOrderSummary>({
    queryKey: ['company', 'order', orderId] as const,
    queryFn: () => apiFetch<CompanyOrderSummary>(`/company/orders/${orderId}`, T),
    enabled: !!orderId,
  });
}

/**
 * Downloads the company's order CSV export. Hits the endpoint directly (not
 * apiFetch, which parses JSON) since the response is a text/csv attachment —
 * auth is via the HttpOnly cookie (credentials: 'include'), same as apiFetch.
 */
export async function exportCompanyOrdersCsv(filter: { status?: OrderStatus; search?: string } = {}): Promise<void> {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.search) params.set('search', filter.search);
  const qs = params.toString();

  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';
  const res = await fetch(`${base}/company/orders/export${qs ? `?${qs}` : ''}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Could not export orders');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'orders.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
