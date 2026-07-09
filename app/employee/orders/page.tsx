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
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function OrderCard({ order }: { order: OrderSummary }) {
  const billing = order.billing as { total?: number } | undefined;
  const paymentPending = order.status === 'pending';
  return (
    <Link
      href={`/employee/orders/${order.orderId}`}
      className={`group block rounded-[18px] p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(34,36,90,.14)] ${glass}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-[14px] bg-[rgba(42,43,106,.08)] text-indigo">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 11H6L5 9z" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="truncate font-jbmono text-sm font-bold text-ink">{order.orderId}</p>
            <p className="mt-0.5 text-xs text-muted">{fmtDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-none items-center gap-4">
          <div className="text-right">
            <p className="text-base font-extrabold tracking-[-.01em] text-ink">{fmt(billing?.total)}</p>
            <span className={`mt-1 ${statusPill(order.status)}`}>{order.status}</span>
          </div>
          <svg className="h-5 w-5 text-muted transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      {paymentPending && (
        <p className="mt-3 rounded-lg bg-[rgba(224,163,59,.12)] px-3 py-1.5 text-xs font-medium text-[#b5801e]">
          Payment pending — tap to complete
        </p>
      )}
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
      <div className={`${pageWrap} max-w-3xl`}>
        <div className="mb-6">
          <p className={eyebrow}>YOUR ORDERS</p>
          <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink">My Orders</h1>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`h-[92px] animate-pulse rounded-[18px] ${glass}`} />
            ))}
          </div>
        )}

        {isError && (
          <div className={`${glass} rounded-[18px] p-6 text-center text-sm text-[#e0524d]`}>
            Could not load orders. Please try again.
          </div>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className={`${glass} space-y-4 rounded-[20px] p-12 text-center`}>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-black/5 text-2xl text-muted">🛍️</div>
            <p className="font-medium text-slate">You haven&apos;t placed any orders yet.</p>
            <Link href="/employee/products" className={`inline-block ${primaryBtn} px-6 py-2.5`}>
              Browse Products
            </Link>
          </div>
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`${secondaryBtn} px-4 py-2 text-sm`}
            >
              ← Previous
            </button>
            <span className="text-sm text-slate">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className={`${secondaryBtn} px-4 py-2 text-sm`}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
