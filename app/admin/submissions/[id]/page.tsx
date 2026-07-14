'use client';

import { use, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { StatusChip } from '@/components/admin/StatusChip';
import {
  useSubmission,
  useApproveSubmission,
  useRejectSubmission,
  useAttributeReview,
  useResolveAttribute,
  type AdminSubmission,
  type DraftVariant,
  type AttributeReviewItem,
} from '@/lib/admin/submissions';
import { useAttributes, type AdminAttribute } from '@/lib/admin/taxonomy';
import { inr, fmtDate, fmtDateTime } from '@/lib/admin/format';
import { useConfirm } from '@/components/ConfirmDialog';

const sectionCls = 'rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] p-5';
const labelCls = 'mb-1 block text-sm font-medium text-slate';
const inputCls =
  'w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-line';

// ── VariantsTable ─────────────────────────────────────────────────────────────

function VariantsTable({ variants }: { variants: DraftVariant[] }) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return <p className="text-sm text-slate">No variants.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-line text-xs uppercase text-slate">
            <th className="px-3 py-2 font-medium">SKU</th>
            <th className="px-3 py-2 font-medium text-right">Price</th>
            <th className="px-3 py-2 font-medium text-right">Orig. price</th>
            <th className="px-3 py-2 font-medium text-right">Stock</th>
            <th className="px-3 py-2 font-medium text-right">MOQ</th>
            <th className="px-3 py-2 font-medium">Attributes</th>
            <th className="px-3 py-2 font-medium">Images</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v, i) => (
            <tr key={v.sku || `variant-${i}`} className="border-b border-line hover:bg-white/50">
              <td className="px-3 py-2 font-mono text-xs text-slate">{v.sku ?? '—'}</td>
              <td className="px-3 py-2 text-right">{inr(v.price)}</td>
              <td className="px-3 py-2 text-right text-slate">{inr(v.originalPrice)}</td>
              <td className="px-3 py-2 text-right">
                {typeof v.stock === 'number' ? v.stock.toLocaleString('en-IN') : '—'}
              </td>
              <td className="px-3 py-2 text-right">
                {typeof v.moq === 'number' ? v.moq.toLocaleString('en-IN') : '—'}
              </td>
              <td className="px-3 py-2">
                {Array.isArray(v.attributes) && v.attributes.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {v.attributes.map((a, ai) => (
                      <span
                        key={ai}
                        className="rounded bg-black/5 px-1.5 py-0.5 text-xs text-slate"
                      >
                        {a.name}: {a.value}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted text-xs">—</span>
                )}
              </td>
              <td className="px-3 py-2">
                {Array.isArray(v.images) && v.images.length > 0 ? (
                  <div className="flex gap-1">
                    {v.images.slice(0, 3).map((src, ii) => (
                      <a
                        key={ii}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-8 w-8 overflow-hidden rounded border border-line bg-black/5 hover:opacity-80"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Variant ${i + 1} image ${ii + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ))}
                    {v.images.length > 3 && (
                      <span className="text-xs text-muted self-center">
                        +{v.images.length - 3}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Attribute taxonomy review (propose → admin promotes) ──────────────────────

const selectCls = 'rounded-[9px] border border-line bg-white/80 px-2 py-1.5 text-xs text-ink outline-none focus:border-accent';

function ResolveRow({
  id,
  item,
  attributes,
}: {
  id: string;
  item: AttributeReviewItem;
  attributes: AdminAttribute[];
}) {
  const resolve = useResolveAttribute(id);
  const [attrId, setAttrId] = useState('');
  const [valId, setValId] = useState('');
  const attr = attributes.find((a) => a._id === attrId);
  const resolved = item.attributeExists && item.valueExists;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white/60 px-3 py-2.5 text-sm">
      <span className="font-semibold text-ink">{item.name}: {item.value}</span>
      {resolved ? (
        <span className="text-xs font-semibold text-[#1a8f5a]">✓ In catalog</span>
      ) : (
        <>
          <span className="text-xs font-semibold text-[#b5801e]">⚠ Not in catalog</span>
          <span className="ml-auto flex flex-wrap items-center gap-2">
            <button
              onClick={() => resolve.mutate({ action: 'add', name: item.name, value: item.value })}
              disabled={resolve.isPending}
              className="rounded-[9px] bg-[rgba(42,43,106,.07)] px-3 py-1.5 text-[11px] font-semibold text-indigo hover:bg-[rgba(42,43,106,.12)] disabled:opacity-50"
            >
              + Add to catalog
            </button>
            <span className="text-[11px] text-muted">or map to</span>
            <select value={attrId} onChange={(e) => { setAttrId(e.target.value); setValId(''); }} className={selectCls}>
              <option value="">Attribute…</option>
              {attributes.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
            <select value={valId} onChange={(e) => setValId(e.target.value)} disabled={!attr} className={selectCls}>
              <option value="">Value…</option>
              {attr?.values.map((v) => <option key={v._id} value={v._id}>{v.label}</option>)}
            </select>
            <button
              disabled={!attrId || !valId || resolve.isPending}
              onClick={() => resolve.mutate({ action: 'map', name: item.name, value: item.value, mapAttributeId: attrId, mapValueId: valId })}
              className="rounded-[9px] bg-accent px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50"
            >
              Map
            </button>
          </span>
        </>
      )}
    </div>
  );
}

function AttributeReviewPanel({ id }: { id: string }) {
  const { data, isLoading } = useAttributeReview(id);
  const { data: attributes } = useAttributes();

  const items = data?.items ?? [];
  if (isLoading) {
    return <section className={sectionCls}><div className="h-6 w-56 animate-pulse rounded bg-black/5" /></section>;
  }
  if (!items.length) return null;

  return (
    <section className={sectionCls}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Attribute taxonomy review</h2>
        {data?.allResolved
          ? <span className="rounded-full bg-[rgba(31,170,107,.12)] px-2.5 py-0.5 text-[11px] font-semibold text-[#1a8f5a]">All resolved</span>
          : <span className="rounded-full bg-[rgba(224,163,59,.16)] px-2.5 py-0.5 text-[11px] font-semibold text-[#b5801e]">Needs review</span>}
      </div>
      <p className="mb-3 text-xs text-slate">
        Every attribute must map to the global catalog before approval. <strong>Add to catalog</strong> promotes the seller&apos;s exact name/value; <strong>Map</strong> points it at an existing attribute (fixes typos/synonyms).
      </p>
      <div className="space-y-2">
        {items.map((it, i) => <ResolveRow key={`${it.name}:${it.value}:${i}`} id={id} item={it} attributes={attributes ?? []} />)}
      </div>
    </section>
  );
}

// ── ModeratePanel ─────────────────────────────────────────────────────────────

function ModeratePanel({ submission }: { submission: AdminSubmission }) {
  const { confirm } = useConfirm();
  const approve = useApproveSubmission(submission._id);
  const reject = useRejectSubmission(submission._id);
  const review = useAttributeReview(submission._id, submission.status === 'submitted');
  const attrsBlocked = submission.status === 'submitted' && review.data ? !review.data.allResolved : false;

  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  // Auto-clear success state after 4s
  useEffect(() => {
    if (approve.isSuccess) {
      const t = setTimeout(() => approve.reset(), 4000);
      return () => clearTimeout(t);
    }
  }, [approve.isSuccess]);

  useEffect(() => {
    if (reject.isSuccess) {
      const t = setTimeout(() => reject.reset(), 4000);
      return () => clearTimeout(t);
    }
  }, [reject.isSuccess]);

  if (submission.status !== 'submitted') {
    return (
      <section className={sectionCls}>
        <h2 className="mb-3 text-base font-semibold text-ink">Moderation</h2>
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status={submission.status} label={submission.status} />
          {submission.status === 'rejected' && submission.rejectionReason && (
            <span className="text-sm text-slate italic">
              Reason: {submission.rejectionReason}
            </span>
          )}
          {submission.status === 'approved' && submission.createdProductId && (
            <div className="mt-1 text-sm text-slate">
              Product created (ID:{' '}
              <span className="font-mono text-xs">{submission.createdProductId}</span>
              ).{' '}
              <Link
                href="/admin/catalog/products"
                className="text-blue-600 hover:underline"
              >
                Browse catalogue
              </Link>
            </div>
          )}
          {submission.reviewedAt && (
            <span className="text-xs text-muted">
              Reviewed {fmtDateTime(submission.reviewedAt)}
            </span>
          )}
        </div>
      </section>
    );
  }

  async function handleApprove() {
    if (!(await confirm({ message: 'Approve this submission and create the product in the catalogue?' }))) return;
    approve.mutate();
  }

  function handleReject(e: React.FormEvent) {
    e.preventDefault();
    setReasonError('');
    if (!reason.trim()) {
      setReasonError('A rejection reason is required.');
      return;
    }
    reject.mutate({ reason: reason.trim() });
  }

  const isPending = approve.isPending || reject.isPending;

  return (
    <section className={sectionCls}>
      <h2 className="mb-4 text-base font-semibold text-ink">Moderation</h2>

      {/* Approve */}
      <div className="mb-6">
        <p className="text-sm text-slate mb-3">
          Approving will create the product in the public catalogue from this submission.
        </p>
        <button
          onClick={handleApprove}
          disabled={isPending || attrsBlocked}
          title={attrsBlocked ? 'Resolve all attributes in the taxonomy review above first' : undefined}
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-green-800 transition-colors"
        >
          {approve.isPending ? 'Approving…' : 'Approve submission'}
        </button>
        {attrsBlocked && (
          <p className="mt-2 text-sm text-[#b5801e]">Resolve every attribute in the taxonomy review above before approving.</p>
        )}

        {approve.isSuccess && (
          <p className="mt-2 text-sm text-green-700">
            Submission approved.
            {approve.data?.createdProductId && (
              <>
                {' '}Product created (ID:{' '}
                <span className="font-mono text-xs">{approve.data.createdProductId}</span>
                ).{' '}
                <Link
                  href="/admin/catalog/products"
                  className="underline hover:text-green-900"
                >
                  Browse catalogue
                </Link>
              </>
            )}
          </p>
        )}

        {approve.error && (
          <p className="mt-2 text-sm text-red-600">
            {approve.error instanceof ApiError
              ? approve.error.message
              : 'Approval failed. Please try again.'}
          </p>
        )}
      </div>

      <hr className="border-line mb-6" />

      {/* Reject */}
      <form onSubmit={handleReject} className="space-y-3">
        <div>
          <label className={labelCls}>
            Rejection reason <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (reasonError) setReasonError('');
            }}
            placeholder="Explain why this submission is being rejected…"
            className={inputCls}
          />
          {reasonError && (
            <p className="mt-1 text-xs text-red-600">{reasonError}</p>
          )}
        </div>

        {reject.error && (
          <p className="text-sm text-red-600">
            {reject.error instanceof ApiError
              ? reject.error.message
              : 'Rejection failed. Please try again.'}
          </p>
        )}

        {reject.isSuccess && (
          <p className="text-sm text-red-700">Submission rejected.</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-red-800 transition-colors"
        >
          {reject.isPending ? 'Rejecting…' : 'Reject submission'}
        </button>
      </form>
    </section>
  );
}

// ── SubmissionDetail inner ────────────────────────────────────────────────────

function SubmissionDetailInner({ id }: { id: string }) {
  const { data: submission, isLoading, error } = useSubmission(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-black/5" />
        <div className="h-48 animate-pulse rounded-xl bg-black/5" />
        <div className="h-32 animate-pulse rounded-xl bg-black/5" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error instanceof ApiError ? error.message : 'Failed to load submission.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate">
        <Link href="/admin/submissions" className="hover:underline">
          Submissions
        </Link>
        <span>/</span>
        <span className="text-ink font-medium truncate">{submission.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{submission.name}</h1>
          <p className="mt-1 text-xs text-muted font-mono">{submission._id}</p>
          <p className="mt-1 text-xs text-slate">
            Submitted {fmtDate(submission.createdAt)}
          </p>
        </div>
        <div className="shrink-0">
          <StatusChip status={submission.status} label={submission.status} />
        </div>
      </div>

      {/* Attribute taxonomy review (only while awaiting moderation) */}
      {submission.status === 'submitted' && <AttributeReviewPanel id={submission._id} />}

      {/* Moderation panel */}
      <ModeratePanel submission={submission} />

      {/* Product details */}
      <section className={sectionCls}>
        <h2 className="mb-4 text-base font-semibold text-ink">Product details</h2>
        <dl className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 gap-x-6">
          <div>
            <dt className="text-xs font-medium text-slate uppercase tracking-wider">Category ID</dt>
            <dd className="mt-0.5 text-sm text-ink font-mono">
              {submission.categoryId ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate uppercase tracking-wider">Seller ID</dt>
            <dd className="mt-0.5 text-sm text-ink font-mono">
              {submission.sellerId ?? '—'}
            </dd>
          </div>
          {submission.badge && (
            <div>
              <dt className="text-xs font-medium text-slate uppercase tracking-wider">Badge</dt>
              <dd className="mt-0.5 text-sm text-ink">
                {submission.badge.label}{' '}
                <span className="text-xs text-muted">({submission.badge.variant})</span>
              </dd>
            </div>
          )}
        </dl>

        {submission.description && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate mb-1">Description</p>
            <p className="text-sm text-slate whitespace-pre-wrap">{submission.description}</p>
          </div>
        )}
        {submission.details && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate mb-1">Details</p>
            <p className="text-sm text-slate whitespace-pre-wrap">{submission.details}</p>
          </div>
        )}
        {submission.materials && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate mb-1">Materials</p>
            <p className="text-sm text-slate whitespace-pre-wrap">{submission.materials}</p>
          </div>
        )}
        {submission.shipping && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate mb-1">Shipping</p>
            <p className="text-sm text-slate whitespace-pre-wrap">{submission.shipping}</p>
          </div>
        )}
      </section>

      {/* Images */}
      {Array.isArray(submission.images) && submission.images.length > 0 && (
        <section className={sectionCls}>
          <h2 className="mb-4 text-base font-semibold text-ink">
            Product images ({submission.images.length})
          </h2>
          <div className="flex flex-wrap gap-3">
            {submission.images.map((src, i) => (
              <a
                key={i}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-24 w-24 overflow-hidden rounded-lg border border-line bg-black/5 hover:opacity-80 transition-opacity"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Product image ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Variants */}
      <section className={sectionCls}>
        <h2 className="mb-4 text-base font-semibold text-ink">
          Variants ({Array.isArray(submission.variants) ? submission.variants.length : 0})
        </h2>
        <VariantsTable variants={submission.variants} />
      </section>

      {/* Rejection reason (if rejected) */}
      {submission.status === 'rejected' && submission.rejectionReason && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="mb-2 text-sm font-semibold text-red-800">Rejection reason</h2>
          <p className="text-sm text-red-700">{submission.rejectionReason}</p>
          {submission.reviewedAt && (
            <p className="mt-1 text-xs text-red-500">
              Reviewed {fmtDateTime(submission.reviewedAt)}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded bg-black/5" />
          <div className="h-48 animate-pulse rounded-xl bg-black/5" />
          <div className="h-32 animate-pulse rounded-xl bg-black/5" />
        </div>
      }
    >
      <SubmissionDetailInner id={id} />
    </Suspense>
  );
}
