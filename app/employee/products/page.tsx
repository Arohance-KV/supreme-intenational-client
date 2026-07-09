'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useEmployeeProducts, useEmployeeSearch, useEmployeeFilters } from '@/lib/employee/catalog';
import { glass, primaryBtn, secondaryBtn, input, eyebrow, pageWrap } from '@/components/employee/ui';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const LIMIT = 12;

// ── Filter sidebar ────────────────────────────────────────────────────────────

function FilterSidebar({
  categories,
  bounds,
  selCats,
  toggleCat,
  lo,
  hi,
  setLo,
  setHi,
  hasFilters,
  onClear,
}: {
  categories: { _id: string; name: string }[];
  bounds: { min: number; max: number };
  selCats: Set<string>;
  toggleCat: (id: string) => void;
  lo: number;
  hi: number;
  setLo: (n: number) => void;
  setHi: (n: number) => void;
  hasFilters: boolean;
  onClear: () => void;
}) {
  const hasBounds = bounds.max > bounds.min;
  return (
    <div className={`space-y-5 rounded-[20px] p-5 ${glass}`}>
      <div className="flex items-center justify-between">
        <h2 className="font-jbmono text-[11px] font-bold uppercase tracking-[.14em] text-muted">Filters</h2>
        {hasFilters && (
          <button onClick={onClear} className="text-xs font-semibold text-accent hover:underline">
            Clear all
          </button>
        )}
      </div>

      {hasBounds && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate">Price range (₹)</label>
          <div className="mb-2 flex justify-between text-xs font-semibold text-ink">
            <span>₹{lo.toLocaleString('en-IN')}</span>
            <span>₹{hi.toLocaleString('en-IN')}</span>
          </div>
          <div className="dual-range">
            <div className="track" />
            <div
              className="fill"
              style={{
                left: `${((lo - bounds.min) / (bounds.max - bounds.min)) * 100}%`,
                width: `${((hi - lo) / (bounds.max - bounds.min)) * 100}%`,
              }}
            />
            <input
              type="range" min={bounds.min} max={bounds.max} value={lo}
              onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
              aria-label="Minimum price"
            />
            <input
              type="range" min={bounds.min} max={bounds.max} value={hi}
              onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
              aria-label="Maximum price"
            />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate">Categories</label>
        {categories.length === 0 ? (
          <p className="text-xs text-muted">No categories</p>
        ) : (
          <ul className="space-y-1.5">
            {categories.map((c) => (
              <li key={c._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`cat-${c._id}`}
                  checked={selCats.has(c._id)}
                  onChange={() => toggleCat(c._id)}
                  className="rounded border-line accent-accent"
                />
                <label htmlFor={`cat-${c._id}`} className="cursor-pointer text-sm text-slate">{c.name}</label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function EmployeeProductsPage() {
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selCats, setSelCats] = useState<Set<string>>(new Set());
  const [loRaw, setLoRaw] = useState<number | null>(null);
  const [hiRaw, setHiRaw] = useState<number | null>(null);

  const isSearching = q.trim().length > 0;

  const { data: filters } = useEmployeeFilters();
  const bounds = filters?.priceRange ?? { min: 0, max: 0 };
  const categories = filters?.categories ?? [];
  const lo = loRaw ?? bounds.min;
  const hi = hiRaw ?? bounds.max;

  const minPrice = lo > bounds.min ? lo : undefined;
  const maxPrice = hi < bounds.max ? hi : undefined;
  const hasFilters = selCats.size > 0 || minPrice != null || maxPrice != null;

  const listQuery = useEmployeeProducts({
    categoryIds: [...selCats],
    minPrice,
    maxPrice,
    sort,
    page,
    limit: LIMIT,
  });
  const searchQuery = useEmployeeSearch(q, page);

  const activeQuery = isSearching ? searchQuery : listQuery;
  const products = activeQuery.data?.products ?? [];
  const pagination = activeQuery.data?.pagination ?? null;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQ(inputValue.trim());
    setPage(1);
  }
  function clearSearch() { setQ(''); setInputValue(''); setPage(1); }
  function toggleCat(id: string) {
    setSelCats((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setPage(1);
  }
  function clearFilters() { setSelCats(new Set()); setLoRaw(null); setHiRaw(null); setPage(1); }

  const grid = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} hrefBase="/employee/products" showAddToCart={false} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef0f8]">
      <div className={pageWrap}>
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={eyebrow}>CATALOG</p>
            <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink">Product Catalog</h1>
            {pagination && pagination.total > 0 && (
              <p className="mt-1 text-sm text-muted">
                {pagination.total} product{pagination.total !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search products…"
                className={`${input} sm:w-60`}
              />
              <button type="submit" className={`${primaryBtn} px-3 py-1.5 text-sm`}>Search</button>
              {isSearching && (
                <button type="button" onClick={clearSearch} className={`${secondaryBtn} px-3 py-1.5 text-sm`}>Clear</button>
              )}
            </form>
            {!isSearching && (
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className={`${input} !w-auto`}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar (browse mode only) */}
          {!isSearching && (
            <aside className="w-full shrink-0 lg:w-72">
              <FilterSidebar
                categories={categories}
                bounds={bounds}
                selCats={selCats}
                toggleCat={toggleCat}
                lo={lo}
                hi={hi}
                setLo={(n) => { setLoRaw(n); setPage(1); }}
                setHi={(n) => { setHiRaw(n); setPage(1); }}
                hasFilters={hasFilters}
                onClear={clearFilters}
              />
            </aside>
          )}

          {/* Results */}
          <div className="flex-1">
            {activeQuery.isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={`h-64 animate-pulse rounded-[20px] ${glass}`} />
                ))}
              </div>
            ) : activeQuery.isError ? (
              <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[rgba(224,82,77,.3)] bg-[rgba(224,82,77,.06)] py-16 text-center">
                <p className="text-lg font-medium text-[#e0524d]">Failed to load products</p>
                <button onClick={() => activeQuery.refetch()} className={`${primaryBtn} mt-4 px-4 py-2 text-sm`}>Retry</button>
              </div>
            ) : products.length === 0 ? (
              <div className={`rounded-[20px] py-16 text-center ${glass}`}>
                <p className="text-lg font-medium text-slate">
                  {isSearching ? `No results for "${q}"` : hasFilters ? 'No products match your filters' : 'No products available'}
                </p>
                {isSearching ? (
                  <button onClick={clearSearch} className="mt-4 text-sm text-indigo hover:underline">Clear search</button>
                ) : hasFilters ? (
                  <button onClick={clearFilters} className="mt-4 text-sm text-indigo hover:underline">Clear filters</button>
                ) : null}
              </div>
            ) : (
              <>
                {grid}
                {pagination && pagination.pages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className={`${secondaryBtn} px-3 py-1.5 text-sm`}>Previous</button>
                    <span className="text-sm text-muted">Page {pagination.page} of {pagination.pages}</span>
                    <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages} className={`${secondaryBtn} px-3 py-1.5 text-sm`}>Next</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
