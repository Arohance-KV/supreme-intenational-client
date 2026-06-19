'use client';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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

interface FiltersProps {
  currentParams: Record<string, string | string[] | undefined>;
}

export default function Filters({ currentParams }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('category') ?? '';

  useEffect(() => {
    async function load() {
      try {
        const [cats, attrs] = await Promise.all([
          apiFetch<CategoryItem[]>('/catalog/categories'),
          apiFetch<Attribute[]>(
            selectedCategory
              ? `/catalog/attributes?category=${encodeURIComponent(selectedCategory)}`
              : '/catalog/attributes'
          ),
        ]);
        setCategories(cats);
        setAttributes(attrs.filter((a) => a.values.some((v) => v.isActive)));
      } catch {
        // Silently handle errors — filters are non-critical
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCategory]);

  function buildParams(overrides: Record<string, string | null>): string {
    const current = new URLSearchParams(searchParams.toString());

    // Reset page when filters change
    current.delete('page');

    for (const [key, value] of Object.entries(overrides)) {
      if (value === null || value === '') {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    }
    return current.toString();
  }

  function onCategoryChange(slug: string) {
    // When category changes, clear attribute filters
    const current = new URLSearchParams(searchParams.toString());
    // Remove all attribute filter keys (non-standard keys)
    const knownKeys = new Set(['category', 'sort', 'page', 'limit', 'minPrice', 'maxPrice']);
    for (const key of Array.from(current.keys())) {
      if (!knownKeys.has(key)) current.delete(key);
    }
    current.delete('page');

    if (slug) {
      current.set('category', slug);
    } else {
      current.delete('category');
    }
    router.push('/products?' + current.toString());
  }

  function onAttributeChange(attributeSlug: string, valueSlug: string, checked: boolean) {
    const params = buildParams({ [attributeSlug]: checked ? valueSlug : null });
    router.push('/products?' + params);
  }

  function onSortChange(sort: string) {
    const params = buildParams({ sort: sort || null });
    router.push('/products?' + params);
  }

  function onClear() {
    router.push('/products');
  }

  const selectedSort = searchParams.get('sort') ?? '';
  const hasFilters =
    searchParams.get('category') ||
    searchParams.get('sort') ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice');

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">Filters</h2>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear all
          </button>
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

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-zinc-700 mb-1">Category</label>
        {loading ? (
          <div className="h-24 animate-pulse rounded bg-zinc-100" />
        ) : categories.length === 0 ? (
          <p className="text-xs text-zinc-400">No categories</p>
        ) : (
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => onCategoryChange('')}
                className={`text-sm w-full text-left px-1 py-0.5 rounded ${
                  !selectedCategory
                    ? 'font-semibold text-blue-600'
                    : 'text-zinc-700 hover:text-blue-600'
                }`}
              >
                All
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <button
                  onClick={() => onCategoryChange(cat.slug)}
                  className={`text-sm w-full text-left px-1 py-0.5 rounded ${
                    selectedCategory === cat.slug
                      ? 'font-semibold text-blue-600'
                      : 'text-zinc-700 hover:text-blue-600'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Attribute Filters */}
      {!loading && attributes.length > 0 && (
        <div className="space-y-4">
          {attributes.map((attr) => {
            const activeValues = attr.values.filter((v) => v.isActive);
            if (activeValues.length === 0) return null;
            const selectedValue = searchParams.get(attr.slug) ?? '';

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
                        checked={selectedValue === val.slug}
                        onChange={(e) =>
                          onAttributeChange(attr.slug, val.slug, e.target.checked)
                        }
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
        </div>
      )}
    </div>
  );
}
