'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import {
  useQuotation,
  useUpdateQuotationStatus,
  useApproveQuotation,
  useSaveQuotationDraft,
  useSubmitQuotationForApproval,
  type QuotationStatus,
} from '@/lib/admin/enquiries';
import { useAdminProfile } from '@/lib/admin/userAuth';
import { StatusChip } from '@/components/admin/StatusChip';
import { inr, fmtDateTime } from '@/lib/admin/format';
import { useConfirm } from '@/components/ConfirmDialog';

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
  const { confirm } = useConfirm();
  const { data: quotation, isLoading, isError } = useQuotation(id);
  const { data: me } = useAdminProfile();
  const updateStatus = useUpdateQuotationStatus(id);
  const approve = useApproveQuotation(id);
  const saveDraft = useSaveQuotationDraft(id);
  const submitApproval = useSubmitQuotationForApproval(id);
  // Backend team can edit + save the T&C/prices but never approve — that's sales-only.
  // Instead they submit for approval, routing the quote to the Approvals tab / queue.
  const canApprove = me?.role !== 'backend';

  const [pendingStatus, setPendingStatus] = useState<QuotationStatus | ''>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [terms, setTerms] = useState<string | null>(null);
  // Per-line price/qty edits, keyed by variantId; only populated once the admin touches a field.
  const [edits, setEdits] = useState<Record<string, { unitPrice: number; qty: number }>>({});

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto space-y-6">
        <div className="h-7 w-48 rounded bg-black/5 animate-pulse" />
        <div className="rounded-[20px] border border-white/80 bg-white/90 shadow-[0_10px_30px_rgba(34,36,90,.07)] p-6 space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="h-4 w-full rounded bg-black/5" />
          ))}
        </div>
      </main>
    );
  }

  if (isError || !quotation) {
    return (
      <main className="max-w-4xl mx-auto space-y-4">
        <Link href="/admin/quotations" className="text-sm text-slate hover:underline">
          ← Back to Quotations
        </Link>
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Quotation not found or could not be loaded.
        </div>
      </main>
    );
  }

  const otherStatuses = QUOTATION_STATUSES.filter((s) => s !== quotation.status);
  const termsValue = terms ?? quotation?.terms ?? '';
  const editable = quotation.status === 'pending_approval';

  // Effective price/qty for a line = edited value if present, else the stored value.
  const lineOf = (it: { variantId: string; unitPrice: number; qty: number }) =>
    edits[it.variantId] ?? { unitPrice: it.unitPrice, qty: it.qty };
  const setLine = (variantId: string, patch: Partial<{ unitPrice: number; qty: number }>) =>
    setEdits((prev) => {
      const base = prev[variantId] ??
        (() => {
          const it = quotation!.items.find((i) => i.variantId === variantId)!;
          return { unitPrice: it.unitPrice, qty: it.qty };
        })();
      return { ...prev, [variantId]: { ...base, ...patch } };
    });

  async function handleApprove() {
    const confirmed = await confirm({
      title: 'Approve & send quotation',
      message: 'This will generate the PDF with the terms and prices below, then email it to the customer. Continue?',
    });
    if (!confirmed) return;
    setActionError(null);
    try {
      await approve.mutateAsync({ terms: termsValue, items: editedItems() });
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  // Snapshot of edited line items (undefined when nothing was touched).
  function editedItems() {
    return Object.keys(edits).length
      ? quotation!.items.map((it) => ({ variantId: it.variantId, ...lineOf(it) }))
      : undefined;
  }

  async function handleSaveDraft() {
    setActionError(null);
    try {
      await saveDraft.mutateAsync({ terms: termsValue, items: editedItems() });
      setEdits({});
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleSubmitForApproval() {
    const confirmed = await confirm({
      title: 'Send for approval',
      message: 'This saves your edits and sends the quotation to Super Admin / Sales for approval. Continue?',
    });
    if (!confirmed) return;
    setActionError(null);
    try {
      await submitApproval.mutateAsync({ terms: termsValue, items: editedItems() });
      setEdits({});
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleStatusChange() {
    if (!pendingStatus) return;
    const confirmed = await confirm({
      title: 'Update status',
      message: `Change quotation status from "${quotation!.status}" to "${pendingStatus}"?`,
    });
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
      <Link href="/admin/quotations" className="text-sm text-slate hover:underline">
        ← Back to Quotations
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink font-jbmono">
            {quotation.quotationNumber}
          </h1>
          <p className="mt-0.5 text-sm text-slate">
            Created {fmtDateTime(quotation.createdAt)}
          </p>
        </div>
        <StatusChip status={quotation.status} />
      </div>

      {/* Error banner */}
      {actionError && (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* Contact / Customer */}
        <section className="rounded-[20px] border border-white/80 bg-white/90 shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">
            Contact
          </h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-slate shrink-0">Name</dt>
              <dd className="text-ink text-right truncate">{quotation.contact?.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate shrink-0">Email</dt>
              <dd className="text-ink text-right truncate">{quotation.contact?.email ?? '—'}</dd>
            </div>
            {quotation.contact?.phoneNumber && (
              <div className="flex justify-between gap-2">
                <dt className="text-slate shrink-0">Phone</dt>
                <dd className="text-ink text-right">
                  {quotation.contact.isdCode ? `+${quotation.contact.isdCode} ` : ''}
                  {quotation.contact.phoneNumber}
                </dd>
              </div>
            )}
            {quotation.contact?.company && (
              <div className="flex justify-between gap-2">
                <dt className="text-slate shrink-0">Company</dt>
                <dd className="text-ink text-right truncate">{quotation.contact.company}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Notes & branding requirements (customer-submitted) */}
        {quotation.customerNotes && (
          <section className="rounded-[20px] border border-white/80 bg-white/90 shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">Notes &amp; branding requirements</h2>
            <p className="whitespace-pre-wrap text-sm text-ink">{quotation.customerNotes}</p>
          </section>
        )}

        {/* Summary */}
        <section className="rounded-[20px] border border-white/80 bg-white/90 shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">
            Summary
          </h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate">Source</dt>
              <dd className="text-ink capitalize">{quotation.sourceType ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate">Subtotal</dt>
              <dd className="text-ink">{inr(quotation.subtotal)}</dd>
            </div>
            {typeof quotation.discountAmount === 'number' && quotation.discountAmount > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate">
                  Discount{quotation.couponCode ? ` (${quotation.couponCode})` : ''}
                </dt>
                <dd className="text-green-700">−{inr(quotation.discountAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-1 mt-1 font-semibold">
              <dt className="text-slate">Total</dt>
              <dd className="text-ink">{inr(quotation.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate">Currency</dt>
              <dd className="text-ink">{quotation.currency ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate">Downloads</dt>
              <dd className="text-ink">
                {typeof quotation.downloadCount === 'number' ? quotation.downloadCount : '—'}
              </dd>
            </div>
            {quotation.lastDownloadedAt && (
              <div className="flex justify-between">
                <dt className="text-slate">Last Downloaded</dt>
                <dd className="text-ink">{fmtDateTime(quotation.lastDownloadedAt)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate">Follow-up</dt>
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
      <section className="rounded-[20px] border border-white/80 bg-white/90 shadow-[0_10px_30px_rgba(34,36,90,.07)] overflow-hidden">
        <div className="px-5 py-3 bg-white/50 border-b border-line">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate">
            Line Items ({Array.isArray(quotation.items) ? quotation.items.length : '—'})
          </h2>
        </div>

        {!Array.isArray(quotation.items) || quotation.items.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted">No items.</p>
        ) : (
          <div className="divide-y divide-line">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_80px_100px_80px_120px] gap-4 px-5 py-2 bg-white/50 text-xs font-semibold text-slate uppercase tracking-wider">
              <span>Product</span>
              <span className="text-right">MOQ</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Line Total</span>
            </div>
            {quotation.items.map((item) => {
              const line = lineOf(item);
              const lineTotal = editable ? line.unitPrice * line.qty : item.lineTotal;
              return (
              <div
                key={item.variantId ?? item.sku}
                className="flex flex-col md:grid md:grid-cols-[1fr_80px_100px_80px_120px] gap-2 md:gap-4 items-start md:items-center px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {item.productName ?? '—'}
                  </p>
                  <p className="text-xs text-slate font-jbmono">{item.sku ?? '—'}</p>
                  {Array.isArray(item.attributeLabels) && item.attributeLabels.length > 0 && (
                    <p className="text-xs text-muted mt-0.5">
                      {item.attributeLabels.join(' / ')}
                    </p>
                  )}
                </div>
                <p className="text-sm text-slate md:text-right">
                  <span className="md:hidden text-xs text-muted">MOQ: </span>
                  {typeof item.moq === 'number' ? item.moq : '—'}
                </p>
                {editable ? (
                  <label className="flex items-center gap-1 md:justify-end">
                    <span className="md:hidden text-xs text-muted">Unit: </span>
                    <input
                      type="number" min={0} step="0.01" value={line.unitPrice}
                      onChange={(e) => setLine(item.variantId, { unitPrice: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-24 rounded border border-line bg-white px-2 py-1 text-sm text-ink text-right focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>
                ) : (
                  <p className="text-sm text-ink md:text-right">
                    <span className="md:hidden text-xs text-muted">Unit: </span>
                    {inr(item.unitPrice)}
                  </p>
                )}
                {editable ? (
                  <label className="flex items-center gap-1 md:justify-end">
                    <span className="md:hidden text-xs text-muted">Qty: </span>
                    <input
                      type="number" min={1} step="1" value={line.qty}
                      onChange={(e) => setLine(item.variantId, { qty: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                      className="w-20 rounded border border-line bg-white px-2 py-1 text-sm text-ink text-right focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>
                ) : (
                  <p className="text-sm text-ink md:text-right">
                    <span className="md:hidden text-xs text-muted">Qty: </span>
                    {typeof item.qty === 'number' ? item.qty : '—'}
                  </p>
                )}
                <p className="text-sm font-semibold text-ink md:text-right">
                  {inr(lineTotal)}
                </p>
              </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Terms & Conditions (pending approval only) */}
      {quotation.status === 'pending_approval' && (
        <section className="rounded-[20px] border border-white/80 bg-white/90 shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate">Terms &amp; Conditions</h2>
          <p className="text-sm text-slate">
            {canApprove
              ? 'Adjust line-item prices and quantities above and edit the terms below. Save to stage changes, or approve to generate the PDF (with GST recomputed) and email it to the customer.'
              : 'Adjust line-item prices and quantities above and edit the terms below. Save to stage changes, or send for approval to route it to Super Admin / Sales.'}
          </p>
          {quotation.submittedForApprovalAt && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              Submitted for approval on {fmtDateTime(quotation.submittedForApprovalAt)}, awaiting Super Admin / Sales review.
            </div>
          )}
          <textarea
            value={termsValue}
            onChange={(e) => setTerms(e.target.value)}
            rows={8}
            className="w-full rounded border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saveDraft.isPending || approve.isPending || submitApproval.isPending}
              className="rounded border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-black/[.03] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saveDraft.isPending ? 'Saving…' : 'Save changes'}
            </button>
            {canApprove ? (
              <button
                onClick={handleApprove}
                disabled={approve.isPending || saveDraft.isPending}
                className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {approve.isPending ? 'Approving…' : 'Approve & send'}
              </button>
            ) : (
              <button
                onClick={handleSubmitForApproval}
                disabled={submitApproval.isPending || saveDraft.isPending}
                className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitApproval.isPending ? 'Sending…' : quotation.submittedForApprovalAt ? 'Re-send for approval' : 'Send for approval'}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Status update */}
      <section className="rounded-[20px] border border-white/80 bg-white/90 shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate">
          Update Status
        </h2>
        <p className="text-sm text-slate">
          Current status:{' '}
          <span className="inline-flex ml-1">
            <StatusChip status={quotation.status} />
          </span>
        </p>

        {otherStatuses.length > 0 ? (
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label htmlFor="quotation-status" className="text-xs text-slate">
                New status
              </label>
              <select
                id="quotation-status"
                value={pendingStatus}
                onChange={(e) => setPendingStatus(e.target.value as QuotationStatus | '')}
                className="rounded border border-line bg-white px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="">select</option>
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
              className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {updateStatus.isPending ? 'Updating…' : 'Apply'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted">All other statuses are already available.</p>
        )}
      </section>
    </main>
  );
}
