'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';
import type { ProductVariant } from '@/lib/catalog';

interface AddToCartProps {
  variants: ProductVariant[];
  tokenKey?: string;
  cartQueryKey?: readonly unknown[];
  // Employees buy for internal use and are not bound by MOQ; pass false to allow any qty >= 1.
  enforceMoq?: boolean;
}

export default function AddToCart({
  variants,
  tokenKey = 'token',
  cartQueryKey = ['cart'],
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
      apiFetch('/cart/items', {
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

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setQty(val >= floor ? val : floor);
  };

  return (
    <div className="font-display flex flex-col gap-4">
      {/* Variant Selector — one chip group per attribute */}
      {variants.length > 1 && hasAttributes && (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <div key={g.slug}>
              <label className="mb-1.5 block text-sm font-semibold text-slate">{g.name}</label>
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
                          ? 'rounded-full border border-accent bg-accent px-3.5 py-1.5 text-sm font-semibold text-white'
                          : available
                            ? 'rounded-full border border-line bg-white/80 px-3.5 py-1.5 text-sm text-slate transition-colors hover:border-accent'
                            : 'cursor-not-allowed rounded-full border border-line bg-white/40 px-3.5 py-1.5 text-sm text-muted line-through opacity-50'
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

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-[26px] font-extrabold tracking-[-.02em] text-ink">₹{effectivePrice.toFixed(2)}</span>
        {selected.flashSalePrice && (
          <span className="text-sm text-muted line-through">₹{selected.price.toFixed(2)}</span>
        )}
        {selected.originalPrice > effectivePrice && !selected.flashSalePrice && (
          <span className="text-sm text-muted line-through">
            ₹{selected.originalPrice.toFixed(2)}
          </span>
        )}
        <span className="text-xs text-muted">/ unit</span>
      </div>

      {/* Stock / MOQ info */}
      <div className="flex items-center gap-4 text-sm text-slate">
        <span>
          Stock:{' '}
          <span className={outOfStock ? 'font-semibold text-[#e0524d]' : 'font-semibold text-[#1a8f5a]'}>
            {outOfStock ? 'Out of stock' : `${selected.stock} units`}
          </span>
        </span>
        {enforceMoq && <span className="font-jbmono text-xs text-muted">MOQ: {selected.moq}</span>}
      </div>

      {/* Quantity Input */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate">
          Quantity{enforceMoq ? ` (min ${selected.moq})` : ''}
        </label>
        <input
          type="number"
          min={floor}
          value={qty}
          onChange={handleQtyChange}
          disabled={outOfStock}
          className="w-32 rounded-xl border border-line bg-white/80 px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:bg-white disabled:opacity-50"
        />
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={() => mutation.mutate()}
        disabled={outOfStock || mutation.isPending}
        className="w-full rounded-[13px] bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(42,43,106,.3)] transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? 'Adding...' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>

      {/* Feedback */}
      {mutation.isSuccess && (
        <p className="text-sm font-semibold text-[#1a8f5a]">Added to cart!</p>
      )}
      {mutation.isError && (
        <p className="text-sm font-semibold text-[#e0524d]">
          {mutation.error instanceof ApiError
            ? mutation.error.message
            : 'Failed to add to cart. Please try again.'}
        </p>
      )}
    </div>
  );
}
