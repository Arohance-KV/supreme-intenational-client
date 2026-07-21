'use client';

import { Children, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useMyQuotations, type Quotation } from '@/lib/quotation';
import { useWishlist } from '@/lib/wishlist';
import type { Profile as AuthProfile } from '@/lib/userAuth';
import DcFooter from '@/components/DcFooter';
import ProductCard from '@/components/ProductCard';

// Extends the shared Profile (lib/userAuth.ts) instead of redeclaring it — a local
// copy is the one that drifts and silently loses fields like b2bStatus.
interface Profile extends AuthProfile {
  verified?: boolean;
  company?: { name?: string };
  img?: { link?: string };
}

interface Catalogue {
  _id: string;
  catalogueNumber: string;
  createdAt: string;
  items: unknown[];
  sourceType: 'cart' | 'filters';
  filtersApplied: Record<string, unknown> | null;
  pdfUrl: string;
}

type Tab = 'quotes' | 'cats' | 'saved';

function initials(first: string, last?: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatINR(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

// Human-ish label for a catalogue's saved filters. ponytail: shows raw slugs/values;
// prettify via catalog metadata only if merchandisers ask.
function scopeLabel(c: Catalogue): string {
  if (c.sourceType === 'cart') return 'From cart';
  const f = c.filtersApplied;
  if (!f || Object.keys(f).length === 0) return 'All products';
  const parts: string[] = [];
  const cat = f.category;
  if (cat) parts.push(Array.isArray(cat) ? cat.join(', ') : String(cat));
  if (f.minPrice || f.maxPrice) parts.push(`₹${f.minPrice ?? 0}–${f.maxPrice ?? '∞'}`);
  const attrs = Object.keys(f).filter(
    (k) => !['category', 'minPrice', 'maxPrice', 'sort', 'page', 'limit'].includes(k),
  );
  if (attrs.length) parts.push(attrs.join(', '));
  return parts.join(' · ') || 'Filtered';
}

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  converted: { label: 'Won', cls: 'text-[#1a8f5a] bg-[rgba(31,170,107,.12)]' },
  generated: { label: 'Generated', cls: 'text-indigo bg-[rgba(42,43,106,.1)]' },
  sent: { label: 'Sent', cls: 'text-indigo bg-[rgba(42,43,106,.1)]' },
  viewed: { label: 'Viewed', cls: 'text-[#b5801e] bg-[rgba(224,163,59,.16)]' },
  archived: { label: 'Archived', cls: 'text-slate bg-[rgba(91,93,122,.12)]' },
};

function statusBadge(status: string) {
  const s = STATUS_STYLE[status] ?? { label: status, cls: 'text-slate bg-[rgba(91,93,122,.12)]' };
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}

const card =
  'rounded-[18px] border border-white/80 bg-white/55 p-4 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[14px] sm:p-5';

export default function AccountPage() {
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState<Tab>('quotes');

  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => apiFetch<Profile>('/auth/profile'),
    enabled: isLoggedIn,
  });
  const { data: quotationsData } = useMyQuotations();
  const { data: cataloguesData } = useQuery<{ items: Catalogue[]; total: number }>({
    queryKey: ['catalogues-mine'],
    queryFn: () => apiFetch<{ items: Catalogue[]; total: number }>('/catalogues/mine'),
    enabled: isLoggedIn,
  });
  const { data: wishlistData } = useWishlist(isLoggedIn);

  if (!isLoggedIn) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#eef0f8] px-4 text-ink">
        <h1 className="text-2xl font-extrabold tracking-[-.02em]">My Account</h1>
        <p className="max-w-md text-center text-slate">You must be logged in to view your account.</p>
        <Link
          href="/login"
          className="rounded-xl bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-6 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_8px_22px_rgba(42,43,106,.3)]"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const quotations = quotationsData?.items ?? [];
  const catalogues = cataloguesData?.items ?? [];
  const saved = wishlistData?.products ?? [];
  const fullName = `${profile?.firstName ?? ''}${profile?.lastName ? ' ' + profile.lastName : ''}`.trim();

  const tabs: { k: Tab; t: string }[] = [
    { k: 'quotes', t: 'Quotations' },
    { k: 'cats', t: 'Catalogues' },
    { k: 'saved', t: 'Saved items' },
  ];

  return (
    <main className="font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(20,155,142,.14),transparent_60%),radial-gradient(50%_45%_at_0%_6%,rgba(58,60,152,.14),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />

      <div className="relative z-[1]">
        <div className="mx-auto max-w-[1180px] px-4 pb-12 pt-2 sm:px-6">
          {/* Profile header */}
          <section className="flex flex-wrap items-center gap-4 py-6 sm:gap-[18px] sm:py-8">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] sm:h-[68px] sm:w-[68px] sm:rounded-[18px] bg-[linear-gradient(135deg,#2a2b6a,#179b8e)] text-2xl font-extrabold tracking-[-.02em] text-white">
              {initials(profile?.firstName ?? '', profile?.lastName)}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[22px] font-extrabold tracking-[-.02em] sm:text-[30px]">
                {fullName || 'My Account'}
              </h1>
              <div className="truncate text-sm text-slate">
                {profile?.company?.name ? `${profile.company.name} · ` : ''}
                {profile?.email}
              </div>
            </div>
            {profile?.verified && (
              <span className="whitespace-nowrap rounded-full bg-[rgba(31,170,107,.12)] px-3.5 py-1.5 text-xs font-bold text-[#1a8f5a]">
                ✓ Verified account
              </span>
            )}
          </section>

          {/* KPIs */}
          <div className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-3.5">
            {[
              { label: 'Quotations', value: quotationsData?.total ?? quotations.length },
              { label: 'Catalogues', value: cataloguesData?.total ?? catalogues.length },
              { label: 'Saved items', value: saved.length },
            ].map((kpi) => (
              <div key={kpi.label} className={card}>
                <div className="font-jbmono mb-2.5 text-[10px] uppercase tracking-[.08em] text-muted">
                  {kpi.label}
                </div>
                <div className="text-[22px] font-extrabold sm:text-[28px]">{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-[18px] flex gap-5 overflow-x-auto border-b border-line sm:gap-[22px]">
            {tabs.map((t) => {
              const on = tab === t.k;
              return (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className={`-mb-px shrink-0 border-b-2 px-1 pb-3.5 text-sm font-semibold transition-colors ${
                    on ? 'border-indigo text-ink' : 'border-transparent text-muted hover:text-slate'
                  }`}
                >
                  {t.t}
                </button>
              );
            })}
          </div>

          {/* Content */}
          {tab === 'quotes' && (
            <QuoteTable rows={quotations} />
          )}
          {tab === 'cats' && (
            <div className={card}>
              {catalogues.length === 0 ? (
                <Empty text="No catalogues yet." href="/products" cta="Browse products" />
              ) : (
                <>
                  <TableHead cols={CAT_COLS} heads={CAT_HEADS} />
                  {catalogues.map((c) => (
                    <TableRow key={c._id} cols={CAT_COLS} heads={CAT_HEADS}>
                      <span className="font-jbmono font-bold">{c.catalogueNumber}</span>
                      <span>{formatDate(c.createdAt)}</span>
                      <span className="truncate text-slate">{scopeLabel(c)}</span>
                      <span>{c.items.length}</span>
                      <ViewBtn url={c.pdfUrl} />
                    </TableRow>
                  ))}
                </>
              )}
            </div>
          )}
          {tab === 'saved' && (
            saved.length === 0 ? (
              <div className={card}>
                <Empty text="No saved items yet." href="/products" cta="Browse products" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {saved.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )
          )}
        </div>

        <DcFooter />
      </div>
    </main>
  );
}

const QUOTE_HEADS = ['Quotation', 'Date', 'Items', 'Units', 'Est. total', 'Status', ''];
const CAT_COLS = '1fr 1fr 2fr .8fr .7fr';
const CAT_HEADS = ['Catalogue', 'Date', 'Scope', 'Products', ''];

function QuoteTable({ rows }: { rows: Quotation[] }) {
  const cols = '1.1fr .9fr .5fr .5fr 1fr .9fr .7fr';
  return (
    <div className={card}>
      {rows.length === 0 ? (
        <Empty text="No quotations yet." href="/cart" cta="Go to cart" />
      ) : (
        <>
          <TableHead cols={cols} heads={QUOTE_HEADS} />
          {rows.map((q) => {
            const units = q.items.reduce((s, i) => s + i.qty, 0);
            return (
              <TableRow key={q._id} cols={cols} heads={QUOTE_HEADS}>
                <span className="font-jbmono font-bold">{q.quotationNumber}</span>
                <span>{formatDate(q.createdAt)}</span>
                <span>{q.items.length}</span>
                <span>{units}</span>
                <span className="font-bold">{formatINR(q.total)}</span>
                <span>{statusBadge(q.status)}</span>
                <ViewBtn url={q.pdfUrl} />
              </TableRow>
            );
          })}
        </>
      )}
    </div>
  );
}

function TableHead({ cols, heads }: { cols: string; heads: string[] }) {
  return (
    <div
      className="font-jbmono hidden gap-3.5 border-b border-line px-3.5 pb-3 text-[10px] uppercase tracking-[.05em] text-muted sm:grid"
      style={{ gridTemplateColumns: cols }}
    >
      {heads.map((h, i) => (
        <span key={i}>{h}</span>
      ))}
    </div>
  );
}

// Below sm the columns would be ~40px wide, so each cell becomes a labelled row
// instead (the header is hidden there and supplies the labels here).
function TableRow({ cols, heads, children }: { cols: string; heads: string[]; children: React.ReactNode }) {
  return (
    <div
      className="border-b border-line py-1.5 text-[13px] last:border-b-0 sm:grid sm:items-center sm:gap-3.5 sm:px-3.5 sm:py-3.5"
      style={{ gridTemplateColumns: cols }}
    >
      {Children.toArray(children).map((cell, i) => (
        <div key={i} className="flex min-w-0 items-center justify-between gap-3 py-1 sm:block sm:truncate sm:py-0">
          {heads[i] && <span className="font-jbmono shrink-0 text-[10px] uppercase tracking-[.05em] text-muted sm:hidden">{heads[i]}</span>}
          {cell}
        </div>
      ))}
    </div>
  );
}

// ponytail: opens the stored pdfUrl directly; switch to the /pdf endpoint if download-count
// tracking on the account page matters.
function ViewBtn({ url }: { url: string }) {
  return (
    <span className="flex justify-end">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-[9px] bg-[rgba(42,43,106,.07)] px-2.5 py-1.5 text-[11px] font-semibold text-indigo no-underline hover:bg-[rgba(42,43,106,.12)]"
      >
        View
      </a>
    </span>
  );
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="mb-3 text-sm text-muted">{text}</p>
      <Link
        href={href}
        className="rounded-xl border border-line bg-white/60 px-4 py-2 text-sm font-semibold text-slate no-underline hover:bg-white"
      >
        {cta}
      </Link>
    </div>
  );
}
