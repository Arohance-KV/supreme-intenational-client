'use client';

import { useEffect, useRef, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { EMPLOYEE_CART } from '@/components/AddToCartMini';
import { useEmployeeProductsInfinite, useEmployeeSearchInfinite, useEmployeeFilters, type EmployeeAttribute } from '@/lib/employee/catalog';
import { glass, primaryBtn, secondaryBtn, input, eyebrow } from '@/components/employee/ui';

// Full-bleed wrapper matching the B2B /products page (wider than the shared pageWrap).
const wideWrap = 'mx-auto max-w-[1600px] px-4 py-8 font-display sm:px-6 lg:px-8';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const LIMIT = 12;

// Bottom sheet — mobile only, sits above the portal tab bar.
function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-y-auto rounded-t-[22px] border-t border-white/85 bg-[#eef0f8] p-4 pb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="cursor-pointer border-0 bg-transparent px-2 text-lg leading-none text-slate">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Filter sidebar ────────────────────────────────────────────────────────────

function FilterSidebar({
  categories,
  bounds,
  selCats,
  toggleCat,
  attributes,
  selAttrs,
  toggleAttr,
  lo,
  hi,
  setLo,
  setHi,
  hasFilters,
  onClear,
  idPrefix,
}: {
  categories: { _id: string; name: string }[];
  bounds: { min: number; max: number };
  selCats: Set<string>;
  toggleCat: (id: string) => void;
  attributes: EmployeeAttribute[];
  selAttrs: Record<string, Set<string>>;
  toggleAttr: (slug: string, value: string) => void;
  lo: number;
  hi: number;
  setLo: (n: number) => void;
  setHi: (n: number) => void;
  hasFilters: boolean;
  onClear: () => void;
  // The desktop aside and the mobile sheet both mount a sidebar, so their input
  // ids must not collide or the labels drive the wrong (hidden) checkbox.
  idPrefix: string;
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
                  id={`${idPrefix}-cat-${c._id}`}
                  checked={selCats.has(c._id)}
                  onChange={() => toggleCat(c._id)}
                  className="rounded border-line accent-accent"
                />
                <label htmlFor={`${idPrefix}-cat-${c._id}`} className="cursor-pointer text-sm text-slate">{c.name}</label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Attribute filters (multi-select) */}
      {attributes.map((attr) => {
        const activeValues = attr.values.filter((v) => v.isActive);
        if (activeValues.length === 0) return null;
        const sel = selAttrs[attr.slug] ?? new Set<string>();
        return (
          <div key={attr._id}>
            <label className="mb-1.5 block text-xs font-semibold text-slate">
              {attr.name}{attr.unit ? ` (${attr.unit})` : ''}
            </label>
            <ul className="space-y-1.5">
              {activeValues.map((val) => (
                <li key={val._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`${idPrefix}-${attr.slug}-${val.slug}`}
                    checked={sel.has(val.slug)}
                    onChange={() => toggleAttr(attr.slug, val.slug)}
                    className="rounded border-line accent-accent"
                  />
                  <label htmlFor={`${idPrefix}-${attr.slug}-${val.slug}`} className="cursor-pointer text-sm text-slate">{val.label}</label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default function EmployeeProductsPage() {
  const [sort, setSort] = useState('rating');
  const [q, setQ] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selCats, setSelCats] = useState<Set<string>>(new Set());
  const [selAttrs, setSelAttrs] = useState<Record<string, Set<string>>>({});
  const [loRaw, setLoRaw] = useState<number | null>(null);
  const [hiRaw, setHiRaw] = useState<number | null>(null);

  const isSearching = q.trim().length > 0;

  // Search-as-you-type: commit the box to the active query 350ms after typing stops,
  // so we don't fire a request per keystroke. Enter/Search button still search instantly.
  useEffect(() => {
    const id = setTimeout(() => {
      setQ(inputValue.trim());
    }, 350);
    return () => clearTimeout(id);
  }, [inputValue]);

  const { data: filters } = useEmployeeFilters();
  const bounds = filters?.priceRange ?? { min: 0, max: 0 };
  const categories = filters?.categories ?? [];
  const attributes = filters?.attributes ?? [];
  const lo = loRaw ?? bounds.min;
  const hi = hiRaw ?? bounds.max;

  const minPrice = lo > bounds.min ? lo : undefined;
  const maxPrice = hi < bounds.max ? hi : undefined;
  // Record<slug, Set> → Record<slug, string[]>, dropping empty selections.
  const attributeFilters = Object.fromEntries(
    Object.entries(selAttrs).filter(([, v]) => v.size > 0).map(([k, v]) => [k, [...v]]),
  );
  const hasAttrs = Object.keys(attributeFilters).length > 0;
  const hasFilters = selCats.size > 0 || minPrice != null || maxPrice != null || hasAttrs;

  const listQuery = useEmployeeProductsInfinite(
    { categoryIds: [...selCats], minPrice, maxPrice, attributeFilters, sort, limit: LIMIT },
    !isSearching,
  );
  const searchQuery = useEmployeeSearchInfinite(q);

  const activeQuery = isSearching ? searchQuery : listQuery;
  const products = activeQuery.data?.pages.flatMap((pg) => pg.products) ?? [];
  const total = activeQuery.data?.pages[0]?.pagination.total ?? 0;

  // Scroll-to-load: the sentinel sits below the grid and pulls the next page in.
  const sentinel = useRef<HTMLDivElement>(null);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = activeQuery;
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !isFetchingNextPage) fetchNextPage(); },
      { rootMargin: '400px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, products.length]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQ(inputValue.trim());
  }
  function clearSearch() { setQ(''); setInputValue(''); }
  function toggleCat(id: string) {
    setSelCats((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAttr(slug: string, value: string) {
    setSelAttrs((prev) => {
      const next = new Set(prev[slug] ?? []);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...prev, [slug]: next };
    });
  }
  function clearFilters() { setSelCats(new Set()); setSelAttrs({}); setLoRaw(null); setHiRaw(null); }

  const [sheet, setSheet] = useState<'sort' | 'filter' | null>(null);

  const grid = (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} hrefBase="/employee/products" cartTarget={EMPLOYEE_CART} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef0f8]">
      <div className={wideWrap}>
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={eyebrow}>CATALOG</p>
            <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink">Product Catalog</h1>
            {total > 0 && (
              <p className="mt-1 text-sm text-muted">
                {total} product{total !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search products…"
                className={`${input} min-w-0 flex-1 sm:w-60 sm:flex-none`}
              />
              <button type="submit" className={`${primaryBtn} px-3 py-1.5 text-sm`}>Search</button>
              {isSearching && (
                <button type="button" onClick={clearSearch} className={`${secondaryBtn} px-3 py-1.5 text-sm`}>Clear</button>
              )}
            </form>
            {!isSearching && (
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={`${input} !w-auto hidden lg:block`}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar (browse mode only) */}
          {!isSearching && (
            <aside className="hidden w-full shrink-0 lg:block lg:w-72">
              <FilterSidebar
                idPrefix="side"
                categories={categories}
                bounds={bounds}
                selCats={selCats}
                toggleCat={toggleCat}
                attributes={attributes}
                selAttrs={selAttrs}
                toggleAttr={toggleAttr}
                lo={lo}
                hi={hi}
                setLo={(n) => setLoRaw(n)}
                setHi={(n) => setHiRaw(n)}
                hasFilters={hasFilters}
                onClear={clearFilters}
              />
            </aside>
          )}

          {/* Results */}
          <div className="flex-1">
            {activeQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={`h-72 animate-pulse rounded-[20px] ${glass}`} />
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
                <div ref={sentinel} className="py-6 text-center text-sm text-muted">
                  {isFetchingNextPage ? 'Loading more…' : hasNextPage ? '' : 'You’ve reached the end.'}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Myntra-style Sort / Filter bar — mobile only, stacked above the tab bar. */}
      {!isSearching && (
        <div className="fixed inset-x-0 bottom-14 z-40 grid grid-cols-2 border-t border-line bg-white/95 backdrop-blur-[14px] md:hidden">
          <button onClick={() => setSheet('sort')} className="cursor-pointer border-0 border-r border-line bg-transparent py-3 text-sm font-semibold text-ink">
            Sort
          </button>
          <button onClick={() => setSheet('filter')} className="cursor-pointer border-0 bg-transparent py-3 text-sm font-semibold text-ink">
            Filter{hasFilters ? ' ·' : ''}
          </button>
        </div>
      )}

      {sheet === 'sort' && (
        <Sheet title="Sort by" onClose={() => setSheet(null)}>
          <div className="flex flex-col">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => { setSort(o.value); setSheet(null); }}
                className={`cursor-pointer rounded-xl border-0 bg-transparent px-3 py-3 text-left text-[15px] ${sort === o.value ? 'bg-white font-bold text-accent' : 'font-medium text-slate'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {sheet === 'filter' && (
        <Sheet title="Filters" onClose={() => setSheet(null)}>
          <FilterSidebar
            idPrefix="sheet"
            categories={categories}
            bounds={bounds}
            selCats={selCats}
            toggleCat={toggleCat}
            attributes={attributes}
            selAttrs={selAttrs}
            toggleAttr={toggleAttr}
            lo={lo}
            hi={hi}
            setLo={setLoRaw}
            setHi={setHiRaw}
            hasFilters={hasFilters}
            onClear={clearFilters}
          />
          <button onClick={() => setSheet(null)} className={`${primaryBtn} mt-4 w-full py-3`}>Show results</button>
        </Sheet>
      )}
    </div>
  );
}
