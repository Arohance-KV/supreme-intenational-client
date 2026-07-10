'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

interface AttributeValue {
  _id: string;
  slug: string;
  label: string;
  isActive: boolean;
}

interface Attribute {
  _id: string;
  name: string;
  slug: string;
  unit?: string;
  values: AttributeValue[];
}

// Keys we manage explicitly — everything else in the URL is an attribute filter.
const KNOWN_KEYS = new Set(['category', 'sort', 'page', 'limit', 'minPrice', 'maxPrice']);

// basePath lets the same filter sidebar drive a different route (e.g. the admin
// Generate Docs page) — it only changes where the querystring is pushed, not the
// public /catalog metadata the options are built from.
export default function Filters({ basePath = '/products' }: { basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.getAll('category');
  // Attributes are scoped to a single category; with 0 or many selected, show all.
  const categoryForAttrs = selectedCategories.length === 1 ? selectedCategories[0] : '';

  // Cached so navigating between filtered pages doesn't refetch the filter metadata.
  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<CategoryItem[]>('/catalog/categories'),
    staleTime: 5 * 60_000,
  });

  const { data: rawAttributes = [], isLoading: attrsLoading } = useQuery({
    queryKey: ['attributes', categoryForAttrs],
    queryFn: () =>
      apiFetch<Attribute[]>(
        categoryForAttrs
          ? `/catalog/attributes?category=${encodeURIComponent(categoryForAttrs)}`
          : '/catalog/attributes',
      ),
    staleTime: 5 * 60_000,
  });
  const attributes = rawAttributes.filter((a) => a.values.some((v) => v.isActive));

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');

  // Price bounds anchor the dual sliders — global, cached (doesn't jump as filters change).
  const { data: bounds } = useQuery({
    queryKey: ['price-range'],
    queryFn: () => apiFetch<{ min: number; max: number }>('/catalog/price-range'),
    staleTime: 5 * 60_000,
  });
  const loBound = bounds?.min ?? 0;
  const hiBound = bounds?.max ?? 0;
  const hasBounds = hiBound > loBound;
  const lo = minPrice === '' ? loBound : Number(minPrice);
  const hi = maxPrice === '' ? hiBound : Number(maxPrice);

  const hasFilters =
    selectedCategories.length > 0 ||
    searchParams.get('sort') ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice') ||
    Array.from(searchParams.keys()).some((k) => !KNOWN_KEYS.has(k));

  // Build a fresh querystring off the current URL, drop page, apply overrides.
  function pushParams(mutate: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('page');
    mutate(p);
    const qs = p.toString();
    router.push(qs ? basePath + '?' + qs : basePath);
  }

  function toggleMulti(key: string, value: string) {
    pushParams((p) => {
      const current = p.getAll(key);
      p.delete(key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      next.forEach((v) => p.append(key, v));
    });
  }

  function onMinSlide(v: number) {
    setMinPrice(String(Math.min(v, hi)));
  }
  function onMaxSlide(v: number) {
    setMaxPrice(String(Math.max(v, lo)));
  }
  // Commit on thumb release — a value at the bound means "no filter", so drop it.
  function commitPrice() {
    pushParams((p) => {
      lo > loBound ? p.set('minPrice', String(lo)) : p.delete('minPrice');
      hi < hiBound ? p.set('maxPrice', String(hi)) : p.delete('maxPrice');
    });
  }

  function onClear() {
    setMinPrice('');
    setMaxPrice('');
    router.push(basePath);
  }

  return (
    <div className="font-display space-y-5 rounded-[20px] border border-white/80 bg-white/55 p-5 shadow-[0_10px_30px_rgba(34,36,90,.08)] backdrop-blur-[14px]">
      <div className="flex items-center justify-between">
        <h2 className="font-jbmono text-[11px] font-bold uppercase tracking-[.14em] text-muted">Filters</h2>
        {hasFilters && (
          <button onClick={onClear} className="text-xs font-semibold text-accent hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* Price range (dual slider) */}
      {hasBounds && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate">Price range (₹)</label>
          <div className="mb-2 flex justify-between text-xs font-semibold text-ink">
            <span>₹{lo}</span>
            <span>₹{hi}</span>
          </div>
          <div className="dual-range">
            <div className="track" />
            <div
              className="fill"
              style={{
                left: `${((lo - loBound) / (hiBound - loBound)) * 100}%`,
                width: `${((hi - lo) / (hiBound - loBound)) * 100}%`,
              }}
            />
            <input
              type="range"
              min={loBound}
              max={hiBound}
              value={lo}
              onChange={(e) => onMinSlide(Number(e.target.value))}
              onMouseUp={commitPrice}
              onTouchEnd={commitPrice}
              aria-label="Minimum price"
            />
            <input
              type="range"
              min={loBound}
              max={hiBound}
              value={hi}
              onChange={(e) => onMaxSlide(Number(e.target.value))}
              onMouseUp={commitPrice}
              onTouchEnd={commitPrice}
              aria-label="Maximum price"
            />
          </div>
        </div>
      )}

      {/* Categories (multi-select) */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate">Categories</label>
        {catsLoading ? (
          <div className="h-24 animate-pulse rounded-xl bg-white/60" />
        ) : categories.length === 0 ? (
          <p className="text-xs text-muted">No categories</p>
        ) : (
          <ul className="space-y-1.5">
            {categories.map((cat) => (
              <li key={cat._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`cat-${cat.slug}`}
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={() => toggleMulti('category', cat.slug)}
                  className="rounded border-line text-accent accent-accent focus:ring-accent"
                />
                <label htmlFor={`cat-${cat.slug}`} className="cursor-pointer text-sm text-slate">
                  {cat.name}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Attribute filters (multi-select) */}
      {!attrsLoading &&
        attributes.map((attr) => {
          const activeValues = attr.values.filter((v) => v.isActive);
          if (activeValues.length === 0) return null;
          const selectedValues = searchParams.getAll(attr.slug);

          return (
            <div key={attr._id}>
              <p className="mb-1.5 text-xs font-semibold text-slate">
                {attr.name}
                {attr.unit ? ` (${attr.unit})` : ''}
              </p>
              <ul className="space-y-1.5">
                {activeValues.map((val) => (
                  <li key={val._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`${attr.slug}-${val.slug}`}
                      checked={selectedValues.includes(val.slug)}
                      onChange={() => toggleMulti(attr.slug, val.slug)}
                      className="rounded border-line text-accent accent-accent focus:ring-accent"
                    />
                    <label
                      htmlFor={`${attr.slug}-${val.slug}`}
                      className="cursor-pointer text-sm text-slate"
                    >
                      {val.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
    </div>
  );
}
