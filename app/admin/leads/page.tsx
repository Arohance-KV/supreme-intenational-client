'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useLeads,
  useUpdateLeadStatus,
  type LeadType,
  type LeadFollowUpStatus,
} from '@/lib/admin/enquiries';
import { StatusChip } from '@/components/admin/StatusChip';
import { ApiError } from '@/lib/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}

const LEAD_TYPES: LeadType[] = ['quotation', 'catalogue'];
const FOLLOW_UP_STATUSES: LeadFollowUpStatus[] = ['new', 'followed_up', 'closed'];

// ── Status updater cell ───────────────────────────────────────────────────────

function LeadStatusCell({
  type,
  refId,
  currentStatus,
}: {
  type: LeadType;
  refId: string;
  currentStatus: LeadFollowUpStatus;
}) {
  const updateLead = useUpdateLeadStatus();
  const [error, setError] = useState<string | null>(null);
  const guardedStatus = FOLLOW_UP_STATUSES.includes(currentStatus as LeadFollowUpStatus)
    ? (currentStatus as LeadFollowUpStatus)
    : 'new';

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as LeadFollowUpStatus;
    const confirmed = window.confirm(
      `Change follow-up status from "${guardedStatus}" to "${next}"?`,
    );
    if (!confirmed) return;
    setError(null);
    try {
      await updateLead.mutateAsync({ type, id: refId, status: next });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={guardedStatus}
        onChange={handleChange}
        disabled={updateLead.isPending}
        onClick={(e) => e.stopPropagation()}
        className="rounded border border-line bg-white px-2 py-1 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
      >
        {FOLLOW_UP_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace('_', ' ')}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Table (needs useSearchParams) ─────────────────────────────────────────────

function LeadsTable() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeParam = searchParams.get('type') as LeadType | null;
  const statusParam = searchParams.get('status') as LeadFollowUpStatus | null;
  const pageParam = Number(searchParams.get('page') ?? '1');
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const { data, isLoading, isError } = useLeads({
    type: typeParam ?? undefined,
    status: statusParam ?? undefined,
    page,
  });

  const leads = data?.items ?? [];
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
    router.push(`/admin/leads?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Type filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate uppercase tracking-wider">
            Type:
          </span>
          <button
            onClick={() => setFilter('type', null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !typeParam
                ? 'bg-indigo text-white'
                : 'bg-white/70 border border-line text-slate hover:bg-white'
            }`}
          >
            All
          </button>
          {LEAD_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter('type', t)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                typeParam === t
                  ? 'bg-indigo text-white'
                  : 'bg-white/70 border border-line text-slate hover:bg-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Follow-up status filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate uppercase tracking-wider">
            Follow-up:
          </span>
          <button
            onClick={() => setFilter('status', null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !statusParam
                ? 'bg-indigo text-white'
                : 'bg-white/70 border border-line text-slate hover:bg-white'
            }`}
          >
            All
          </button>
          {FOLLOW_UP_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter('status', s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusParam === s
                  ? 'bg-indigo text-white'
                  : 'bg-white/70 border border-line text-slate hover:bg-white'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading && (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] divide-y divide-line">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 w-24 rounded bg-black/5" />
              <div className="h-4 w-32 rounded bg-black/5 flex-1" />
              <div className="h-5 w-20 rounded-full bg-black/5" />
              <div className="h-5 w-24 rounded-full bg-black/5" />
              <div className="h-4 w-28 rounded bg-black/5" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load leads. Please try refreshing.
        </div>
      )}

      {!isLoading && !isError && leads.length === 0 && (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] p-10 text-center">
          <p className="text-sm text-slate">No leads found.</p>
        </div>
      )}

      {!isLoading && !isError && leads.length > 0 && (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] divide-y divide-line overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[80px_1fr_180px_140px_160px_160px] gap-4 px-5 py-2 bg-white/50 text-xs font-semibold text-slate uppercase tracking-wider">
            <span>Type</span>
            <span>Contact / Products</span>
            <span>Follow-up Status</span>
            <span>Items</span>
            <span>PDF</span>
            <span>Date</span>
          </div>

          {leads.map((lead) => (
            <div
              key={`${lead.type}-${lead.refId}`}
              className="grid grid-cols-[80px_1fr_180px_140px_160px_160px] gap-4 items-center px-5 py-3"
            >
              {/* Type badge */}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  lead.type === 'quotation'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-violet-100 text-violet-700'
                }`}
              >
                {lead.type}
              </span>

              {/* Contact + products */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">
                  {lead.contact?.name ?? '—'}
                </p>
                <p className="text-xs text-muted truncate">{lead.contact?.email ?? ''}</p>
                {Array.isArray(lead.productNames) && lead.productNames.length > 0 && (
                  <p className="text-xs text-muted truncate mt-0.5">
                    {lead.productNames.slice(0, 3).join(', ')}
                    {lead.productNames.length > 3 ? ` +${lead.productNames.length - 3} more` : ''}
                  </p>
                )}
              </div>

              {/* Follow-up status (inline updater) */}
              <LeadStatusCell
                type={lead.type}
                refId={lead.refId}
                currentStatus={lead.status as LeadFollowUpStatus}
              />

              {/* Item count */}
              <span className="text-sm text-slate">
                {typeof lead.itemCount === 'number' ? `${lead.itemCount} item${lead.itemCount !== 1 ? 's' : ''}` : '—'}
              </span>

              {/* PDF link */}
              <span>
                {lead.pdfUrl ? (
                  <a
                    href={lead.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    View PDF ↗
                  </a>
                ) : (
                  <span className="text-xs text-muted">—</span>
                )}
              </span>

              {/* Date */}
              <span className="text-xs text-muted">{formatDate(lead.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate">
            Page {page} of {pages} · {total.toLocaleString('en-IN')} leads
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setFilter('page', String(page - 1))}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= pages}
              onClick={() => setFilter('page', String(page + 1))}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

export default function AdminLeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Leads</h1>
        <p className="mt-1 text-sm text-slate">
          Merged quotation and catalogue enquiry leads — track and update follow-up status
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] p-8 text-center text-sm text-slate animate-pulse">
            Loading leads…
          </div>
        }
      >
        <LeadsTable />
      </Suspense>
    </div>
  );
}
