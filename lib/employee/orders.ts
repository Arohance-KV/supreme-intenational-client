'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  productName: string;
  sku: string;
  attributeLabels: string[];
  qty: number;
  priceAtPurchase: number;
  image?: string;
}

export interface OrderBilling {
  subtotal: number;
  couponDiscount?: number;
  shippingCharge?: number;
  total: number;
}

export interface OrderPayment {
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  method?: string | null;
  gateway?: string;
}

export interface OrderDetail {
  orderId: string;
  status: OrderStatus;
  items: OrderItem[];
  billing: OrderBilling;
  walletApplied?: number;
  payment: OrderPayment;
  createdAt?: string;
}

export interface OrderSummary {
  orderId: string;
  status: OrderStatus;
  billing?: OrderBilling;
  createdAt?: string;
  [key: string]: unknown;
}

export interface RetryPaymentResponse {
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  amountInPaise?: number;
  currency?: string;
  // fallback aliases the server might use
  orderId?: string;
  keyId?: string;
  amount?: number;
}

/** Normalise paged orders response to an array. */
function normaliseOrders(raw: unknown): OrderSummary[] {
  if (Array.isArray(raw)) return raw as OrderSummary[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    for (const key of ['orders', 'data', 'items']) {
      if (Array.isArray(obj[key])) return obj[key] as OrderSummary[];
    }
  }
  return [];
}

export interface OrdersPage {
  orders: OrderSummary[];
  pagination?: unknown;
}

export function useOrders(page = 1) {
  return useQuery<OrdersPage>({
    queryKey: ['employee', 'orders', page],
    queryFn: async () => {
      const raw = await apiFetch<unknown>(`/orders?page=${page}&limit=10`, {
        tokenKey: 'employeeToken',
      });
      return {
        orders: normaliseOrders(raw),
        pagination:
          raw && typeof raw === 'object'
            ? (raw as Record<string, unknown>).pagination
            : undefined,
      };
    },
  });
}

export function useOrder(orderId: string) {
  return useQuery<OrderDetail>({
    queryKey: ['employee', 'order', orderId],
    queryFn: () =>
      apiFetch<OrderDetail>(`/orders/${orderId}`, { tokenKey: 'employeeToken' }),
    refetchInterval: (q) => (q.state.data?.status === 'pending' ? 4000 : false),
  });
}

export function useRetryPayment() {
  const queryClient = useQueryClient();
  return useMutation<RetryPaymentResponse, Error, { orderId: string }>({
    mutationFn: ({ orderId }) =>
      apiFetch<RetryPaymentResponse>(`/orders/${orderId}/retry-payment`, {
        method: 'POST',
        tokenKey: 'employeeToken',
      }),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['employee', 'order', orderId] });
    },
  });
}
