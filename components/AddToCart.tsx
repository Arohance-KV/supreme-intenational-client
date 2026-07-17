'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';
import type { ProductVariant } from '@/lib/catalog';

interface AddToCartProps {
  variants: ProductVariant[];
  tokenKey?: string;
  cartQueryKey?: readonly unknown[];
  // Portal-scoped cart mount. Employees must post to /employee/cart so the server reads
  // their sov_emp_token instead of a storefront sov_token in the same browser.
  cartPath?: string;
  // Employees buy for internal use and are not bound by MOQ; pass false to allow any qty >= 1.
  enforceMoq?: boolean;
}

export default function AddToCart({
  variants,
  tokenKey = 'token',
  cartQueryKey = ['cart'],
  cartPath = '/cart',
  enforceMoq = true,
}: AddToCartProps) {
  const activeVariants = variants.filter((v) => v.isActive);
  const firstActive = activeVariants[0] ?? variants[0];

  const minQty = (v: ProductVariant | undefined) => (enforceMoq ? v?.moq ?? 1 : 1);

  // Distinct attributes (first-seen order), each with its distinct values — drives the chips.
  const groups: { slug: string; name: string; values: { slug: string; label: string }[] }[] = [];
  for (const v of variants) {
    for (const a of v.attributes) {
      let g = groups.find((x) => x.slug === a.attributeSlug);
      if (!g) { g = { slug: a.attributeSlug, name: a.attributeName, values: [] }; groups.push(g); }
      if (!g.values.some((x) => x.slug === a.valueSlug)) g.values.push({ slug: a.valueSlug, label: a.valueLabel });
    }
  }
  // ponytail: multi-variant products always carry attributes here, so chips cover them.
  const hasAttributes = groups.length > 0;

  const variantFor = (sel: Record<string, string>): ProductVariant | undefined =>
    variants.find(
      (v) =>
        v.attributes.length === Object.keys(sel).length &&
        v.attributes.every((a) => sel[a.attributeSlug] === a.valueSlug),
    );

  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const sel: Record<string, string> = {};
    for (const a of firstActive?.attributes ?? []) sel[a.attributeSlug] = a.valueSlug;
    return sel;
  });

  const selected = variantFor(selection) ?? firstActive;
  const [qty, setQty] = useState<number>(minQty(firstActive));
  const queryClient = useQueryClient();

  // Reset qty to the min when the resolved variant changes — derived during render
  // (the React-recommended alternative to a setState-in-effect).
  const [prevId, setPrevId] = useState(selected?._id ?? '');
  if ((selected?._id ?? '') !== prevId) {
    setPrevId(selected?._id ?? '');
    setQty(minQty(selected));
  }

  // A value is selectable if some active variant has it alongside the other current picks.
  const isValueAvailable = (groupSlug: string, valueSlug: string) =>
    variants.some(
      (v) =>
        v.isActive &&
        v.attributes.some((a) => a.attributeSlug === groupSlug && a.valueSlug === valueSlug) &&
        Object.entries(selection).every(
          ([s, val]) => s === groupSlug || v.attributes.some((a) => a.attributeSlug === s && a.valueSlug === val),
        ),
    );

  // Pick a value, then snap the whole selection to the active variant that best preserves
  // the other picks — guarantees the combo always resolves to a real, active variant.
  const selectValue = (groupSlug: string, valueSlug: string) => {
    const candidates = variants.filter(
      (v) => v.isActive && v.attributes.some((a) => a.attributeSlug === groupSlug && a.valueSlug === valueSlug),
    );
    let best = candidates[0];
    let bestScore = -1;
    for (const v of candidates) {
      const score = Object.entries(selection).filter(
        ([s, val]) => s !== groupSlug && v.attributes.some((a) => a.attributeSlug === s && a.valueSlug === val),
      ).length;
      if (score > bestScore) { bestScore = score; best = v; }
    }
    const next: Record<string, string> = { [groupSlug]: valueSlug };
    if (best) for (const a of best.attributes) next[a.attributeSlug] = a.valueSlug;
    setSelection(next);
  };

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`${cartPath}/items`, {
        method: 'POST',
        body: { variantId: selected._id, qty },
        tokenKey,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  });

  if (!selected) {
    return <p className="text-sm text-muted">No variants available.</p>;
  }

  const floor = enforceMoq ? selected.moq : 1;
  const outOfStock = selected.stock < floor;
  const effectivePrice = selected.flashSalePrice ?? selected.price;
  const compareAt = selected.flashSalePrice ? selected.price : selected.originalPrice;
  const hasDiscount = compareAt > effectivePrice;
  const savingsPct = hasDiscount ? Math.round(((compareAt - effectivePrice) / compareAt) * 100) : 0;
  const orderTotal = effectivePrice * (Number.isFinite(qty) ? qty : floor);

  const clamp = (val: number) => Math.min(selected.stock, Math.max(floor, val));
  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setQty(val >= floor ? Math.min(val, selected.stock) : floor);
  };

  const showChips = variants.length > 1 && hasAttributes;

  return (
    <div className={`font-display grid gap-6 ${showChips ? 'md:grid-cols-[minmax(0,1fr)_300px]' : ''}`}>
      {/* Variant Selector — one compact chip group per attribute */}
      {showChips && (
        <div className="flex flex-col gap-4">
          {groups.map((g) => (
            <div key={g.slug}>
              <label className="mb-2 block text-[13px] font-semibold uppercase tracking-[.04em] text-slate">{g.name}</label>
              <div className="flex flex-wrap gap-2">
                {g.values.map((val) => {
                  const active = selection[g.slug] === val.slug;
                  const available = isValueAvailable(g.slug, val.slug);
                  return (
                    <button
                      key={val.slug}
                      type="button"
                      onClick={() => selectValue(g.slug, val.slug)}
                      disabled={!available}
                      aria-pressed={active}
                      className={
                        active
                          ? 'rounded-[10px] border border-accent bg-accent px-3.5 py-1.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(23,155,142,.3)]'
                          : available
                            ? 'rounded-[10px] border border-line bg-white/80 px-3.5 py-1.5 text-sm text-slate transition-colors hover:border-accent hover:text-ink'
                            : 'cursor-not-allowed rounded-[10px] border border-line bg-white/40 px-3.5 py-1.5 text-sm text-muted line-through opacity-50'
                      }
                    >
                      {val.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buy box — price, stock, qty and CTA kept together and always visible */}
      <div className="flex h-fit flex-col gap-4 rounded-[18px] border border-line bg-white/70 p-5 shadow-[0_8px_26px_rgba(34,36,90,.06)]">
        {/* Price */}
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[30px] font-extrabold tracking-[-.02em] text-ink">₹{effectivePrice.toFixed(2)}</span>
          {hasDiscount && <span className="text-base text-muted line-through">₹{compareAt.toFixed(2)}</span>}
          <span className="text-xs text-muted">/ unit</span>
          {hasDiscount && (
            <span className="font-jbmono ml-1 rounded-full bg-[rgba(23,155,142,.12)] px-2 py-[3px] text-[11px] font-semibold text-accent">
              Save {savingsPct}%
            </span>
          )}
        </div>

        {/* Stock / MOQ chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              outOfStock ? 'bg-[rgba(224,82,77,.1)] text-[#e0524d]' : 'bg-[rgba(31,170,107,.12)] text-[#1a8f5a]'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${outOfStock ? 'bg-[#e0524d]' : 'bg-[#1a8f5a]'}`} />
            {outOfStock ? 'Out of stock' : `${selected.stock} in stock`}
          </span>
          {enforceMoq && (
            <span className="font-jbmono inline-flex items-center rounded-full bg-[rgba(42,43,106,.08)] px-3 py-1 text-[11px] font-medium text-indigo">
              MOQ {selected.moq}
            </span>
          )}
        </div>

        {/* Quantity stepper */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate">
            Quantity{enforceMoq ? ` (min ${selected.moq})` : ''}
          </label>
          <div className="inline-flex items-center rounded-xl border border-line bg-white/80 focus-within:border-accent">
            <button
              type="button"
              onClick={() => setQty((q) => clamp((Number.isFinite(q) ? q : floor) - 1))}
              disabled={outOfStock || qty <= floor}
              aria-label="Decrease quantity"
              className="px-3.5 py-2 text-lg leading-none text-slate transition-colors hover:text-ink disabled:opacity-30"
            >
              −
            </button>
            <input
              type="number"
              min={floor}
              max={selected.stock}
              value={qty}
              onChange={handleQtyChange}
              disabled={outOfStock}
              className="w-16 border-x border-line bg-transparent py-2 text-center text-sm outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setQty((q) => clamp((Number.isFinite(q) ? q : floor) + 1))}
              disabled={outOfStock || qty >= selected.stock}
              aria-label="Increase quantity"
              className="px-3.5 py-2 text-lg leading-none text-slate transition-colors hover:text-ink disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>

        {/* Order total — the real amount for the chosen bulk quantity */}
        {!outOfStock && (
          <div className="flex items-baseline justify-between rounded-[14px] bg-[rgba(42,43,106,.05)] px-4 py-3">
            <span className="text-sm text-slate">
              Order total <span className="font-jbmono text-xs text-muted">({qty} units)</span>
            </span>
            <span className="text-xl font-extrabold tracking-[-.02em] text-ink">
              ₹{orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={() => mutation.mutate()}
          disabled={outOfStock || mutation.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[13px] bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(42,43,106,.3)] transition-all hover:brightness-110 hover:shadow-[0_14px_34px_rgba(42,43,106,.4)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8h13.2M7 13L5.4 5M10 21a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          {mutation.isPending ? 'Adding…' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>

        {/* Feedback */}
        {mutation.isSuccess && <p className="text-sm font-semibold text-[#1a8f5a]">Added to cart!</p>}
        {mutation.isError && (
          <p className="text-sm font-semibold text-[#e0524d]">
            {mutation.error instanceof ApiError ? mutation.error.message : 'Failed to add to cart. Please try again.'}
          </p>
        )}
      </div>
    </div>
  );
}
