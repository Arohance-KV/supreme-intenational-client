'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import {
  useQuotation,
  useUpdateQuotationStatus,
  type QuotationStatus,
} from '@/lib/admin/enquiries';
import { StatusChip } from '@/components/admin/StatusChip';
import { inr, fmtDateTime } from '@/lib/admin/format';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}

// The backend allows any → any transition (no server-side transition map enforced).
// All statuses are therefore always available when changing.
const QUOTATION_STATUSES: QuotationStatus[] = [
  'generated',
  'sent',
  'viewed',
  'converted',
  'archived',
];

// ── Detail page ───────────────────────────────────────────────────────────────

export default function AdminQuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: quotation, isLoading, isError } = useQuotation(id);
  const updateStatus = useUpdateQuotationStatus(id);

  const [pendingStatus, setPendingStatus] = useState<QuotationStatus | ''>('');
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto space-y-6">
        <div className="h-7 w-48 rounded bg-zinc-200 animate-pulse" />
        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="h-4 w-full rounded bg-zinc-200" />
          ))}
        </div>
      </main>
    );
  }

  if (isError || !quotation) {
    return (
      <main className="max-w-4xl mx-auto space-y-4">
        <Link href="/admin/quotations" className="text-sm text-zinc-500 hover:underline">
          ← Back to Quotations
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Quotation not found or could not be loaded.
        </div>
      </main>
    );
  }

  const otherStatuses = QUOTATION_STATUSES.filter((s) => s !== quotation.status);

  async function handleStatusChange() {
    if (!pendingStatus) return;
    const confirmed = window.confirm(
      `Change quotation status from "${quotation!.status}" to "${pendingStatus}"?`,
    );
    if (!confirmed) return;
    setActionError(null);
    try {
      await updateStatus.mutateAsync(pendingStatus);
      setPendingStatus('');
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  return (
    <main className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link href="/admin/quotations" className="text-sm text-zinc-500 hover:underline">
        ← Back to Quotations
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 font-mono">
            {quotation.quotationNumber}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Created {fmtDateTime(quotation.createdAt)}
          </p>
        </div>
        <StatusChip status={quotation.status} />
      </div>

      {/* Error banner */}
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* Contact / Customer */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Contact
          </h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500 shrink-0">Name</dt>
              <dd className="text-zinc-800 text-right truncate">{quotation.contact?.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500 shrink-0">Email</dt>
              <dd className="text-zinc-800 text-right truncate">{quotation.contact?.email ?? '—'}</dd>
            </div>
            {quotation.contact?.phoneNumber && (
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500 shrink-0">Phone</dt>
                <dd className="text-zinc-800 text-right">
                  {quotation.contact.isdCode ? `+${quotation.contact.isdCode} ` : ''}
                  {quotation.contact.phoneNumber}
                </dd>
              </div>
            )}
            {quotation.contact?.company && (
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500 shrink-0">Company</dt>
                <dd className="text-zinc-800 text-right truncate">{quotation.contact.company}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Summary */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Summary
          </h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Source</dt>
              <dd className="text-zinc-800 capitalize">{quotation.sourceType ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Subtotal</dt>
              <dd className="text-zinc-800">{inr(quotation.subtotal)}</dd>
            </div>
            {typeof quotation.discountAmount === 'number' && quotation.discountAmount > 0 && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">
                  Discount{quotation.couponCode ? ` (${quotation.couponCode})` : ''}
                </dt>
                <dd className="text-green-700">−{inr(quotation.discountAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-100 pt-1 mt-1 font-semibold">
              <dt className="text-zinc-700">Total</dt>
              <dd className="text-zinc-900">{inr(quotation.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Currency</dt>
              <dd className="text-zinc-800">{quotation.currency ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Downloads</dt>
              <dd className="text-zinc-800">
                {typeof quotation.downloadCount === 'number' ? quotation.downloadCount : '—'}
              </dd>
            </div>
            {quotation.lastDownloadedAt && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Last Downloaded</dt>
                <dd className="text-zinc-800">{fmtDateTime(quotation.lastDownloadedAt)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-zinc-500">Follow-up</dt>
              <dd>
                <StatusChip
                  status={quotation.followUpStatus ?? 'new'}
                  label={quotation.followUpStatus ?? 'new'}
                />
              </dd>
            </div>
          </dl>
          {quotation.pdfUrl && (
            <a
              href={quotation.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
            >
              View PDF ↗
            </a>
          )}
        </section>
      </div>

      {/* Line Items */}
      <section className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Line Items ({Array.isArray(quotation.items) ? quotation.items.length : '—'})
          </h2>
        </div>

        {!Array.isArray(quotation.items) || quotation.items.length === 0 ? (
          <p className="px-5 py-4 text-sm text-zinc-400">No items.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_80px_100px_80px_120px] gap-4 px-5 py-2 bg-zinc-50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Product</span>
              <span className="text-right">MOQ</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Line Total</span>
            </div>
            {quotation.items.map((item) => (
              <div
                key={item.variantId ?? item.sku}
                className="flex flex-col md:grid md:grid-cols-[1fr_80px_100px_80px_120px] gap-2 md:gap-4 items-start md:items-center px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {item.productName ?? '—'}
                  </p>
                  <p className="text-xs text-zinc-500 font-mono">{item.sku ?? '—'}</p>
                  {Array.isArray(item.attributeLabels) && item.attributeLabels.length > 0 && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {item.attributeLabels.join(' / ')}
                    </p>
                  )}
                </div>
                <p className="text-sm text-zinc-600 md:text-right">
                  <span className="md:hidden text-xs text-zinc-400">MOQ: </span>
                  {typeof item.moq === 'number' ? item.moq : '—'}
                </p>
                <p className="text-sm text-zinc-800 md:text-right">
                  <span className="md:hidden text-xs text-zinc-400">Unit: </span>
                  {inr(item.unitPrice)}
                </p>
                <p className="text-sm text-zinc-800 md:text-right">
                  <span className="md:hidden text-xs text-zinc-400">Qty: </span>
                  {typeof item.qty === 'number' ? item.qty : '—'}
                </p>
                <p className="text-sm font-semibold text-zinc-900 md:text-right">
                  {inr(item.lineTotal)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Status update */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Update Status
        </h2>
        <p className="text-sm text-zinc-600">
          Current status:{' '}
          <span className="inline-flex ml-1">
            <StatusChip status={quotation.status} />
          </span>
        </p>

        {otherStatuses.length > 0 ? (
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label htmlFor="quotation-status" className="text-xs text-zinc-500">
                New status
              </label>
              <select
                id="quotation-status"
                value={pendingStatus}
                onChange={(e) => setPendingStatus(e.target.value as QuotationStatus | '')}
                className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                <option value="">— select —</option>
                {otherStatuses.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleStatusChange}
              disabled={!pendingStatus || updateStatus.isPending}
              className="rounded bg-zinc-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {updateStatus.isPending ? 'Updating…' : 'Apply'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">All other statuses are already available.</p>
        )}
      </section>
    </main>
  );
}
