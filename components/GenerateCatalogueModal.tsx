'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

interface CatalogueOptions {
  productCodes: boolean;
  moq: boolean;
  coverPage: boolean;
  showMrp: boolean;
  showTentativePrice: boolean;
}

interface GenerateResult {
  catalogueId: string;
  catalogueNumber: string;
  pdfUrl: string;
}

const KNOWN_KEYS = new Set(['category', 'sort', 'page', 'limit', 'minPrice', 'maxPrice']);

const OPTION_LABELS: { key: keyof CatalogueOptions; label: string }[] = [
  { key: 'productCodes', label: 'Include product codes' },
  { key: 'moq', label: 'Include MOQ' },
  { key: 'coverPage', label: 'Cover page + branding' },
  { key: 'showMrp', label: 'Show MRP (crossed out)' },
  { key: 'showTentativePrice', label: 'Show tentative price' },
];

export default function GenerateCatalogueModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const searchParams = useSearchParams();
  const [options, setOptions] = useState<CatalogueOptions>({
    productCodes: true,
    moq: true,
    coverPage: false,
    showMrp: false,
    showTentativePrice: false,
  });
  const [pending, setPending] = useState<'download' | 'email' | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Chips describing the active filters (best-effort labels from the URL).
  const chips = useMemo(() => {
    const out: string[] = [];
    for (const c of searchParams.getAll('category')) out.push(cap(c));
    const min = searchParams.get('minPrice');
    const max = searchParams.get('maxPrice');
    if (min && max) out.push(`₹${min}–₹${max}`);
    else if (max) out.push(`Under ₹${max}`);
    else if (min) out.push(`From ₹${min}`);
    for (const key of new Set(searchParams.keys())) {
      if (KNOWN_KEYS.has(key)) continue;
      for (const v of searchParams.getAll(key)) out.push(cap(v));
    }
    return out;
  }, [searchParams]);

  const filters = useMemo(() => {
    const f: Record<string, string | string[]> = {};
    for (const key of new Set(searchParams.keys())) {
      if (key === 'sort' || key === 'page' || key === 'limit') continue;
      const vals = searchParams.getAll(key);
      f[key] = vals.length > 1 ? vals : vals[0];
    }
    return f;
  }, [searchParams]);

  const countQs = useMemo(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('page');
    p.set('limit', '1');
    return p.toString();
  }, [searchParams]);
  const { data: countData } = useQuery({
    queryKey: ['catalogue-count', countQs],
    queryFn: () => apiFetch<{ pagination: { total: number } }>(`/catalog/products?${countQs}`),
    enabled: open,
    staleTime: 60_000,
  });
  const count = countData?.pagination.total;
  const overLimit = count !== undefined && count > 100;

  const generate = useMutation<GenerateResult>({
    mutationFn: () =>
      apiFetch<GenerateResult>('/catalogues', { method: 'POST', body: { source: 'filters', filters, options } }),
  });

  const run = async (mode: 'download' | 'email') => {
    setPending(mode);
    setEmailSent(false);
    // Open the tab synchronously within the click gesture, then fill it once the PDF
    // URL arrives. Opening after `await` puts window.open outside the user gesture, so
    // the popup blocker (strict in incognito) eats the first click — the double-press bug.
    const tab = mode === 'download' ? window.open('about:blank', '_blank') : null;
    try {
      const res = await generate.mutateAsync();
      if (mode === 'email') {
        await apiFetch(`/catalogues/${res.catalogueId}/email`, { method: 'POST' });
        setEmailSent(true);
      } else if (res.pdfUrl && tab) {
        tab.opener = null; // sever opener now that we kept the handle (was noopener before)
        tab.location.href = res.pdfUrl;
      }
    } catch (e) {
      tab?.close();
      throw e; // let react-query flag isError for the footer message
    }
  };

  if (!open) return null;

  const noPricing = !options.showMrp && !options.showTentativePrice;
  const showPricePreview = options.showTentativePrice || options.showMrp;
  const busy = generate.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-display">
      <div className="absolute inset-0 bg-[rgba(23,24,58,.45)] backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[860px] overflow-hidden rounded-[22px] border border-white/80 bg-white/80 shadow-[0_30px_80px_rgba(23,24,58,.35)] backdrop-blur-[24px]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line/70 px-7 py-5">
          <div>
            <p className="font-jbmono text-[11px] uppercase tracking-[.14em] text-accent">
              {noPricing ? 'No pricing · Branded PDF' : 'Indicative pricing · Branded PDF'}
            </p>
            <h2 className="mt-1 text-[22px] font-extrabold tracking-[-.02em] text-ink">Generate Catalogue</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(42,43,106,.06)] text-slate transition-colors hover:bg-[rgba(42,43,106,.12)] hover:text-ink">✕</button>
        </div>

        <div className="grid gap-7 px-7 py-6 md:grid-cols-2">
          {/* Left: filters + options */}
          <div>
            <p className="font-jbmono mb-2.5 text-[11px] uppercase tracking-[.14em] text-muted">Selected filters</p>
            <div className="mb-6 flex flex-wrap gap-2">
              {chips.length === 0 ? (
                <span className="text-sm text-muted">No filters — full catalogue</span>
              ) : (
                chips.map((c, i) => (
                  <span key={i} className="rounded-full border border-line bg-white/70 px-3 py-1 text-[13px] font-medium text-indigo">{c}</span>
                ))
              )}
            </div>

            <p className="font-jbmono mb-2.5 text-[11px] uppercase tracking-[.14em] text-muted">Catalogue options</p>
            <div className="flex flex-col gap-2.5">
              {OPTION_LABELS.map(({ key, label }) => (
                <label key={key} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={(e) => setOptions((o) => ({ ...o, [key]: e.target.checked }))}
                    className="h-[18px] w-[18px] rounded-[6px] border-line accent-accent"
                  />
                  {label}
                </label>
              ))}
            </div>

            <p className="mt-5 rounded-[14px] border border-[rgba(23,155,142,.25)] bg-[rgba(23,155,142,.08)] px-4 py-3 text-[13px] leading-relaxed text-slate">
              Pricing visibility is optional — hide both for a clean no-price catalogue, or show tentative price and crossed-out MRP for internal use.
            </p>
          </div>

          {/* Right: preview */}
          <div>
            <p className="font-jbmono mb-2.5 text-[11px] uppercase tracking-[.14em] text-muted">Preview · Page 1</p>
            <div className="rounded-[16px] border border-line bg-white p-4 shadow-[0_10px_30px_rgba(34,36,90,.08)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="h-2.5 w-24 rounded-full bg-[linear-gradient(135deg,#2a2b6a,#149b8e)]" />
                <span className="font-jbmono text-[9px] uppercase tracking-[.14em] text-muted">Catalogue</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="overflow-hidden rounded-[10px] border border-line">
                    <div className="h-20 bg-[repeating-linear-gradient(45deg,#eef0f8,#eef0f8_8px,#e6e7f2_8px,#e6e7f2_16px)]" />
                    <div className="space-y-1 p-2">
                      {options.productCodes && <div className="h-1.5 w-10 rounded-full bg-accent/40" />}
                      <div className="h-1.5 w-16 rounded-full bg-slate/30" />
                      <div className="flex items-center justify-between pt-0.5">
                        {showPricePreview ? (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-8 rounded-full bg-ink/40" />
                            {options.showMrp && <div className="h-1.5 w-6 rounded-full bg-muted/40" />}
                          </div>
                        ) : <span />}
                        {options.moq && <div className="h-2 w-8 rounded-full bg-accent/25" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {count !== undefined && (
              <p className={`mt-2 text-xs ${overLimit ? 'text-[#e0524d]' : 'text-slate'}`}>
                {overLimit ? `${count} products match — over the 100 limit. Narrow your filters.` : `Includes ${count} product${count !== 1 ? 's' : ''}.`}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line/70 px-7 py-4">
          {generate.isError && <span className="mr-auto text-sm text-[#e0524d]">Could not generate. Try again.</span>}
          {emailSent && <span className="mr-auto text-sm font-semibold text-[#1a8f5a]">Catalogue emailed ✓</span>}
          <button
            onClick={() => run('email')}
            disabled={busy || overLimit}
            className="rounded-xl border border-line bg-white/80 px-5 py-2.5 text-sm font-semibold text-indigo transition-colors hover:bg-white disabled:opacity-50"
          >
            {busy && pending === 'email' ? 'Sending…' : 'Email Catalogue'}
          </button>
          <button
            onClick={() => run('download')}
            disabled={busy || overLimit}
            className="rounded-xl bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(42,43,106,.3)] transition-shadow hover:shadow-[0_10px_28px_rgba(42,43,106,.4)] disabled:opacity-50"
          >
            {busy && pending === 'download' ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}

function cap(s: string): string {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}
