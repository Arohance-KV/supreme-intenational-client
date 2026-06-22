'use client';

import { use, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { StatusChip } from '@/components/admin/StatusChip';
import {
  useSubmission,
  useApproveSubmission,
  useRejectSubmission,
  type AdminSubmission,
  type DraftVariant,
} from '@/lib/admin/submissions';

// ── Helpers ───────────────────────────────────────────────────────────────────

function inr(n: unknown): string {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
}

function fmtDate(iso: unknown): string {
  if (!iso || typeof iso !== 'string') return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function fmtDateTime(iso: unknown): string {
  if (!iso || typeof iso !== 'string') return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

const sectionCls = 'rounded-xl border border-zinc-200 bg-white p-5';
const labelCls = 'mb-1 block text-sm font-medium text-zinc-700';
const inputCls =
  'w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400';

// ── VariantsTable ─────────────────────────────────────────────────────────────

function VariantsTable({ variants }: { variants: DraftVariant[] }) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return <p className="text-sm text-zinc-500">No variants.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
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
            <tr key={v.sku || `variant-${i}`} className="border-b border-zinc-100 hover:bg-zinc-50">
              <td className="px-3 py-2 font-mono text-xs text-zinc-700">{v.sku ?? '—'}</td>
              <td className="px-3 py-2 text-right">{inr(v.price)}</td>
              <td className="px-3 py-2 text-right text-zinc-500">{inr(v.originalPrice)}</td>
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
                        className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600"
                      >
                        {a.name}: {a.value}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-zinc-400 text-xs">—</span>
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
                        className="block h-8 w-8 overflow-hidden rounded border border-zinc-200 bg-zinc-100 hover:opacity-80"
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
                      <span className="text-xs text-zinc-400 self-center">
                        +{v.images.length - 3}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-zinc-400 text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── ModeratePanel ─────────────────────────────────────────────────────────────

function ModeratePanel({ submission }: { submission: AdminSubmission }) {
  const approve = useApproveSubmission(submission._id);
  const reject = useRejectSubmission(submission._id);

  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  // Auto-clear success state after 4s
  useEffect(() => {
    if (approve.isSuccess) {
      const t = setTimeout(() => approve.reset(), 4000);
      return () => clearTimeout(t);
    }
  }, [approve.isSuccess, approve]);

  useEffect(() => {
    if (reject.isSuccess) {
      const t = setTimeout(() => reject.reset(), 4000);
      return () => clearTimeout(t);
    }
  }, [reject.isSuccess, reject]);

  if (submission.status !== 'submitted') {
    return (
      <section className={sectionCls}>
        <h2 className="mb-3 text-base font-semibold text-zinc-800">Moderation</h2>
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status={submission.status} label={submission.status} />
          {submission.status === 'rejected' && submission.rejectionReason && (
            <span className="text-sm text-zinc-600 italic">
              Reason: {submission.rejectionReason}
            </span>
          )}
          {submission.status === 'approved' && submission.createdProductId && (
            <div className="mt-1 text-sm text-zinc-600">
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
            <span className="text-xs text-zinc-400">
              Reviewed {fmtDateTime(submission.reviewedAt)}
            </span>
          )}
        </div>
      </section>
    );
  }

  function handleApprove() {
    if (!confirm('Approve this submission and create the product in the catalogue?')) return;
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
      <h2 className="mb-4 text-base font-semibold text-zinc-800">Moderation</h2>

      {/* Approve */}
      <div className="mb-6">
        <p className="text-sm text-zinc-600 mb-3">
          Approving will create the product in the public catalogue from this submission.
        </p>
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-green-800 transition-colors"
        >
          {approve.isPending ? 'Approving…' : 'Approve submission'}
        </button>

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

      <hr className="border-zinc-200 mb-6" />

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
        <div className="h-8 w-64 animate-pulse rounded bg-zinc-200" />
        <div className="h-48 animate-pulse rounded-xl bg-zinc-100" />
        <div className="h-32 animate-pulse rounded-xl bg-zinc-100" />
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
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/admin/submissions" className="hover:underline">
          Submissions
        </Link>
        <span>/</span>
        <span className="text-zinc-800 font-medium truncate">{submission.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{submission.name}</h1>
          <p className="mt-1 text-xs text-zinc-400 font-mono">{submission._id}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Submitted {fmtDate(submission.createdAt)}
          </p>
        </div>
        <div className="shrink-0">
          <StatusChip status={submission.status} label={submission.status} />
        </div>
      </div>

      {/* Moderation panel */}
      <ModeratePanel submission={submission} />

      {/* Product details */}
      <section className={sectionCls}>
        <h2 className="mb-4 text-base font-semibold text-zinc-800">Product details</h2>
        <dl className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 gap-x-6">
          <div>
            <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Category ID</dt>
            <dd className="mt-0.5 text-sm text-zinc-800 font-mono">
              {submission.categoryId ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Seller ID</dt>
            <dd className="mt-0.5 text-sm text-zinc-800 font-mono">
              {submission.sellerId ?? '—'}
            </dd>
          </div>
          {submission.badge && (
            <div>
              <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Badge</dt>
              <dd className="mt-0.5 text-sm text-zinc-800">
                {submission.badge.label}{' '}
                <span className="text-xs text-zinc-400">({submission.badge.variant})</span>
              </dd>
            </div>
          )}
        </dl>

        {submission.description && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">Description</p>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{submission.description}</p>
          </div>
        )}
        {submission.details && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">Details</p>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{submission.details}</p>
          </div>
        )}
        {submission.materials && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">Materials</p>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{submission.materials}</p>
          </div>
        )}
        {submission.shipping && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">Shipping</p>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{submission.shipping}</p>
          </div>
        )}
      </section>

      {/* Images */}
      {Array.isArray(submission.images) && submission.images.length > 0 && (
        <section className={sectionCls}>
          <h2 className="mb-4 text-base font-semibold text-zinc-800">
            Product images ({submission.images.length})
          </h2>
          <div className="flex flex-wrap gap-3">
            {submission.images.map((src, i) => (
              <a
                key={i}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-24 w-24 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 hover:opacity-80 transition-opacity"
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
        <h2 className="mb-4 text-base font-semibold text-zinc-800">
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
          <div className="h-8 w-64 animate-pulse rounded bg-zinc-200" />
          <div className="h-48 animate-pulse rounded-xl bg-zinc-100" />
          <div className="h-32 animate-pulse rounded-xl bg-zinc-100" />
        </div>
      }
    >
      <SubmissionDetailInner id={id} />
    </Suspense>
  );
}
