'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import {
  useSellers,
  useUpdateSeller,
  useUpdateSellerStatus,
  type AdminSeller,
  type SellerStatus,
} from '@/lib/admin/sellers';
import { StatusChip } from '@/components/admin/StatusChip';

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';
const COLS = 'grid-cols-[1.5fr_90px_90px_140px_120px_1.4fr]';

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

// Status-driven action buttons (mirrors the server's allowed transitions).
function StatusActions({ seller }: { seller: AdminSeller }) {
  const setStatus = useUpdateSellerStatus(seller._id);
  const busy = setStatus.isPending;

  const reject = () => {
    const reason = window.prompt('Reason for rejecting this seller?');
    if (reason && reason.trim()) setStatus.mutate({ status: 'rejected', reason: reason.trim() });
  };

  const btn = (label: string, onClick: () => void, tone: 'accent' | 'danger' | 'indigo') => {
    const cls = tone === 'accent'
      ? 'bg-accent text-white'
      : tone === 'danger'
        ? 'bg-[rgba(224,82,77,.1)] text-[#c0413c]'
        : 'bg-[rgba(42,43,106,.07)] text-indigo';
    return <button disabled={busy} onClick={onClick} className={`rounded-[9px] px-3 py-1.5 text-[11px] font-semibold disabled:opacity-50 ${cls}`}>{label}</button>;
  };

  return (
    <span className="flex flex-wrap justify-end gap-1.5">
      {seller.status === 'pending' && <>{btn('✓ Approve', () => setStatus.mutate({ status: 'active' }), 'accent')}{btn('Reject', reject, 'danger')}</>}
      {seller.status === 'active' && btn('Suspend', () => setStatus.mutate({ status: 'suspended' }), 'danger')}
      {seller.status === 'suspended' && btn('Reactivate', () => setStatus.mutate({ status: 'active' }), 'accent')}
      {seller.status === 'rejected' && btn('Re-open', () => setStatus.mutate({ status: 'pending' }), 'indigo')}
    </span>
  );
}

// Inline editable margin % (saves on change of the stepped value).
function MarginEditor({ seller }: { seller: AdminSeller }) {
  const update = useUpdateSeller(seller._id);
  const [val, setVal] = useState(seller.marginPercent ?? 0);
  const dirty = val !== seller.marginPercent;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  return (
    <span className="flex items-center gap-1">
      <span className="flex items-center rounded-[9px] border border-line bg-white/70">
        <button onClick={() => setVal((v) => clamp(v - 1))} className="px-2 text-slate">−</button>
        <input
          value={val}
          onChange={(e) => setVal(clamp(Number(e.target.value) || 0))}
          className="w-9 border-x border-line bg-transparent py-1 text-center text-xs font-bold text-ink outline-none"
        />
        <button onClick={() => setVal((v) => clamp(v + 1))} className="px-2 text-slate">+</button>
      </span>
      {dirty && (
        <button
          onClick={() => update.mutate({ marginPercent: val })}
          disabled={update.isPending}
          className="rounded-[8px] bg-accent px-2 py-1 text-[10px] font-bold text-white disabled:opacity-50"
        >
          Save
        </button>
      )}
    </span>
  );
}

function SellerRow({ seller }: { seller: AdminSeller }) {
  return (
    <div className={`grid ${COLS} items-center gap-3 border-b border-line px-5 py-3`}>
      <div className="min-w-0">
        <Link href={`/admin/sellers/${seller._id}`} className="block truncate text-sm font-bold text-ink hover:underline">
          {seller.businessName}
        </Link>
        <span className="block truncate text-xs text-muted">{seller.contact?.email ?? seller.slug}</span>
      </div>
      <span className="text-center text-sm font-bold text-ink">{seller.productCount ?? 0}</span>
      <span className="text-center">
        {seller.pendingSubmissions
          ? <span className="rounded-full bg-[rgba(224,163,59,.16)] px-2 py-0.5 text-[11px] font-bold text-[#b5801e]">{seller.pendingSubmissions}</span>
          : <span className="text-sm text-muted">0</span>}
      </span>
      <MarginEditor seller={seller} />
      <StatusChip status={seller.status} label={seller.status} />
      <StatusActions seller={seller} />
    </div>
  );
}

function SellersTable() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SellerStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useSellers(page, search || undefined, statusFilter || undefined);
  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search sellers…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-56 rounded-[11px] border border-line bg-white/70 px-3.5 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as SellerStatus | ''); setPage(1); }}
          className="rounded-[11px] border border-line bg-white/70 px-3.5 py-2 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading && (
        <div className={`rounded-[20px] divide-y divide-line ${GLASS}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 w-48 rounded bg-black/5" />
              <div className="h-4 w-16 rounded bg-black/5" />
              <div className="h-5 w-16 rounded-full bg-black/5" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : 'Failed to load sellers.'}
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className={`rounded-[20px] p-10 text-center ${GLASS}`}><p className="text-sm text-muted">No sellers found.</p></div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className={`rounded-[20px] overflow-hidden ${GLASS}`}>
          <div className={`grid ${COLS} gap-3 bg-white/50 px-5 py-2.5 font-jbmono text-[10px] font-semibold uppercase tracking-wider text-muted`}>
            <span>Seller</span>
            <span className="text-center">Products</span>
            <span className="text-center">Pending</span>
            <span>Margin %</span>
            <span>Status</span>
            <span></span>
          </div>
          {items.map((s) => <SellerRow key={s._id} seller={s} />)}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate">
          <span>Page {pagination.page} of {pagination.pages} ({pagination.total.toLocaleString()} total)</span>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-line px-3 py-1 hover:bg-white/60 disabled:opacity-40">Previous</button>
            <button disabled={pagination.page >= pagination.pages} onClick={() => setPage((p) => p + 1)}
              className="rounded border border-line px-3 py-1 hover:bg-white/60 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSellersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Sellers</h1>
        <p className="mt-1 text-sm text-slate">Products, pending submissions, margin, and approval status per marketplace seller.</p>
      </div>

      <Suspense fallback={<div className={`rounded-[20px] p-8 text-center text-sm text-muted animate-pulse ${GLASS}`}>Loading sellers…</div>}>
        <SellersTable />
      </Suspense>
    </div>
  );
}
