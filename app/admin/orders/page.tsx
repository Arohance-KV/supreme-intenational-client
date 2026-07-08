'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminOrders, type OrderStatus } from '@/lib/admin/orders';
import { StatusChip } from '@/components/admin/StatusChip';

// ── Helpers ───────────────────────────────────────────────────────────────────

function inr(n: unknown): string {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
}

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

// ── Inner component (needs useSearchParams — must be inside <Suspense>) ───────

function OrdersTable() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const statusParam = searchParams.get('status') as OrderStatus | null;
  const pageParam = Number(searchParams.get('page') ?? '1');
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const { data, isLoading, isError } = useAdminOrders({
    status: statusParam ?? undefined,
    page,
  });

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset to page 1 when filter changes
    if (key !== 'page') params.delete('page');
    router.push(`/admin/orders?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate uppercase tracking-wider mr-1">
          Filter:
        </span>
        <button
          onClick={() => setFilter('status', null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !statusParam
              ? 'bg-indigo text-white'
              : 'bg-white/70 border border-line text-slate hover:bg-white'
          }`}
        >
          All
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter('status', s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              statusParam === s
                ? 'bg-indigo text-white'
                : 'bg-white/70 border border-line text-slate hover:bg-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading && (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] divide-y divide-line">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 w-32 rounded bg-black/5" />
              <div className="h-4 w-40 rounded bg-black/5 flex-1" />
              <div className="h-5 w-20 rounded-full bg-black/5" />
              <div className="h-4 w-20 rounded bg-black/5" />
              <div className="h-4 w-28 rounded bg-black/5" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load orders. Please try refreshing.
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-10 text-center">
          <p className="text-sm text-slate">No orders found.</p>
        </div>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] divide-y divide-line overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[160px_1fr_120px_120px_160px] gap-4 px-5 py-2 bg-white/50 text-xs font-semibold text-slate uppercase tracking-wider">
            <span>Order ID</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Total</span>
            <span>Date</span>
          </div>

          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/admin/orders/${order.orderId}`}
              className="grid grid-cols-[160px_1fr_120px_120px_160px] gap-4 items-center px-5 py-3 hover:bg-white/50 transition-colors"
            >
              <span className="font-jbmono text-xs text-slate truncate">
                {order.orderId}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">{order.customerEmail}</p>
                {order.guestInfo?.name && (
                  <p className="text-xs text-muted truncate">{order.guestInfo.name}</p>
                )}
              </div>
              <div>
                <StatusChip status={order.status} />
              </div>
              <span className="text-sm font-semibold text-ink">
                {inr(order.billing?.total)}
              </span>
              <span className="text-xs text-muted">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate">
            Page {pagination.page} of {pagination.pages} ·{' '}
            {typeof pagination.total === 'number'
              ? `${pagination.total.toLocaleString('en-IN')} orders`
              : ''}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setFilter('page', String(pagination.page - 1))}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setFilter('page', String(pagination.page + 1))}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-extrabold tracking-tight text-ink">Orders</h1>
          <p className="mt-1 text-sm text-slate">Manage and track all customer orders</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-8 text-center text-sm text-slate animate-pulse">
            Loading orders…
          </div>
        }
      >
        <OrdersTable />
      </Suspense>
    </div>
  );
}
