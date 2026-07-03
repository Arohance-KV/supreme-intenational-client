'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/company/PageHeader';
import { Card } from '@/components/company/Card';
import { StatusPill } from '@/components/company/StatusPill';
import { useCompanyOrders, exportCompanyOrdersCsv, type OrderStatus } from '@/lib/company/orders';
import { formatIN } from '@/lib/company/format';

const GRID = 'grid grid-cols-[1fr_1.4fr_1.8fr_.6fr_.8fr_1fr] items-center gap-4';

// Real OrderStatus enum (server/src/models/order.model.ts), labelled to match the
// mockup where a friendlier phrase exists (e.g. "pending" -> "Pending approval").
// Chip row shows the mockup's five filters; the other enum values remain reachable
// via search/pagination — the underlying useCompanyOrders({status}) wiring is unchanged.
const TABS: { label: string; value?: OrderStatus }[] = [
  { label: 'All' },
  { label: 'Pending approval', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
];

export default function CompanyOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

  // Debounce free-text search before it hits the server query. Resets to page 1
  // here (in the timeout callback, not synchronously in the effect body) since a
  // new search term invalidates the current page.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleTabSelect = (value?: OrderStatus) => {
    setStatus(value);
    setPage(1);
  };

  const { data, isLoading, isError } = useCompanyOrders({ status, search: search || undefined, page });
  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(false);
    try {
      await exportCompanyOrdersCsv({ status, search: search || undefined });
    } catch {
      setExportError(true);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-7">
      <PageHeader
        title="Orders & Purchases"
        subtitle="Every order placed by your employees, with status tracking."
        right={
          <>
            <div
              className="flex items-center gap-2 rounded-xl border border-line"
              style={{ background: 'var(--glass-bg)', padding: '10px 14px' }}
            >
              <span className="text-[13px] text-muted" aria-hidden="true">
                ⌕
              </span>
              <input
                type="search"
                placeholder="Search by order #…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-48 bg-transparent text-[13px] text-ink placeholder:text-muted focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="whitespace-nowrap rounded-xl px-4 py-[11px] text-[13.5px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg,#2a2b6a,#3a3c98)',
                boxShadow: '0 8px 20px rgba(42,43,106,.28)',
              }}
            >
              {isExporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </>
        }
      />

      {exportError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-[#d8524d]">
          Could not export orders. Please try again.
        </p>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => handleTabSelect(tab.value)}
              className="rounded-full px-[14px] py-2 text-[12px] font-semibold transition-colors"
              style={
                active
                  ? {
                      color: '#fff',
                      background: 'linear-gradient(135deg,#2a2b6a,#3a3c98)',
                      border: '1px solid transparent',
                    }
                  : {
                      color: 'var(--color-slate)',
                      background: 'rgba(255,255,255,.7)',
                      border: '1px solid var(--color-line)',
                    }
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {isError && <Card className="p-6 text-[13px] text-muted">Could not load orders.</Card>}

      {isLoading && !data && <Card className="p-6 text-[13px] text-muted">Loading…</Card>}

      {!isLoading && !isError && orders.length === 0 && (
        <Card className="p-10 text-center text-[13px] text-muted">
          {search || status ? 'No orders match these filters.' : 'No orders placed yet.'}
        </Card>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              <div
                className={`${GRID} font-jbmono border-b border-line px-5 pb-3 pt-4 text-[10px] uppercase tracking-[.05em] text-muted`}
              >
                <span>Order #</span>
                <span>Employee</span>
                <span>Item</span>
                <span>Qty</span>
                <span>Points</span>
                <span>Status</span>
              </div>
              {orders.map((order) => (
                <Link
                  key={order.orderId}
                  href={`/company/orders/${order.orderId}`}
                  className={`${GRID} border-b border-line px-5 py-4 text-[13px] no-underline transition-colors last:border-0 hover:bg-[#f6f7fb]`}
                >
                  <span className="font-jbmono truncate text-[12.5px] text-slate">{order.orderId}</span>
                  <span className="truncate font-bold text-ink">{order.employeeName}</span>
                  <span className="truncate text-slate">{order.item}</span>
                  <span className="text-ink">{order.qty}</span>
                  <span className="font-bold text-ink">{formatIN(order.points)}</span>
                  <span>
                    <StatusPill status={order.status} />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[12.5px] text-slate">
              <span>
                Page {pagination.page} of {pagination.pages} &middot; {pagination.total} orders
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="rounded-lg border border-line px-3 py-1.5 font-semibold transition-colors hover:bg-[#eef0f8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={pagination.page >= pagination.pages}
                  className="rounded-lg border border-line px-3 py-1.5 font-semibold transition-colors hover:bg-[#eef0f8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
