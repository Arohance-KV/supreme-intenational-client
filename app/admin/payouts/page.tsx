'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useAdminPayouts,
  useAdminPayout,
  useSettlePayout,
  type AdminPayout,
  type SellerPayoutStatus,
} from '@/lib/admin/payouts';
import { StatusChip } from '@/components/admin/StatusChip';
import { inr, fmtDate, fmtDateTime } from '@/lib/admin/format';

const PAYOUT_STATUSES: SellerPayoutStatus[] = ['pending', 'settled', 'voided'];

// ── Detail drawer ─────────────────────────────────────────────────────────────

interface DetailDrawerProps {
  id: string;
  onClose: () => void;
}

function DetailDrawer({ id, onClose }: DetailDrawerProps) {
  const { data: payout, isLoading, isError } = useAdminPayout(id);
  const settle = useSettlePayout(id);

  function handleSettle() {
    if (!payout) return;
    const earning = typeof payout.earningAmount === 'number'
      ? `₹${payout.earningAmount.toLocaleString('en-IN')}`
      : 'this amount';
    const confirmed = window.confirm(
      `Settle payout for quotation ${payout.quotationNumber}?\n\n` +
      `Seller earning: ${earning}\n` +
      `Gross: ${inr(payout.grossAmount)}  |  Commission: ${inr(payout.commissionAmount)}\n\n` +
      `This action cannot be undone.`,
    );
    if (!confirmed) return;
    settle.mutate();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Payout details"
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-white">
          <h2 className="text-base font-semibold text-ink">Payout Detail</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted hover:text-slate hover:bg-white/50 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {isLoading && (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="h-4 rounded bg-black/5 w-full" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load payout details.
            </div>
          )}

          {payout && (
            <>
              {/* Status + settle action */}
              <div className="flex items-center gap-3">
                <StatusChip status={payout.status} />
                {payout.status === 'pending' && (
                  <button
                    onClick={handleSettle}
                    disabled={settle.isPending}
                    className="ml-auto rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {settle.isPending ? 'Settling…' : 'Settle Payout'}
                  </button>
                )}
              </div>

              {settle.isError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Failed to settle payout. Please try again.
                </div>
              )}

              {/* Quotation info */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate">
                  Quotation
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <dt className="text-slate">Quotation #</dt>
                  <dd className="font-mono text-ink">{payout.quotationNumber || '—'}</dd>
                  <dt className="text-slate">Company</dt>
                  <dd className="text-ink truncate">{payout.contactCompany || '—'}</dd>
                  <dt className="text-slate">Currency</dt>
                  <dd className="text-ink">{payout.currency || '—'}</dd>
                  <dt className="text-slate">Created</dt>
                  <dd className="text-ink">{fmtDateTime(payout.createdAt)}</dd>
                </dl>
              </section>

              {/* Money summary */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate">
                  Amounts (all in rupees)
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <dt className="text-slate">Gross</dt>
                  <dd className="font-semibold text-ink">{inr(payout.grossAmount)}</dd>
                  <dt className="text-slate">Commission ({typeof payout.marginPercent === 'number' ? `${payout.marginPercent}%` : '—'})</dt>
                  <dd className="text-ink">{inr(payout.commissionAmount)}</dd>
                  <dt className="text-slate">Seller Earning</dt>
                  <dd className="font-semibold text-green-700">{inr(payout.earningAmount)}</dd>
                </dl>
              </section>

              {/* Settlement info (when settled) */}
              {payout.status === 'settled' && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate">
                    Settlement
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <dt className="text-slate">Settled At</dt>
                    <dd className="text-ink">{fmtDateTime(payout.settledAt)}</dd>
                    <dt className="text-slate">Settled By</dt>
                    <dd className="font-mono text-xs text-slate">{payout.settledBy || '—'}</dd>
                  </dl>
                </section>
              )}

              {/* Voided info */}
              {payout.status === 'voided' && payout.voidedAt && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate">
                    Voided
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <dt className="text-slate">Voided At</dt>
                    <dd className="text-ink">{fmtDateTime(payout.voidedAt)}</dd>
                  </dl>
                </section>
              )}

              {/* Line items */}
              {Array.isArray(payout.lineItems) && payout.lineItems.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate">
                    Line Items
                  </h3>
                  <div className="rounded-lg border border-line overflow-hidden">
                    <div className="grid grid-cols-[1fr_60px_90px_90px] gap-2 px-3 py-2 bg-white/50 text-xs font-semibold text-slate uppercase tracking-wider">
                      <span>Product</span>
                      <span className="text-right">Qty</span>
                      <span className="text-right">Unit</span>
                      <span className="text-right">Total</span>
                    </div>
                    {payout.lineItems.map((item, i) => (
                      <div
                        key={item.productId ?? `line-${i}`}
                        className="grid grid-cols-[1fr_60px_90px_90px] gap-2 items-start px-3 py-2 text-sm border-t border-line"
                      >
                        <div className="min-w-0">
                          <p className="text-ink truncate">{item.productName || '—'}</p>
                          <p className="text-xs text-muted font-mono">{item.sku || ''}</p>
                        </div>
                        <span className="text-right text-slate">
                          {typeof item.qty === 'number' ? item.qty : '—'}
                        </span>
                        <span className="text-right text-slate">{inr(item.unitPrice)}</span>
                        <span className="text-right font-medium text-ink">{inr(item.lineTotal)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

// ── Settle button in row (for pending rows in the table) ──────────────────────

interface RowSettleButtonProps {
  payout: AdminPayout;
}

function RowSettleButton({ payout }: RowSettleButtonProps) {
  const settle = useSettlePayout(payout._id);

  function handleSettle(e: React.MouseEvent) {
    e.stopPropagation();
    const earning = typeof payout.earningAmount === 'number'
      ? `₹${payout.earningAmount.toLocaleString('en-IN')}`
      : 'this amount';
    const confirmed = window.confirm(
      `Settle payout for quotation ${payout.quotationNumber}?\n\n` +
      `Seller earning: ${earning}\n` +
      `Gross: ${inr(payout.grossAmount)}  |  Commission: ${inr(payout.commissionAmount)}\n\n` +
      `This action cannot be undone.`,
    );
    if (!confirmed) return;
    settle.mutate();
  }

  return (
    <button
      onClick={handleSettle}
      disabled={settle.isPending}
      className="rounded px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {settle.isPending ? '…' : 'Settle'}
    </button>
  );
}

// ── Main table (inside Suspense because it uses useSearchParams) ───────────────

function PayoutsTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [drawerPayoutId, setDrawerPayoutId] = useState<string | null>(null);

  const statusParam = (searchParams.get('status') ?? '') as SellerPayoutStatus | '';
  const sellerIdParam = searchParams.get('sellerId') ?? '';
  const fromDateParam = searchParams.get('fromDate') ?? '';
  const toDateParam = searchParams.get('toDate') ?? '';
  const rawPage = Number(searchParams.get('page') ?? '1');
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const { data, isLoading, isError } = useAdminPayouts({
    status: statusParam || undefined,
    sellerId: sellerIdParam || undefined,
    fromDate: fromDateParam || undefined,
    toDate: toDateParam || undefined,
    page,
  });

  const payouts = data?.items ?? [];
  const pagination = data?.pagination;

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== 'page') params.delete('page');
    router.push(`/admin/payouts?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-start gap-4">
        {/* Status filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate uppercase tracking-wider">
            Status:
          </span>
          <button
            onClick={() => setParam('status', null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !statusParam
                ? 'bg-indigo text-white'
                : 'bg-white/70 border border-line text-slate hover:bg-white'
            }`}
          >
            All
          </button>
          {PAYOUT_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setParam('status', s)}
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

        {/* Seller ID filter */}
        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="seller-filter" className="text-xs font-semibold text-slate uppercase tracking-wider whitespace-nowrap">
            Seller ID:
          </label>
          <input
            id="seller-filter"
            type="text"
            placeholder="MongoDB ObjectId"
            value={sellerIdParam}
            onChange={(e) => setParam('sellerId', e.target.value || null)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent w-52"
          />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate uppercase tracking-wider whitespace-nowrap">
            From:
          </label>
          <input
            type="date"
            value={fromDateParam}
            onChange={(e) => setParam('fromDate', e.target.value || null)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <label className="text-xs font-semibold text-slate uppercase tracking-wider whitespace-nowrap">
            To:
          </label>
          <input
            type="date"
            value={toDateParam}
            onChange={(e) => setParam('toDate', e.target.value || null)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading && (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] divide-y divide-line">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 w-32 rounded bg-black/5" />
              <div className="h-4 w-40 rounded bg-black/5 flex-1" />
              <div className="h-4 w-24 rounded bg-black/5" />
              <div className="h-4 w-20 rounded bg-black/5" />
              <div className="h-4 w-20 rounded bg-black/5" />
              <div className="h-5 w-16 rounded-full bg-black/5" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load payouts. Please try refreshing.
        </div>
      )}

      {!isLoading && !isError && payouts.length === 0 && (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] p-10 text-center">
          <p className="text-sm text-slate">No payouts found.</p>
        </div>
      )}

      {!isLoading && !isError && payouts.length > 0 && (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[160px_1fr_110px_110px_110px_90px_80px] gap-3 px-5 py-2 bg-white/50 text-xs font-semibold text-slate uppercase tracking-wider">
            <span>Quotation</span>
            <span>Company</span>
            <span className="text-right">Gross</span>
            <span className="text-right">Commission</span>
            <span className="text-right">Earning</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          <div className="divide-y divide-line">
            {payouts.map((payout) => (
              <div
                key={payout._id}
                onClick={() => setDrawerPayoutId(payout._id)}
                className="grid grid-cols-[160px_1fr_110px_110px_110px_90px_80px] gap-3 items-center px-5 py-3 hover:bg-white/50 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-slate truncate">
                    {payout.quotationNumber || '—'}
                  </p>
                  <p className="text-xs text-muted">{fmtDate(payout.createdAt)}</p>
                </div>

                <span className="text-sm text-slate truncate">
                  {payout.contactCompany || '—'}
                </span>

                <span className="text-right text-sm font-medium text-ink">
                  {inr(payout.grossAmount)}
                </span>

                <span className="text-right text-sm text-slate">
                  {inr(payout.commissionAmount)}
                </span>

                <span className="text-right text-sm font-semibold text-green-700">
                  {inr(payout.earningAmount)}
                </span>

                <div onClick={(e) => e.stopPropagation()}>
                  <StatusChip status={payout.status} />
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  {payout.status === 'pending' ? (
                    <RowSettleButton payout={payout} />
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate">
            Page {pagination.page} of {pagination.pages} ·{' '}
            {typeof pagination.total === 'number'
              ? `${pagination.total.toLocaleString('en-IN')} payouts`
              : ''}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setParam('page', String(pagination.page - 1))}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setParam('page', String(pagination.page + 1))}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {drawerPayoutId && (
        <DetailDrawer
          id={drawerPayoutId}
          onClose={() => setDrawerPayoutId(null)}
        />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPayoutsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Seller Payouts</h1>
          <p className="mt-1 text-sm text-slate">
            Review and settle seller earnings from converted quotations
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] p-8 text-center text-sm text-slate animate-pulse">
            Loading payouts…
          </div>
        }
      >
        <PayoutsTable />
      </Suspense>
    </div>
  );
}
