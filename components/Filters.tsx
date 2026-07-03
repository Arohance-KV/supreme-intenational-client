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
    <div className="font-display space-y-5 rounded-[20px] border border-white/80 bg-white/55 p-5 shadow-[0_10px_30px_rgba(34,36,90,.08)] backdrop-blur-[14px]">
      <div className="flex items-center justify-between">
        <h2 className="font-jbmono text-[11px] font-bold uppercase tracking-[.14em] text-muted">Filters</h2>
        {hasFilters && (
          <button onClick={onClear} className="text-xs font-semibold text-accent hover:underline">
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
            className="w-full rounded-xl bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-3 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(42,43,106,.3)] disabled:opacity-60"
          >
            {catalogue.isPending ? 'Generating…' : 'Generate Catalogue (PDF)'}
          </button>
        ) : (
          <Link
            href="/login"
            className="block w-full rounded-xl border border-indigo px-3 py-2.5 text-center text-sm font-semibold text-indigo no-underline hover:bg-[rgba(42,43,106,.07)]"
          >
            Log in to generate catalogue
          </Link>
        )}
        {catalogue.isError && (
          <p className="mt-1 text-xs text-[#e0524d]">
            {(catalogue.error as Error).message === 'NO_PRODUCTS_FOR_FILTERS'
              ? 'No products match these filters.'
              : 'Could not generate catalogue. Try again.'}
          </p>
        )}
        {catalogue.isSuccess && (
          <p className="mt-1 text-xs text-[#1a8f5a]">Catalogue opened in a new tab.</p>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate">Sort by</label>
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-white/80 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent focus:bg-white"
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
        <label className="mb-1.5 block text-xs font-semibold text-slate">Price range (₹)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
            className="w-full rounded-xl border border-line bg-white/80 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:bg-white"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
            className="w-full rounded-xl border border-line bg-white/80 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:bg-white"
          />
        </div>
        <button
          onClick={applyPrice}
          className="mt-2 w-full rounded-xl border border-line bg-white/60 px-2 py-1.5 text-xs font-semibold text-slate hover:bg-white"
        >
          Apply price
        </button>
      </div>

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
