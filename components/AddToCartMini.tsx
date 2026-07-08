'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getProductBySlug } from '@/lib/catalog';
import { apiFetch, ApiError } from '@/lib/api';

// Card-level add to cart: resolves the product's default (first active) variant on
// click and adds it at its MOQ. Multi-variant products can be fine-tuned on the
// detail page. ponytail: one fetch on click — no variant data on the listing DTO.
export default function AddToCartMini({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const add = async () => {
    setState('loading');
    try {
      const { variants } = await getProductBySlug(slug);
      const v = variants.find((x) => x.isActive) ?? variants[0];
      if (!v) throw new ApiError('No variants available', 400);
      await apiFetch('/cart/items', { method: 'POST', body: { variantId: v._id, qty: v.moq } });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setState('done');
      setTimeout(() => setState('idle'), 1400);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 1800);
    }
  };

  const label =
    state === 'loading' ? 'Adding…' : state === 'done' ? 'Added ✓' : state === 'error' ? 'Try again' : 'Add to cart';

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(); }}
      disabled={state === 'loading'}
      className={`w-full rounded-xl py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-60 ${
        state === 'done'
          ? 'bg-accent text-white'
          : 'bg-[rgba(42,43,106,0.07)] text-indigo border border-[rgba(42,43,106,0.12)] hover:bg-[rgba(42,43,106,0.12)]'
      }`}
    >
      {label}
    </button>
  );
}
