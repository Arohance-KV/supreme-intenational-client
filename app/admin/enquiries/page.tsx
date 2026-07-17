'use client';

import { useState } from 'react';
import {
  useEnquiries,
  useEnquiryCounts,
  useUpdateEnquiryStatus,
  useContactLeads,
  type EnquiryStatus,
} from '@/lib/admin/enquiries';
import { fmtDate } from '@/lib/admin/format';

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';

type Tab = 'merchandising' | 'product-request' | 'contact';

const TABS: { key: Tab; label: string }[] = [
  { key: 'merchandising', label: 'Merchandising' },
  { key: 'product-request', label: 'Product requests' },
  { key: 'contact', label: 'Contact leads' },
];

const NEXT_STATUS: Record<EnquiryStatus, EnquiryStatus> = {
  new: 'in_progress',
  in_progress: 'resolved',
  resolved: 'resolved',
};

const STATUS_STYLE: Record<EnquiryStatus, string> = {
  new: 'bg-[rgba(42,43,106,.1)] text-indigo',
  in_progress: 'bg-[rgba(224,163,59,.16)] text-[#b5801e]',
  resolved: 'bg-[rgba(31,170,107,.12)] text-[#1a8f5a]',
};

const STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  resolved: 'Resolved',
};

function ErrorBanner({ message }: { message: string }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>;
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-black/5 ${className}`} />;
}

// ── Company enquiry tabs (merchandising / product-request) ──────────────────────
function EnquiryList({ type }: { type: Exclude<Tab, 'contact'> }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useEnquiries({ type, page });
  const advance = useUpdateEnquiryStatus();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (data?.limit ?? 20)));

  if (isError) return <ErrorBanner message="Could not load enquiries." />;

  const cols = 'grid-cols-[1.3fr_1.6fr_.7fr_.9fr_1fr]';

  return (
    <div className="space-y-4">
      <div className={`rounded-[20px] overflow-hidden divide-y divide-line ${GLASS}`}>
        <div className={`grid ${cols} gap-3 px-5 py-3 bg-white/50 font-jbmono text-[10px] uppercase tracking-[.05em] text-muted`}>
          <span>Company</span><span>Subject</span><span>Items</span><span>Status</span><span>Raised</span>
        </div>
        {isPending ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-5 py-4"><Skeleton className="h-5 w-full" /></div>
          ))
        ) : !items.length ? (
          <p className="px-5 py-10 text-center text-sm text-muted">No {type === 'merchandising' ? 'merchandising' : 'product-request'} enquiries yet.</p>
        ) : (
          items.map((e) => (
            <div key={e._id} className={`grid ${cols} gap-3 items-center px-5 py-3.5 text-[13px]`}>
              <div className="min-w-0">
                <div className="font-bold text-ink truncate">{e.companyName ?? '—'}</div>
                <div className="text-xs text-muted truncate">{e.companyContact?.name ?? e.companyContact?.email ?? ''}</div>
              </div>
              <div className="flex min-w-0 items-center gap-2.5">
                {e.image ? (
                  <a href={e.image} target="_blank" rel="noopener noreferrer" title="Open reference image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={e.image} alt="Reference" className="h-9 w-9 shrink-0 rounded-md border border-line object-cover" />
                  </a>
                ) : null}
                <div className="min-w-0">
                  <div className="text-ink truncate">{e.subject}</div>
                  {e.message ? <div className="text-xs text-muted truncate">{e.message}</div> : null}
                </div>
              </div>
              <span className="text-slate">{e.items?.length || 0}</span>
              <span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[e.status]}`}>
                  {STATUS_LABEL[e.status]}
                </span>
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted">{fmtDate(e.createdAt)}</span>
                {e.status !== 'resolved' && (
                  <button
                    onClick={() => advance.mutate({ id: e._id, status: NEXT_STATUS[e.status] })}
                    disabled={advance.isPending}
                    className="shrink-0 rounded-[9px] bg-[rgba(42,43,106,.07)] px-3 py-1.5 text-[11px] font-semibold text-indigo hover:bg-[rgba(42,43,106,.12)] disabled:opacity-50"
                  >
                    Advance →
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {pages > 1 && (
        <Pager page={page} pages={pages} total={total} noun="enquiries" onChange={setPage} />
      )}
    </div>
  );
}

// ── Contact-form leads (website "Contact Us") — read-only inbox ──────────────────
function ContactLeadsList() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useContactLeads(page);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (data?.limit ?? 20)));

  if (isError) return <ErrorBanner message="Could not load contact leads." />;

  const cols = 'grid-cols-[1.2fr_1.5fr_2fr_1fr]';

  return (
    <div className="space-y-4">
      <div className={`rounded-[20px] overflow-hidden divide-y divide-line ${GLASS}`}>
        <div className={`grid ${cols} gap-3 px-5 py-3 bg-white/50 font-jbmono text-[10px] uppercase tracking-[.05em] text-muted`}>
          <span>From</span><span>Subject</span><span>Message</span><span>Received</span>
        </div>
        {isPending ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-5 py-4"><Skeleton className="h-5 w-full" /></div>
          ))
        ) : !items.length ? (
          <p className="px-5 py-10 text-center text-sm text-muted">No contact-form submissions yet.</p>
        ) : (
          items.map((c) => (
            <div key={c._id} className={`grid ${cols} gap-3 items-start px-5 py-3.5 text-[13px]`}>
              <div className="min-w-0">
                <div className="font-bold text-ink truncate">{c.fullName}</div>
                <div className="text-xs text-muted truncate">{c.email}</div>
                {c.phoneNumber ? <div className="text-xs text-muted truncate">{c.isdCode} {c.phoneNumber}</div> : null}
              </div>
              <div className="text-ink min-w-0 truncate">{c.subject}</div>
              <div className="text-slate min-w-0 line-clamp-2">{c.message}</div>
              <span className="text-xs text-muted">{fmtDate(c.createdAt)}</span>
            </div>
          ))
        )}
      </div>

      {pages > 1 && (
        <Pager page={page} pages={pages} total={total} noun="leads" onChange={setPage} />
      )}
    </div>
  );
}

function Pager({ page, pages, total, noun, onChange }: { page: number; pages: number; total: number; noun: string; onChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between pt-1">
      <p className="text-xs text-muted">Page {page} of {pages} · {total.toLocaleString('en-IN')} {noun}</p>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}
          className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
        <button disabled={page >= pages} onClick={() => onChange(page + 1)}
          className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
      </div>
    </div>
  );
}

export default function AdminEnquiriesPage() {
  const [tab, setTab] = useState<Tab>('merchandising');
  const counts = useEnquiryCounts();

  const badge = (key: Tab): number | undefined => {
    if (!counts.data) return undefined;
    if (key === 'merchandising') return counts.data.merchandising;
    if (key === 'product-request') return counts.data.product_request;
    return counts.data.contact;
  };

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Enquiries</h1>
        <p className="mt-1 text-sm text-slate">Company merchandising &amp; product-request enquiries, plus website contact-form leads.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const on = t.key === tab;
          const n = badge(t.key);
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-[11px] px-4 py-2 text-[13px] font-semibold transition-colors ${
                on ? 'bg-gradient-to-br from-indigo to-indigo2 text-white' : 'bg-white/70 border border-line text-slate hover:bg-white'
              }`}
            >
              {t.label}
              {typeof n === 'number' && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${on ? 'bg-white/20 text-white' : 'bg-accent text-white'}`}>{n}</span>
              )}
            </button>
          );
        })}
      </div>

      {tab === 'contact' ? <ContactLeadsList /> : <EnquiryList type={tab} />}
    </main>
  );
}
