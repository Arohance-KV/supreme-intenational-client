'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { useSubmissions, type AdminSubmission, type SubmissionStatus } from '@/lib/admin/submissions';
import { StatusChip } from '@/components/admin/StatusChip';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
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

// ── Submission row ────────────────────────────────────────────────────────────

function SubmissionRow({ submission }: { submission: AdminSubmission }) {
  const minPrice = submission.variants.length > 0
    ? Math.min(
        ...submission.variants
          .map((v) => (typeof v.price === 'number' ? v.price : Infinity))
          .filter((p) => isFinite(p)),
      )
    : null;

  return (
    <div className="grid grid-cols-[1fr_140px_80px_120px_100px_72px] items-center gap-3 border-b border-zinc-100 px-5 py-3 hover:bg-zinc-50 transition-colors">
      <div className="min-w-0">
        <Link
          href={`/admin/submissions/${submission._id}`}
          className="text-sm font-medium text-zinc-900 hover:underline truncate block"
        >
          {submission.name}
        </Link>
        <span className="text-xs text-zinc-400 font-mono truncate block">
          {submission._id}
        </span>
      </div>
      <span className="text-xs text-zinc-500 truncate">
        {typeof submission.sellerId === 'string' ? submission.sellerId : '—'}
      </span>
      <span className="text-xs text-zinc-500">
        {submission.variants.length}
      </span>
      <span className="text-xs text-zinc-500">
        {minPrice !== null ? `₹${minPrice.toLocaleString('en-IN')}` : '—'}
      </span>
      <StatusChip status={submission.status} label={submission.status} />
      <span className="text-xs text-zinc-400">{fmtDate(submission.createdAt)}</span>
    </div>
  );
}

// ── Inner table ───────────────────────────────────────────────────────────────

function SubmissionsTable() {
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | ''>('submitted');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useSubmissions({
    status: statusFilter || undefined,
    page,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as SubmissionStatus | '');
            setPage(1);
          }}
          className="rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
        >
          <option value="">All statuses</option>
          <option value="submitted">Submitted</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 w-48 rounded bg-zinc-200" />
              <div className="h-4 w-32 rounded bg-zinc-200" />
              <div className="h-4 w-24 rounded bg-zinc-200" />
              <div className="h-5 w-16 rounded-full bg-zinc-200" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : 'Failed to load submissions.'}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
          <p className="text-sm text-zinc-500">No submissions found.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="grid grid-cols-[1fr_140px_80px_120px_100px_72px] gap-3 bg-zinc-50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <span>Submission</span>
            <span>Seller ID</span>
            <span>Variants</span>
            <span>Min price</span>
            <span>Status</span>
            <span>Created</span>
          </div>
          {items.map((s) => (
            <SubmissionRow key={s._id} submission={s} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>
            Page {pagination.page} of {pagination.pages} ({pagination.total.toLocaleString()} total)
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-zinc-200 px-3 py-1 hover:bg-zinc-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-zinc-200 px-3 py-1 hover:bg-zinc-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSubmissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Seller Submissions</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Review and moderate seller product submissions — approve or reject with a reason
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 animate-pulse">
            Loading submissions…
          </div>
        }
      >
        <SubmissionsTable />
      </Suspense>
    </div>
  );
}
