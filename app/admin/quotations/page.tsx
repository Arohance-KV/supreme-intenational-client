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
import { inr, fmtDateTime } from '@/lib/admin/format';

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';
const COLS = 'grid-cols-[140px_1fr_100px_120px_110px_90px_150px]';

const QUOTATION_STATUSES: QuotationStatus[] = ['generated', 'sent', 'viewed', 'converted', 'archived'];

// Where the quotation was raised: company self-service portal vs the B2B cart/filters flow.
function SourceChip({ t }: { t?: string }) {
  const map: Record<string, [string, string]> = {
    company: ['Company', 'text-indigo bg-[rgba(42,43,106,.1)]'],
    filters: ['Filters', 'text-slate bg-black/[.05]'],
    cart: ['Cart', 'text-slate bg-black/[.05]'],
  };
  const [label, cls] = map[t ?? 'cart'] ?? map.cart;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>;
}

function AnalyticsCards() {
  const { data, isLoading } = useQuotationAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`rounded-[18px] p-5 animate-pulse ${GLASS}`}>
            <div className="h-3 w-24 rounded bg-black/5 mb-3" />
            <div className="h-8 w-16 rounded bg-black/5" />
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
        <div key={c.label} className={`rounded-[18px] p-5 ${GLASS}`}>
          <p className="font-jbmono text-[10px] font-semibold uppercase tracking-[.08em] text-muted mb-1">{c.label}</p>
          <p className="text-3xl font-extrabold tracking-tight text-ink">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

function QuotationsTable() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const statusParam = searchParams.get('status') as QuotationStatus | null;
  const pageParam = Number(searchParams.get('page') ?? '1');
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const { data, isLoading, isError } = useQuotations({ status: statusParam ?? undefined, page });

  const quotations = data?.items ?? [];
  const total = data?.total ?? 0;
  const limit = 20;
  const pages = Math.max(1, Math.ceil(total / limit));

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
    if (key !== 'page') params.delete('page');
    router.push(`/admin/quotations?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Status filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-jbmono text-xs font-semibold text-muted uppercase tracking-wider mr-1">Filter:</span>
        <button
          onClick={() => setFilter('status', null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!statusParam ? 'bg-indigo text-white' : 'bg-white/70 border border-line text-slate hover:bg-white'}`}
        >
          All
        </button>
        {QUOTATION_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter('status', s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${statusParam === s ? 'bg-indigo text-white' : 'bg-white/70 border border-line text-slate hover:bg-white'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className={`rounded-[20px] divide-y divide-line ${GLASS}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 w-32 rounded bg-black/5" />
              <div className="h-4 w-40 rounded bg-black/5 flex-1" />
              <div className="h-5 w-20 rounded-full bg-black/5" />
              <div className="h-4 w-20 rounded bg-black/5" />
            </div>
          ))}
        </div>
      )}

      {isError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load quotations. Please try refreshing.</div>}

      {!isLoading && !isError && quotations.length === 0 && (
        <div className={`rounded-[20px] p-10 text-center ${GLASS}`}><p className="text-sm text-muted">No quotations found.</p></div>
      )}

      {!isLoading && !isError && quotations.length > 0 && (
        <div className={`rounded-[20px] divide-y divide-line overflow-hidden ${GLASS}`}>
          <div className={`grid ${COLS} gap-4 px-5 py-2.5 bg-white/50 font-jbmono text-[10px] font-semibold text-muted uppercase tracking-wider`}>
            <span>Quotation #</span><span>Contact</span><span>Source</span><span>Status</span><span>Total</span><span>Downloads</span><span>Date</span>
          </div>

          {quotations.map((q) => (
            <Link
              key={q._id}
              href={`/admin/quotations/${q._id}`}
              className={`grid ${COLS} gap-4 items-center px-5 py-3 hover:bg-white/50 transition-colors`}
            >
              <span className="font-jbmono text-xs text-slate truncate">{q.quotationNumber}</span>
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">{q.contact?.name ?? '—'}</p>
                <p className="text-xs text-muted truncate">{q.contact?.email ?? ''}</p>
                {q.contact?.company && <p className="text-xs text-muted truncate">{q.contact.company}</p>}
              </div>
              <span><SourceChip t={q.sourceType} /></span>
              <div><StatusChip status={q.status} /></div>
              <span className="text-sm font-bold text-ink">{inr(q.total)}</span>
              <span className="text-sm text-slate text-center">{typeof q.downloadCount === 'number' ? q.downloadCount : '—'}</span>
              <span className="text-xs text-muted">{fmtDateTime(q.createdAt)}</span>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted">Page {page} of {pages} · {total.toLocaleString('en-IN')} quotations</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setFilter('page', String(page - 1))}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
            <button disabled={page >= pages} onClick={() => setFilter('page', String(page + 1))}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminQuotationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Quotations</h1>
        <p className="mt-1 text-sm text-slate">Manage B2B quotation requests — including those raised from company dashboards — and track status.</p>
      </div>

      <AnalyticsCards />

      <Suspense fallback={<div className={`rounded-[20px] p-8 text-center text-sm text-muted animate-pulse ${GLASS}`}>Loading quotations…</div>}>
        <QuotationsTable />
      </Suspense>
    </div>
  );
}
