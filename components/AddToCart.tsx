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

  const [selectedId, setSelectedId] = useState<string>(firstActive?._id ?? '');
  const [qty, setQty] = useState<number>(minQty(firstActive));

  const selected = variants.find((v) => v._id === selectedId) ?? firstActive;
  const queryClient = useQueryClient();

  // Reset qty to the min when the selected variant changes — derived during render
  // (the React-recommended alternative to a setState-in-effect). See "you might not
  // need an effect".
  const [prevId, setPrevId] = useState(selectedId);
  if (selectedId !== prevId) {
    setPrevId(selectedId);
    setQty(minQty(selected));
  }

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
    return <p className="text-sm text-zinc-500">No variants available.</p>;
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
      {/* Variant Selector */}
      {variants.length > 1 && (
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate">Variant</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-xl border border-line bg-white/80 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent focus:bg-white"
          >
            {variants.map((v) => {
              const label =
                v.attributes.map((a) => `${a.attributeName}: ${a.valueLabel}`).join(', ') ||
                v.sku;
              return (
                <option key={v._id} value={v._id} disabled={!v.isActive}>
                  {label} {!v.isActive ? '(unavailable)' : ''}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Variant attributes display */}
      {selected.attributes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.attributes.map((attr) => (
            <span
              key={attr.attributeSlug}
              className="font-jbmono rounded-full border border-[rgba(23,155,142,.25)] bg-[rgba(23,155,142,.12)] px-3 py-1 text-[11px] text-accent"
            >
              {attr.attributeName}: {attr.valueLabel}
            </span>
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
