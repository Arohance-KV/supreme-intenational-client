'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  variantId: string;
  productId: string;
  sku?: string;
  productName?: string;
  attributeLabels?: string[];
  image?: string;
  qty: number;
  priceAtPurchase: number;
  originalPriceAtPurchase: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Billing {
  subtotal: number;
  couponCode: string | null;
  couponDiscount: number;
  shippingCharge: number;
  shippingTax: number;
  total: number;
}

export interface Payment {
  gateway: 'razorpay' | 'wallet';
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  method: string | null;
  paidAt: string | null;
}

export interface TimelineEntry {
  status: string;
  note: string;
  timestamp: string;
}

export interface TrackingInfo {
  courier: string | null;
  trackingId: string | null;
  trackingUrl: string | null;
}

export interface Order {
  _id: string;
  orderId: string;
  userId: string | null;
  customerEmail: string;
  guestInfo: { name: string; email: string; phone: string } | null;
  sessionId: string | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billing: Billing;
  orderType: 'standard' | 'employee';
  walletApplied: number;
  walletRefundedAt: string | null;
  payment: Payment;
  status: OrderStatus;
  timeline: TimelineEntry[];
  trackingInfo: TrackingInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AdminOrderFilters {
  status?: OrderStatus | '';
  page?: number;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useAdminOrders(filters: AdminOrderFilters = {}) {
  const qs = new URLSearchParams();
  if (filters.status) qs.set('status', filters.status);
  if (filters.page && filters.page > 1) qs.set('page', String(filters.page));

  const qsStr = qs.toString();

  return useQuery<AdminOrdersResponse>({
    queryKey: ['admin', 'orders', filters.status ?? 'all', filters.page ?? 1],
    queryFn: () =>
      adminFetch<AdminOrdersResponse>(`/admin/orders${qsStr ? `?${qsStr}` : ''}`),
  });
}

export function useAdminOrder(orderId: string) {
  return useQuery<Order>({
    queryKey: ['admin', 'orders', orderId],
    queryFn: () => adminFetch<Order>(`/admin/orders/${orderId}`),
    enabled: !!orderId,
  });
}

export interface UpdateOrderStatusBody {
  status: OrderStatus;
  note?: string;
  trackingInfo?: TrackingInfo;
}

export function useUpdateOrderStatus(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateOrderStatusBody) =>
      adminFetch<Order>(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders', orderId] });
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}

export function useRefundOrder(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      adminFetch<Order>(`/admin/orders/${orderId}/refund`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders', orderId] });
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}
