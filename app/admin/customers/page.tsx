'use client';

import { useState } from 'react';
import { useCustomers, type CustomerAccountType } from '@/lib/admin/customers';
import { fmtDate } from '@/lib/admin/format';

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';
const COLS = 'grid-cols-[1.4fr_1.3fr_.9fr_.7fr_.9fr]';

type Filter = '' | CustomerAccountType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: '', label: 'All B2B' },
  { key: 'company', label: 'Company' },
  { key: 'employee', label: 'Employee' },
  { key: 'individual', label: 'Individual' },
];

const TYPE_STYLE: Record<CustomerAccountType, string> = {
  company: 'text-indigo bg-[rgba(42,43,106,.1)]',
  employee: 'text-[#127d72] bg-[rgba(23,155,142,.12)]',
  individual: 'text-slate bg-black/[.05]',
};

function initials(a: string, b: string) {
  return `${(a || '').charAt(0)}${(b || '').charAt(0)}`.toUpperCase() || '—';
}

export default function AdminCustomersPage() {
  const [type, setType] = useState<Filter>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isPending, isError } = useCustomers({ type, search: search || undefined, page });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (data?.limit ?? 20)));

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Customers</h1>
        <p className="mt-1 text-sm text-slate">Company accounts and their employees — the B2B users who can quote &amp; order.</p>
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const on = f.key === type;
          return (
            <button
              key={f.key || 'all'}
              onClick={() => { setType(f.key); setPage(1); }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${on ? 'bg-indigo text-white' : 'bg-white/70 border border-line text-slate hover:bg-white'}`}
            >
              {f.label}
            </button>
          );
        })}
        <input
          type="text"
          placeholder="Search name, email or company…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="ml-auto w-64 rounded-[11px] border border-line bg-white/70 px-3.5 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load customers.</div>
      ) : (
        <div className={`rounded-[20px] divide-y divide-line overflow-hidden ${GLASS}`}>
          <div className={`grid ${COLS} gap-3 px-5 py-3 bg-white/50 font-jbmono text-[10px] uppercase tracking-[.05em] text-muted`}>
            <span>Customer</span><span>Company</span><span>Type</span><span>Verified</span><span>Joined</span>
          </div>

          {isPending ? (
            Array.from({ length: 8 }).map((_, i) => <div key={i} className="px-5 py-4"><div className="h-5 w-full animate-pulse rounded bg-black/5" /></div>)
          ) : !items.length ? (
            <p className="px-5 py-10 text-center text-sm text-muted">No customers found.</p>
          ) : (
            items.map((c) => (
              <div key={c._id} className={`grid ${COLS} gap-3 items-center px-5 py-3 text-[13px]`}>
                <span className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo to-accent text-[11px] font-extrabold text-white">
                    {initials(c.firstName, c.lastName)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-ink">{`${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || '—'}</span>
                    <span className="block truncate font-jbmono text-[11px] text-muted">{c.email}</span>
                  </span>
                </span>
                <span className="text-slate truncate">{c.companyName || '—'}</span>
                <span>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${TYPE_STYLE[c.accountType]}`}>
                    {c.accountType}
                    {c.accountType === 'employee' && c.employeeStatus ? ` · ${c.employeeStatus}` : ''}
                  </span>
                </span>
                <span className={`text-[11px] font-semibold ${c.verified ? 'text-[#1a8f5a]' : 'text-muted'}`}>{c.verified ? '✓ Verified' : 'Unverified'}</span>
                <span className="text-xs text-muted">{fmtDate(c.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted">Page {page} of {pages} · {total.toLocaleString('en-IN')} customers</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
            <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}
    </main>
  );
}
