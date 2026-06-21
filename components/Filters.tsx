'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import OtpModal from '@/components/OtpModal';

interface UserProfile {
  email: string;
}

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

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();

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

  const selectedSort = searchParams.get('sort') ?? '';
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedSort ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice') ||
    Array.from(searchParams.keys()).some((k) => !KNOWN_KEYS.has(k));

  // Build a fresh querystring off the current URL, drop page, apply overrides.
  function pushParams(mutate: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('page');
    mutate(p);
    const qs = p.toString();
    router.push(qs ? '/products?' + qs : '/products');
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

  function onSortChange(sort: string) {
    pushParams((p) => (sort ? p.set('sort', sort) : p.delete('sort')));
  }

  function applyPrice() {
    pushParams((p) => {
      minPrice ? p.set('minPrice', minPrice) : p.delete('minPrice');
      maxPrice ? p.set('maxPrice', maxPrice) : p.delete('maxPrice');
    });
  }

  function onClear() {
    setMinPrice('');
    setMaxPrice('');
    router.push('/products');
  }

  // ── Generate catalogue (PDF) from the active filters ──────────────────────────
  // Backend gates this behind a logged-in user + a one-time OTP grant (same as the
  // quotation flow), so the button opens the OTP modal first, then generates.
  const [otpOpen, setOtpOpen] = useState(false);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: () => apiFetch<UserProfile>('/auth/profile'),
    enabled: isLoggedIn,
  });

  const catalogue = useMutation({
    mutationFn: () => {
      const filters: Record<string, string | string[]> = {};
      for (const key of new Set(searchParams.keys())) {
        if (key === 'sort' || key === 'page' || key === 'limit') continue;
        const vals = searchParams.getAll(key);
        // Numeric strings (e.g. "100") satisfy the catalogue validator's isNumeric.
        filters[key] = vals.length > 1 ? vals : vals[0];
      }
      return apiFetch<{ pdfUrl: string }>('/catalogues', {
        method: 'POST',
        body: { source: 'filters', filters },
      });
    },
    onSuccess: (data) => {
      if (data.pdfUrl) window.open(data.pdfUrl, '_blank', 'noopener');
    },
  });

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">Filters</h2>
        {hasFilters && (
          <button onClick={onClear} className="text-xs text-blue-600 hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* Generate catalogue */}
      <div>
        {isLoggedIn ? (
          <button
            onClick={() => setOtpOpen(true)}
            disabled={catalogue.isPending}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {catalogue.isPending ? 'Generating…' : 'Generate Catalogue (PDF)'}
          </button>
        ) : (
          <Link
            href="/login"
            className="block w-full rounded-md border border-blue-600 px-3 py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            Log in to generate catalogue
          </Link>
        )}
        {catalogue.isError && (
          <p className="mt-1 text-xs text-red-600">
            {(catalogue.error as Error).message === 'NO_PRODUCTS_FOR_FILTERS'
              ? 'No products match these filters.'
              : 'Could not generate catalogue. Try again.'}
          </p>
        )}
        {catalogue.isSuccess && (
          <p className="mt-1 text-xs text-green-600">Catalogue opened in a new tab.</p>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-medium text-zinc-700 mb-1">Sort by</label>
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Default</option>
          <option value="newest">Newest</option>
          <option value="rating">Top Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-medium text-zinc-700 mb-1">Price range (₹)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-zinc-400">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={applyPrice}
          className="mt-2 w-full rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Apply price
        </button>
      </div>

      {/* Categories (multi-select) */}
      <div>
        <label className="block text-xs font-medium text-zinc-700 mb-1">Categories</label>
        {catsLoading ? (
          <div className="h-24 animate-pulse rounded bg-zinc-100" />
        ) : categories.length === 0 ? (
          <p className="text-xs text-zinc-400">No categories</p>
        ) : (
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`cat-${cat.slug}`}
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={() => toggleMulti('category', cat.slug)}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`cat-${cat.slug}`} className="text-sm text-zinc-700 cursor-pointer">
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
              <p className="text-xs font-medium text-zinc-700 mb-1">
                {attr.name}
                {attr.unit ? ` (${attr.unit})` : ''}
              </p>
              <ul className="space-y-1">
                {activeValues.map((val) => (
                  <li key={val._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`${attr.slug}-${val.slug}`}
                      checked={selectedValues.includes(val.slug)}
                      onChange={() => toggleMulti(attr.slug, val.slug)}
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`${attr.slug}-${val.slug}`}
                      className="text-sm text-zinc-700 cursor-pointer"
                    >
                      {val.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

      {otpOpen && profile && (
        <OtpModal
          open={otpOpen}
          onClose={() => setOtpOpen(false)}
          onVerified={() => catalogue.mutate()}
          email={profile.email}
        />
      )}
    </div>
  );
}
