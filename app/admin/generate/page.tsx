'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/catalog';
import Filters from '@/components/Filters';
import {
  useAdminGenerateCatalogue,
  useAdminGenerateQuotation,
  type AdditionalCharge,
  type ProductVariant,
} from '@/lib/admin/generate';

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';
const MAX_SELECT = 300;
const PAGE_SIZE = 48; // bigger than the B2B default (12) so selecting many products needs less paging

function inr(n: unknown): string {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
}

type ChargeRow = { label: string; amount: string };

function GenerateInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Products from the public catalogue, driven by the same filters as /products ──
  const qs = useMemo(() => {
    const p = new URLSearchParams(searchParams.toString());
    if (!p.has('limit')) p.set('limit', String(PAGE_SIZE));
    return p.toString();
  }, [searchParams]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-generate-products', qs],
    queryFn: () => getProducts('?' + qs),
  });
  const products = data?.products ?? [];
  const pagination = data?.pagination;
  const page = pagination?.page ?? 1;

  function goPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/admin/generate?${params.toString()}`);
  }

  // Search box → writes `search` to the URL (dropping page).
  const [term, setTerm] = useState(searchParams.get('search') ?? '');
  useEffect(() => {
    const cur = searchParams.get('search') ?? '';
    const id = setTimeout(() => {
      if (term.trim() === cur) return;
      const params = new URLSearchParams(searchParams.toString());
      if (term.trim()) params.set('search', term.trim());
      else params.delete('search');
      params.delete('page');
      router.push(`/admin/generate?${params.toString()}`);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  // ── Selection (persists across filter/page changes) ─────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());
  type SelMeta = { name: string; image?: string; minPrice?: number };
  type VariantRow = { label: string; price: string };

  const [selMeta, setSelMeta] = useState<Map<string, SelMeta>>(new Map());
  const [variants, setVariants] = useState<Map<string, VariantRow[]>>(new Map());

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setSelMeta((m) => { const n = new Map(m); n.delete(id); return n; });
        setVariants((v) => { const n = new Map(v); n.delete(id); return n; });
      } else if (next.size < MAX_SELECT) {
        next.add(id);
        const p = products.find((x) => x._id === id);
        if (p) setSelMeta((m) => new Map(m).set(id, { name: p.name, image: p.images?.[0], minPrice: p.minPrice }));
      }
      return next;
    });
  const allOnPageSelected = products.length > 0 && products.every((p) => selected.has(p._id));
  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        products.forEach((p) => next.delete(p._id));
        setSelMeta((m) => { const n = new Map(m); products.forEach((p) => n.delete(p._id)); return n; });
        setVariants((v) => { const n = new Map(v); products.forEach((p) => n.delete(p._id)); return n; });
      } else {
        const addMeta = new Map(selMeta);
        for (const p of products) {
          if (next.size >= MAX_SELECT) break;
          next.add(p._id);
          addMeta.set(p._id, { name: p.name, image: p.images?.[0], minPrice: p.minPrice });
        }
        setSelMeta(addMeta);
      }
      return next;
    });

  // ── Additional charges (uniform across all selected products) ───────────────
  const [charges, setCharges] = useState<ChargeRow[]>([]);
  const addCharge = () => setCharges((c) => [...c, { label: '', amount: '' }]);
  const setCharge = (i: number, patch: Partial<ChargeRow>) =>
    setCharges((c) => c.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const removeCharge = (i: number) => setCharges((c) => c.filter((_, idx) => idx !== i));
  const cleanCharges = useMemo<AdditionalCharge[]>(
    () =>
      charges
        .map((c) => ({ label: c.label.trim(), amount: Number(c.amount) }))
        .filter((c) => c.label && Number.isFinite(c.amount) && c.amount >= 0),
    [charges],
  );

  // ── Per-product variant pricing (absolute price, overrides default + charges) ──
  const addVariant = (id: string) =>
    setVariants((v) => new Map(v).set(id, [...(v.get(id) ?? []), { label: '', price: '' }]));
  const setVariant = (id: string, i: number, patch: Partial<VariantRow>) =>
    setVariants((v) => {
      const rows = (v.get(id) ?? []).map((r, idx) => (idx === i ? { ...r, ...patch } : r));
      return new Map(v).set(id, rows);
    });
  const removeVariant = (id: string, i: number) =>
    setVariants((v) => new Map(v).set(id, (v.get(id) ?? []).filter((_, idx) => idx !== i)));

  const cleanVariants = useMemo<Record<string, ProductVariant[]>>(() => {
    const out: Record<string, ProductVariant[]> = {};
    for (const [id, rows] of variants) {
      if (!selected.has(id)) continue;
      const clean = rows
        .map((r) => ({ label: r.label.trim(), price: Number(r.price) }))
        .filter((r) => r.label && Number.isFinite(r.price) && r.price >= 0);
      if (clean.length) out[id] = clean;
    }
    return out;
  }, [variants, selected]);

  // ── Generate ────────────────────────────────────────────────────────────────
  const genCatalogue = useAdminGenerateCatalogue();
  const genQuotation = useAdminGenerateQuotation();
  const [result, setResult] = useState<{ url: string; number: string; kind: 'Catalogue' | 'Quotation' } | null>(null);
  const busy = genCatalogue.isPending || genQuotation.isPending;
  const genError = (genCatalogue.error ?? genQuotation.error) as Error | null;
  const productIds = useMemo(() => [...selected], [selected]);
  const disabled = busy || selected.size === 0;

  const run = async (kind: 'Catalogue' | 'Quotation') => {
    setResult(null);
    const body = { productIds, charges: cleanCharges, variants: cleanVariants };
    const r = kind === 'Catalogue'
      ? await genCatalogue.mutateAsync(body)
      : await genQuotation.mutateAsync(body);
    const number = 'catalogueNumber' in r ? r.catalogueNumber : r.quotationNumber;
    setResult({ url: r.pdfUrl, number, kind });
    window.open(r.pdfUrl, '_blank', 'noopener');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink">Generate Docs</h1>
        <p className="mt-1 text-sm text-slate">
          Filter and pick products, optionally add charge options (e.g. “With Print” +₹10), then
          generate a catalogue or quotation PDF. Charges apply to every selected product.
        </p>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* ── Filters (same as B2B /products) ─────────────────────────── */}
        <aside className="w-full shrink-0 lg:w-64">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-[20px] bg-white/50" />}>
            <Filters basePath="/admin/generate" />
          </Suspense>
        </aside>

        {/* ── Products ────────────────────────────────────────────────── */}
        <section className={`min-w-0 flex-1 rounded-[20px] ${GLASS} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 px-5 py-3">
            <div className="relative w-full max-w-xs">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">⌕</span>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-full border border-line bg-white/70 py-2 pl-9 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <p className="text-sm text-slate">
              <span className="font-semibold text-indigo">{selected.size}</span> selected
              {selected.size >= MAX_SELECT && <span className="ml-1 text-[#e0524d]">(max {MAX_SELECT})</span>}
              {selected.size > 0 && (
                <button onClick={() => { setSelected(new Set()); setSelMeta(new Map()); setVariants(new Map()); }} className="ml-3 text-xs text-slate underline hover:text-ink">
                  Clear
                </button>
              )}
            </p>
          </div>

          {isLoading && <div className="p-10 text-center text-sm text-slate">Loading…</div>}
          {isError && <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load products.</div>}
          {!isLoading && !isError && products.length === 0 && (
            <div className="p-10 text-center text-sm text-slate">No products match your filters.</div>
          )}

          {!isLoading && !isError && products.length > 0 && (
            <>
              <label className="flex cursor-pointer items-center gap-2 border-b border-line/60 px-5 py-2 text-xs text-slate">
                <input type="checkbox" checked={allOnPageSelected} onChange={togglePage} className="accent-indigo" />
                Select all on this page
              </label>
              <div className="divide-y divide-line/60">
                {products.map((p) => {
                  const on = selected.has(p._id);
                  return (
                    <label
                      key={p._id}
                      className={`flex cursor-pointer items-center gap-3 px-5 py-2.5 transition-colors ${on ? 'bg-indigo/[.06]' : 'hover:bg-white/50'}`}
                    >
                      <input type="checkbox" checked={on} onChange={() => toggle(p._id)} className="accent-indigo" />
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="h-9 w-9 flex-none rounded-lg border border-line object-cover" />
                      ) : (
                        <div className="h-9 w-9 flex-none rounded-lg border border-line bg-black/5" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{p.name}</span>
                      <span className="text-xs text-slate">{p.category || '—'}</span>
                      <span className="w-20 text-right text-sm text-slate">{inr(p.minPrice)}</span>
                    </label>
                  );
                })}
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 text-sm">
                  <button onClick={() => goPage(page - 1)} disabled={page <= 1} className="rounded border border-line px-3 py-1 text-slate disabled:opacity-40">← Prev</button>
                  <span className="text-muted">Page {page} of {pagination.pages}</span>
                  <button onClick={() => goPage(page + 1)} disabled={page >= pagination.pages} className="rounded border border-line px-3 py-1 text-slate disabled:opacity-40">Next →</button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Charges + actions ───────────────────────────────────────── */}
        <aside className="w-full shrink-0 space-y-5 lg:w-80">
          <section className={`rounded-[20px] ${GLASS} p-5`}>
            <h2 className="text-sm font-bold text-ink">Selected products · pricing</h2>
            <p className="mt-1 text-xs text-muted">
              Add variant prices for a product (e.g. “Without handle ₹90”). A product with variants shows only
              those prices — its default price and the charges below don’t apply to it.
            </p>

            {selected.size === 0 && <p className="mt-3 text-xs text-slate">No products selected yet.</p>}

            <div className="mt-3 space-y-3">
              {[...selected].map((id) => {
                const meta = selMeta.get(id);
                const rows = variants.get(id) ?? [];
                return (
                  <div key={id} className="rounded-xl border border-line/70 bg-white/50 p-2.5">
                    <div className="flex items-center gap-2">
                      {meta?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={meta.image} alt="" className="h-7 w-7 flex-none rounded-md border border-line object-cover" />
                      ) : (
                        <div className="h-7 w-7 flex-none rounded-md border border-line bg-black/5" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{meta?.name ?? id}</span>
                    </div>

                    {rows.length === 0 && (
                      <p className="mt-1.5 pl-9 text-xs text-slate">Default pricing{inr(meta?.minPrice) !== '—' ? ` · ${inr(meta?.minPrice)}` : ''}.</p>
                    )}

                    <div className="mt-2 space-y-2">
                      {rows.map((r, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            value={r.label}
                            onChange={(e) => setVariant(id, i, { label: e.target.value })}
                            placeholder="Without handle"
                            className="min-w-0 flex-1 rounded-lg border border-line bg-white/70 px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none"
                          />
                          <div className="relative w-20 flex-none">
                            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted">₹</span>
                            <input
                              value={r.price}
                              onChange={(e) => setVariant(id, i, { price: e.target.value.replace(/[^\d.]/g, '') })}
                              inputMode="decimal"
                              placeholder="90"
                              className="w-full rounded-lg border border-line bg-white/70 py-1.5 pl-6 pr-2 text-sm focus:border-accent focus:outline-none"
                            />
                          </div>
                          <button onClick={() => removeVariant(id, i)} aria-label="Remove variant" className="flex-none text-muted hover:text-[#e0524d]">✕</button>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => addVariant(id)} className="mt-2 pl-0 text-xs font-semibold text-indigo hover:underline">
                      + Add variant price
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={`rounded-[20px] ${GLASS} p-5`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">Additional charges</h2>
              <button onClick={addCharge} className="text-xs font-semibold text-indigo hover:underline">+ Add</button>
            </div>
            <p className="mt-1 text-xs text-muted">Applied per product as base + charge (e.g. “With Print: ₹110”). Products with variant prices ignore these.</p>

            <div className="mt-3 space-y-2">
              {charges.length === 0 && <p className="text-xs text-slate">No charges — plain pricing.</p>}
              {charges.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={c.label}
                    onChange={(e) => setCharge(i, { label: e.target.value })}
                    placeholder="With Print"
                    className="min-w-0 flex-1 rounded-lg border border-line bg-white/70 px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none"
                  />
                  <div className="relative w-24 flex-none">
                    <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted">₹</span>
                    <input
                      value={c.amount}
                      onChange={(e) => setCharge(i, { amount: e.target.value.replace(/[^\d.]/g, '') })}
                      inputMode="decimal"
                      placeholder="10"
                      className="w-full rounded-lg border border-line bg-white/70 py-1.5 pl-6 pr-2 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                  <button onClick={() => removeCharge(i)} aria-label="Remove" className="flex-none text-muted hover:text-[#e0524d]">✕</button>
                </div>
              ))}
            </div>
          </section>

          <section className={`rounded-[20px] ${GLASS} p-5`}>
            <button
              onClick={() => run('Catalogue')}
              disabled={disabled}
              className="w-full rounded-xl bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(42,43,106,.3)] disabled:opacity-50"
            >
              {genCatalogue.isPending ? 'Generating…' : 'Generate Catalogue'}
            </button>
            <button
              onClick={() => run('Quotation')}
              disabled={disabled}
              className="mt-2.5 w-full rounded-xl border border-line bg-white/80 px-5 py-2.5 text-sm font-semibold text-indigo hover:bg-white disabled:opacity-50"
            >
              {genQuotation.isPending ? 'Generating…' : 'Generate Quotation'}
            </button>

            {selected.size === 0 && <p className="mt-2 text-xs text-muted">Select at least one product.</p>}
            {genError && <p className="mt-2 text-xs text-[#e0524d]">Generation failed. Try again.</p>}

            {result && (
              <div className="mt-4 rounded-xl border border-[rgba(23,155,142,.25)] bg-[rgba(23,155,142,.08)] p-3">
                <p className="text-sm font-semibold text-ink">{result.kind} ready · {result.number}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <a href={result.url} target="_blank" rel="noopener" className="rounded-lg bg-indigo px-3 py-1.5 font-semibold text-white">Download</a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${result.kind} ${result.number}: ${result.url}`)}`}
                    target="_blank"
                    rel="noopener"
                    className="rounded-lg border border-line bg-white px-3 py-1.5 font-semibold text-indigo"
                  >
                    WhatsApp
                  </a>
                  <button onClick={() => navigator.clipboard?.writeText(result.url)} className="rounded-lg border border-line bg-white px-3 py-1.5 font-semibold text-slate">Copy link</button>
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function GenerateDocsPage() {
  // useSearchParams requires a Suspense boundary.
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-[20px] bg-white/50" />}>
      <GenerateInner />
    </Suspense>
  );
}
