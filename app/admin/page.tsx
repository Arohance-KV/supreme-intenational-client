'use client';

import Link from 'next/link';
import { useRevenue, useTopProducts, useOrdersByStatus, useLowStock } from '@/lib/admin/dashboard';

// ── Money helper ──────────────────────────────────────────────────────────────
function inr(n: unknown): string {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
}

// ── Status chip colours ────────────────────────────────────────────────────────
const STATUS_CHIP: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-violet-100 text-violet-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-zinc-100 text-zinc-600',
};

// ── Loading skeleton ──────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-zinc-200 ${className}`} />
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ── Error banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

export default function AdminDashboardPage() {
  const revenue = useRevenue();
  const topProducts = useTopProducts();
  const ordersByStatus = useOrdersByStatus();
  const lowStock = useLowStock();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Last 30 days overview</p>
      </div>

      {/* ── KPI cards ── */}
      <Section title="Revenue (last 30 days)">
        {revenue.isError ? (
          <ErrorBanner message="Could not load revenue data." />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {/* Total Revenue */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="text-xs text-zinc-500 mb-1">Total Revenue</p>
              {revenue.isPending ? (
                <Skeleton className="h-7 w-28 mt-1" />
              ) : (
                <p className="text-xl font-semibold text-zinc-900">
                  {inr(revenue.data?.totalRevenue)}
                </p>
              )}
            </div>

            {/* Order Count */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="text-xs text-zinc-500 mb-1">Orders (revenue-bearing)</p>
              {revenue.isPending ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-xl font-semibold text-zinc-900">
                  {typeof revenue.data?.orderCount === 'number'
                    ? revenue.data.orderCount.toLocaleString('en-IN')
                    : '—'}
                </p>
              )}
            </div>

            {/* Avg Order Value */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="text-xs text-zinc-500 mb-1">Avg Order Value</p>
              {revenue.isPending ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : (
                <p className="text-xl font-semibold text-zinc-900">
                  {inr(revenue.data?.avgOrderValue)}
                </p>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* ── Orders by Status ── */}
      <Section title="Orders by Status">
        {ordersByStatus.isError ? (
          <ErrorBanner message="Could not load order status data." />
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
            {ordersByStatus.isPending ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-8" />
                </div>
              ))
            ) : !ordersByStatus.data?.length ? (
              <p className="px-5 py-4 text-sm text-zinc-400">No orders yet.</p>
            ) : (
              ordersByStatus.data.map(row => (
                <Link
                  key={row.status}
                  href={`/admin/orders?status=${row.status}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50 transition-colors"
                >
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_CHIP[row.status] ?? 'bg-zinc-100 text-zinc-600'}`}
                  >
                    {row.status}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900">
                    {typeof row.count === 'number' ? row.count.toLocaleString('en-IN') : '—'}
                  </span>
                </Link>
              ))
            )}
          </div>
        )}
      </Section>

      {/* ── Quick-action links ── */}
      <Section title="Quick Actions">
        <div className="grid grid-cols-3 gap-4">
          <Link
            href="/admin/orders"
            className="rounded-xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50 transition-colors"
          >
            <p className="font-semibold text-zinc-900">Orders</p>
            <p className="mt-1 text-xs text-zinc-500">View and manage all customer orders</p>
          </Link>
          <Link
            href="/admin/seller-submissions"
            className="rounded-xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50 transition-colors"
          >
            <p className="font-semibold text-zinc-900">Submissions</p>
            <p className="mt-1 text-xs text-zinc-500">Review pending seller product submissions</p>
          </Link>
          <Link
            href="/admin/seller-payouts"
            className="rounded-xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50 transition-colors"
          >
            <p className="font-semibold text-zinc-900">Payouts</p>
            <p className="mt-1 text-xs text-zinc-500">Settle outstanding seller earnings</p>
          </Link>
        </div>
      </Section>

      {/* ── Top Products ── */}
      <Section title="Top Products (all time)">
        {topProducts.isError ? (
          <ErrorBanner message="Could not load top products." />
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
            {topProducts.isPending ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <Skeleton className="h-5 w-48" />
                  <div className="flex items-center gap-6">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              ))
            ) : !topProducts.data?.length ? (
              <p className="px-5 py-4 text-sm text-zinc-400">No sales data yet.</p>
            ) : (
              topProducts.data.map((product, idx) => (
                <div
                  key={product._id ?? idx}
                  className="flex items-center gap-4 px-5 py-3"
                >
                  <span className="w-6 shrink-0 text-center text-xs font-semibold text-zinc-400">
                    {idx + 1}
                  </span>
                  <span className="flex-1 truncate text-sm text-zinc-800">
                    {product.productName ?? '—'}
                  </span>
                  <span className="shrink-0 text-sm text-zinc-500">
                    {typeof product.totalQtySold === 'number'
                      ? `${product.totalQtySold.toLocaleString('en-IN')} units`
                      : '—'}
                  </span>
                  <span className="shrink-0 w-28 text-right text-sm font-semibold text-zinc-900">
                    {inr(product.totalRevenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </Section>

      {/* ── Low Stock Variants ── */}
      <Section title="Low Stock Alerts">
        {lowStock.isError ? (
          <ErrorBanner message="Could not load low-stock data." />
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
            {lowStock.isPending ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))
            ) : !lowStock.data?.length ? (
              <p className="px-5 py-4 text-sm text-zinc-400">All variants are sufficiently stocked.</p>
            ) : (
              lowStock.data.map(variant => {
                const attrLabel = Array.isArray(variant.attributes) && variant.attributes.length
                  ? variant.attributes.map(a => a.valueLabel ?? '').filter(Boolean).join(' / ')
                  : null;

                return (
                  <Link
                    key={variant._id}
                    href={`/admin/products?variantId=${variant._id}`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-50 transition-colors"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-zinc-800 truncate">
                        {variant.sku ?? '—'}
                        {attrLabel ? (
                          <span className="ml-2 text-xs text-zinc-400">({attrLabel})</span>
                        ) : null}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        (typeof variant.stock === 'number' ? variant.stock : 1) === 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {typeof variant.stock === 'number' ? `${variant.stock} left` : '—'}
                    </span>
                    <span className="shrink-0 w-24 text-right text-sm text-zinc-500">
                      {inr(variant.price)}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </Section>
    </main>
  );
}
