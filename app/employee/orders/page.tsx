'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders, type OrderSummary, type OrderStatus } from '@/lib/employee/orders';
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

// Client-side status tabs (filter the loaded page). Mirrors the reference's
// All / In Progress / Delivered / Cancelled grouping.
const TABS: { key: string; label: string; match: (s: OrderStatus) => boolean }[] = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'progress', label: 'In progress', match: (s) => ['pending', 'confirmed', 'processing', 'shipped'].includes(s) },
  { key: 'delivered', label: 'Delivered', match: (s) => s === 'delivered' },
  { key: 'cancelled', label: 'Cancelled', match: (s) => ['cancelled', 'refunded'].includes(s) },
];

function itemsSummary(items: OrderSummary['items']): string {
  if (!items?.length) return '';
  const names = items.map((i) => i.productName).filter(Boolean);
  if (names.length <= 2) return names.join('  ·  ');
  return `${names.slice(0, 2).join('  ·  ')}  & ${names.length - 2} more item${names.length - 2 > 1 ? 's' : ''}`;
}

function OrderCard({ order }: { order: OrderSummary }) {
  const billing = order.billing as { total?: number } | undefined;
  const paymentPending = order.status === 'pending';
  const thumb = order.items?.find((i) => i.image)?.image;
  const summary = itemsSummary(order.items);

  return (
    <Link
      href={`/employee/orders/${order.orderId}`}
      className={`group block rounded-[20px] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(34,36,90,.14)] sm:p-5 ${glass}`}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className={statusPill(order.status)}>{order.status}</span>
        <span className="h-1 w-1 rounded-full bg-muted/60" aria-hidden />
        <span className="text-xs text-muted">{fmtDate(order.createdAt)}</span>
      </div>

      <div className="flex items-center gap-4">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-16 w-16 flex-none rounded-[14px] border border-line object-cover sm:h-[70px] sm:w-[70px]" />
        ) : (
          <span className="grid h-16 w-16 flex-none place-items-center rounded-[14px] bg-[rgba(42,43,106,.08)] text-indigo sm:h-[70px] sm:w-[70px]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 11H6L5 9z" />
            </svg>
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-indigo">Order ID: {order.orderId}</p>
          {summary && <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-slate">{summary}</p>}
          <p className="mt-1.5 text-[15px] font-extrabold tracking-[-.01em] text-ink">{fmt(billing?.total)}</p>
        </div>

        <svg className="h-5 w-5 flex-none text-muted transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
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
  const [tab, setTab] = useState('all');
  const { data, isLoading, isError } = useOrders(page);

  const orders = data?.orders ?? [];
  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  const filtered = orders.filter((o) => activeTab.match(o.status));
  const pag = data?.pagination as Record<string, unknown> | undefined;
  const hasMore = typeof pag?.hasNextPage === 'boolean' ? (pag.hasNextPage as boolean) : orders.length === 10;

  return (
    <div className="min-h-screen bg-[#eef0f8]">
      <div className={`${pageWrap} max-w-4xl`}>
        <div className="mb-6">
          <p className={`${eyebrow} mb-1.5`}>Your orders</p>
          <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink sm:text-[32px]">My orders</h1>
        </div>

        {/* Status tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const on = t.key === tab;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  on
                    ? 'bg-indigo text-white shadow-[0_8px_20px_rgba(42,43,106,.28)]'
                    : `${glass} text-slate hover:text-ink`
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`h-[120px] animate-pulse rounded-[20px] ${glass}`} />
            ))}
          </div>
        )}

        {isError && (
          <div className={`${glass} rounded-[20px] p-5 text-center text-sm text-[#e0524d] sm:p-6`}>
            Could not load orders. Please try again.
          </div>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className={`${glass} space-y-4 rounded-[24px] p-8 text-center sm:p-12`}>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-black/5 text-muted">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 11H6L5 9z" />
              </svg>
            </div>
            <p className="font-medium text-slate">You haven&apos;t placed any orders yet.</p>
            <Link href="/employee/products" className={`inline-block ${primaryBtn} px-6 py-2.5`}>Browse products</Link>
          </div>
        )}

        {!isLoading && !isError && orders.length > 0 && filtered.length === 0 && (
          <div className={`${glass} rounded-[20px] p-8 text-center text-sm text-slate`}>
            No {activeTab.label.toLowerCase()} orders on this page.
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={`${secondaryBtn} px-4 py-2 text-sm`}>
              ← Previous
            </button>
            <span className="text-sm text-slate">Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={!hasMore} className={`${secondaryBtn} px-4 py-2 text-sm`}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
