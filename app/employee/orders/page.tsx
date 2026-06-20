'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders, type OrderSummary } from '@/lib/employee/orders';

function fmt(n: number | undefined | null) {
  if (n === undefined || n === null) return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function fmtDate(s: string | undefined) {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-700',
  };
  const cls = map[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {status}
    </span>
  );
}

function OrderRow({ order }: { order: OrderSummary }) {
  const billing = order.billing as { total?: number } | undefined;
  return (
    <Link
      href={`/employee/orders/${order.orderId}`}
      className="block hover:bg-gray-50 transition-colors"
    >
      <div className="px-4 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 font-mono truncate">{order.orderId}</p>
          <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <p className="text-sm font-medium text-gray-700">{fmt(billing?.total)}</p>
          <StatusBadge status={order.status} />
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useOrders(page);

  const orders = data?.orders ?? [];
  const hasMore = Array.isArray((data?.pagination as Record<string, unknown> | undefined)?.hasNextPage)
    ? !!(data?.pagination as Record<string, unknown>)?.hasNextPage
    : orders.length === 10; // fallback heuristic

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>

      {isLoading && (
        <p className="text-gray-500 animate-pulse">Loading orders…</p>
      )}

      {isError && (
        <p className="text-red-500 text-sm">Could not load orders. Please try again.</p>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="rounded-xl bg-white shadow-sm p-10 text-center space-y-4">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
          <Link
            href="/employee/products"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {orders.map((order) => (
            <OrderRow key={order.orderId} order={order} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && orders.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
