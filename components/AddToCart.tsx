'use client';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';
import type { ProductVariant } from '@/lib/catalog';

interface AddToCartProps {
  variants: ProductVariant[];
  tokenKey?: string;
  cartQueryKey?: readonly unknown[];
}

export default function AddToCart({
  variants,
  tokenKey = 'token',
  cartQueryKey = ['cart'],
}: AddToCartProps) {
  const activeVariants = variants.filter((v) => v.isActive);
  const firstActive = activeVariants[0] ?? variants[0];

  const [selectedId, setSelectedId] = useState<string>(firstActive?._id ?? '');
  const [qty, setQty] = useState<number>(firstActive?.moq ?? 1);

  const selected = variants.find((v) => v._id === selectedId) ?? firstActive;
  const queryClient = useQueryClient();

  // Update qty when variant changes — default to moq
  useEffect(() => {
    if (selected) {
      setQty(selected.moq);
    }
  }, [selectedId, selected]);

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

  const outOfStock = selected.stock < selected.moq;
  const effectivePrice = selected.flashSalePrice ?? selected.price;

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val >= selected.moq) {
      setQty(val);
    } else {
      setQty(selected.moq);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Variant Selector */}
      {variants.length > 1 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Variant</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700"
            >
              {attr.attributeName}: {attr.valueLabel}
            </span>
          ))}
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-zinc-900">₹{effectivePrice.toFixed(2)}</span>
        {selected.flashSalePrice && (
          <span className="text-sm text-zinc-400 line-through">₹{selected.price.toFixed(2)}</span>
        )}
        {selected.originalPrice > effectivePrice && !selected.flashSalePrice && (
          <span className="text-sm text-zinc-400 line-through">
            ₹{selected.originalPrice.toFixed(2)}
          </span>
        )}
        <span className="text-xs text-zinc-500">/ unit</span>
      </div>

      {/* Stock / MOQ info */}
      <div className="flex items-center gap-4 text-sm text-zinc-500">
        <span>
          Stock:{' '}
          <span className={outOfStock ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
            {outOfStock ? 'Out of stock' : `${selected.stock} units`}
          </span>
        </span>
        <span>MOQ: {selected.moq}</span>
      </div>

      {/* Quantity Input */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Quantity (min {selected.moq})
        </label>
        <input
          type="number"
          min={selected.moq}
          value={qty}
          onChange={handleQtyChange}
          disabled={outOfStock}
          className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={() => mutation.mutate()}
        disabled={outOfStock || mutation.isPending}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {mutation.isPending ? 'Adding...' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>

      {/* Feedback */}
      {mutation.isSuccess && (
        <p className="text-sm font-medium text-green-600">Added to cart!</p>
      )}
      {mutation.isError && (
        <p className="text-sm font-medium text-red-600">
          {mutation.error instanceof ApiError
            ? mutation.error.message
            : 'Failed to add to cart. Please try again.'}
        </p>
      )}
    </div>
  );
}
