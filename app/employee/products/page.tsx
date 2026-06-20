'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useEmployeeProducts, useEmployeeSearch } from '@/lib/employee/catalog';

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
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Product Catalog</h1>
            {pagination && pagination.total > 0 && (
              <p className="mt-1 text-sm text-zinc-500">
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
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
              {isSearching && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
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
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div key={i} className="animate-pulse rounded-lg border border-zinc-200 bg-white h-64" />
            ))}
          </div>
        ) : activeQuery.isError ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-red-300 bg-red-50 py-16 text-center">
            <p className="text-lg font-medium text-red-600">Failed to load products</p>
            <p className="mt-1 text-sm text-red-400">
              {activeQuery.error instanceof Error ? activeQuery.error.message : 'Unknown error'}
            </p>
            <button
              onClick={() => activeQuery.refetch()}
              className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white py-16 text-center">
            <p className="text-lg font-medium text-zinc-600">
              {isSearching ? `No results for "${q}"` : 'No products available'}
            </p>
            {isSearching && (
              <button
                onClick={clearSearch}
                className="mt-4 text-sm text-blue-600 hover:underline"
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
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 disabled:opacity-40 hover:bg-zinc-100 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-zinc-500">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 disabled:opacity-40 hover:bg-zinc-100 transition-colors"
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
