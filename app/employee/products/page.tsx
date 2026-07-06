'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useEmployeeProducts, useEmployeeSearch } from '@/lib/employee/catalog';
import { glass, primaryBtn, secondaryBtn, input, eyebrow, pageWrap } from '@/components/employee/ui';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

const LIMIT = 12;

export default function EmployeeProductsPage() {
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [inputValue, setInputValue] = useState('');

  const isSearching = q.trim().length > 0;

  const listQuery = useEmployeeProducts({ sort, page, limit: LIMIT });
  const searchQuery = useEmployeeSearch(q, page);

  const activeQuery = isSearching ? searchQuery : listQuery;
  const products = activeQuery.data?.products ?? [];
  const pagination = activeQuery.data?.pagination ?? null;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQ(inputValue.trim());
    setPage(1);
  }

  function clearSearch() {
    setQ('');
    setInputValue('');
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-[#eef0f8]">
      <div className={pageWrap}>
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={eyebrow}>CATALOG</p>
            <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink">Product Catalog</h1>
            {pagination && pagination.total > 0 && (
              <p className="mt-1 text-sm text-muted">
                {pagination.total} product{pagination.total !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search products…"
                className={`${input} sm:w-64`}
              />
              <button
                type="submit"
                className={`${primaryBtn} px-3 py-1.5 text-sm`}
              >
                Search
              </button>
              {isSearching && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className={`${secondaryBtn} px-3 py-1.5 text-sm`}
                >
                  Clear
                </button>
              )}
            </form>

            {/* Sort (only when not searching) */}
            {!isSearching && (
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className={`${input} w-auto`}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Content */}
        {activeQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`h-64 animate-pulse rounded-[20px] ${glass}`} />
            ))}
          </div>
        ) : activeQuery.isError ? (
          <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[rgba(224,82,77,.3)] bg-[rgba(224,82,77,.06)] py-16 text-center">
            <p className="text-lg font-medium text-[#e0524d]">Failed to load products</p>
            <p className="mt-1 text-sm text-[#e0524d]/70">
              {activeQuery.error instanceof Error ? activeQuery.error.message : 'Unknown error'}
            </p>
            <button
              onClick={() => activeQuery.refetch()}
              className={`${primaryBtn} mt-4 px-4 py-2 text-sm`}
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className={`rounded-[20px] border-dashed py-16 text-center ${glass}`}>
            <p className="text-lg font-medium text-slate">
              {isSearching ? `No results for "${q}"` : 'No products available'}
            </p>
            {isSearching && (
              <button
                onClick={clearSearch}
                className="mt-4 text-sm text-indigo hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  hrefBase="/employee/products"
                />
              ))}
            </div>

            {/* Pagination (list mode only) */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={`${secondaryBtn} px-3 py-1.5 text-sm`}
                >
                  Previous
                </button>
                <span className="text-sm text-muted">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages}
                  className={`${secondaryBtn} px-3 py-1.5 text-sm`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
