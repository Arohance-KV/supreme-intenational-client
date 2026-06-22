'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useQuotations,
  useQuotationAnalytics,
  type QuotationStatus,
} from '@/lib/admin/enquiries';
import { StatusChip } from '@/components/admin/StatusChip';

// ── Helpers ───────────────────────────────────────────────────────────────────

function inr(n: unknown): string {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
}

function formatDate(s: unknown): string {
  if (!s || typeof s !== 'string') return '—';
  try {
    return new Date(s).toLocaleString('en-IN', {
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

const QUOTATION_STATUSES: QuotationStatus[] = [
  'generated',
  'sent',
  'viewed',
  'converted',
  'archived',
];

// ── Analytics cards ────────────────────────────────────────────────────────────

function AnalyticsCards() {
  const { data, isLoading } = useQuotationAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="rounded-xl border border-zinc-200 bg-white p-5 animate-pulse"
          >
            <div className="h-3 w-24 rounded bg-zinc-200 mb-3" />
            <div className="h-8 w-16 rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total Quotations', value: typeof data?.totalQuotations === 'number' ? data.totalQuotations.toLocaleString('en-IN') : '—' },
    { label: 'Total Downloads', value: typeof data?.totalDownloads === 'number' ? data.totalDownloads.toLocaleString('en-IN') : '—' },
    { label: 'Converted', value: typeof data?.converted === 'number' ? data.converted.toLocaleString('en-IN') : '—' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            {c.label}
          </p>
          <p className="text-2xl font-bold text-zinc-900">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Table (needs useSearchParams — wrapped in Suspense) ───────────────────────

function QuotationsTable() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const statusParam = searchParams.get('status') as QuotationStatus | null;
  const pageParam = Number(searchParams.get('page') ?? '1');
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const { data, isLoading, isError } = useQuotations({
    status: statusParam ?? undefined,
    page,
  });

  const quotations = data?.items ?? [];
  const total = data?.total ?? 0;
  const limit = 20;
  const pages = Math.max(1, Math.ceil(total / limit));

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== 'page') params.delete('page');
    router.push(`/admin/quotations?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Status filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mr-1">
          Filter:
        </span>
        <button
          onClick={() => setFilter('status', null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !statusParam
              ? 'bg-zinc-800 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          All
        </button>
        {QUOTATION_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter('status', s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              statusParam === s
                ? 'bg-zinc-800 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading && (
        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 w-32 rounded bg-zinc-200" />
              <div className="h-4 w-40 rounded bg-zinc-200 flex-1" />
              <div className="h-5 w-20 rounded-full bg-zinc-200" />
              <div className="h-4 w-20 rounded bg-zinc-200" />
              <div className="h-4 w-28 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load quotations. Please try refreshing.
        </div>
      )}

      {!isLoading && !isError && quotations.length === 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
          <p className="text-sm text-zinc-500">No quotations found.</p>
        </div>
      )}

      {!isLoading && !isError && quotations.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[160px_1fr_140px_120px_120px_160px] gap-4 px-5 py-2 bg-zinc-50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <span>Quotation #</span>
            <span>Contact</span>
            <span>Status</span>
            <span>Total</span>
            <span>Downloads</span>
            <span>Date</span>
          </div>

          {quotations.map((q) => (
            <Link
              key={q._id}
              href={`/admin/quotations/${q._id}`}
              className="grid grid-cols-[160px_1fr_140px_120px_120px_160px] gap-4 items-center px-5 py-3 hover:bg-zinc-50 transition-colors"
            >
              <span className="font-mono text-xs text-zinc-700 truncate">
                {q.quotationNumber}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-zinc-900 truncate">{q.contact?.name ?? '—'}</p>
                <p className="text-xs text-zinc-400 truncate">{q.contact?.email ?? ''}</p>
                {q.contact?.company && (
                  <p className="text-xs text-zinc-400 truncate">{q.contact.company}</p>
                )}
              </div>
              <div>
                <StatusChip status={q.status} />
              </div>
              <span className="text-sm font-semibold text-zinc-900">
                {inr(q.total)}
              </span>
              <span className="text-sm text-zinc-600 text-center">
                {typeof q.downloadCount === 'number' ? q.downloadCount : '—'}
              </span>
              <span className="text-xs text-zinc-400">
                {formatDate(q.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-zinc-500">
            Page {page} of {pages} · {total.toLocaleString('en-IN')} quotations
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setFilter('page', String(page - 1))}
              className="rounded border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= pages}
              onClick={() => setFilter('page', String(page + 1))}
              className="rounded border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

export default function AdminQuotationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Quotations</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage B2B quotation requests and track status
        </p>
      </div>

      {/* Analytics summary */}
      <AnalyticsCards />

      <Suspense
        fallback={
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 animate-pulse">
            Loading quotations…
          </div>
        }
      >
        <QuotationsTable />
      </Suspense>
    </div>
  );
}
