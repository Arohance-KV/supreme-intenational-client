'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders, type OrderSummary } from '@/lib/employee/orders';
import { glass, primaryBtn, secondaryBtn, eyebrow, pageWrap, statusPill } from '@/components/employee/ui';

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
  return <span className={statusPill(status)}>{status}</span>;
}

function OrderRow({ order }: { order: OrderSummary }) {
  const billing = order.billing as { total?: number } | undefined;
  return (
    <Link
      href={`/employee/orders/${order.orderId}`}
      className="block hover:bg-[rgba(42,43,106,.04)] transition-colors"
    >
      <div className="px-4 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold font-jbmono text-ink truncate">{order.orderId}</p>
          <p className="text-xs text-muted mt-0.5">{fmtDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <p className="text-sm font-semibold text-ink">{fmt(billing?.total)}</p>
          <StatusBadge status={order.status} />
          <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
  const pag = data?.pagination as Record<string, unknown> | undefined;
  const hasMore = typeof pag?.hasNextPage === 'boolean' ? (pag.hasNextPage as boolean) : orders.length === 10;

  return (
    <div className="min-h-screen bg-[#eef0f8]">
      <div className={`${pageWrap} space-y-6`}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <p className={eyebrow}>YOUR ORDERS</p>
            <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink">My Orders</h1>
          </div>

          {isLoading && (
            <p className="text-slate animate-pulse">Loading orders…</p>
          )}

          {isError && (
            <p className="text-[#e0524d] text-sm">Could not load orders. Please try again.</p>
          )}

          {!isLoading && !isError && orders.length === 0 && (
            <div className={`${glass} rounded-[20px] p-10 text-center space-y-4`}>
              <p className="text-slate">You haven't placed any orders yet.</p>
              <Link
                href="/employee/products"
                className={`inline-block ${primaryBtn} px-6 py-2.5`}
              >
                Browse Products
              </Link>
            </div>
          )}

          {!isLoading && !isError && orders.length > 0 && (
            <div className={`${glass} rounded-[20px] overflow-hidden divide-y divide-line`}>
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
                className={`${secondaryBtn} px-4 py-2 text-sm`}
              >
                Previous
              </button>
              <span className="text-sm text-slate">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className={`${secondaryBtn} px-4 py-2 text-sm`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
