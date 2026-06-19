import { Suspense } from 'react';
import { getProducts } from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  // Build pre-encoded query string from supported params
  const params = new URLSearchParams();

  const category = typeof sp.category === 'string' ? sp.category : undefined;
  const sort = typeof sp.sort === 'string' ? sp.sort : undefined;
  const page = typeof sp.page === 'string' ? sp.page : undefined;
  const limit = typeof sp.limit === 'string' ? sp.limit : undefined;
  const minPrice = typeof sp.minPrice === 'string' ? sp.minPrice : undefined;
  const maxPrice = typeof sp.maxPrice === 'string' ? sp.maxPrice : undefined;

  if (category) params.set('category', category);
  if (sort) params.set('sort', sort);
  if (page) params.set('page', page);
  if (limit) params.set('limit', limit);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);

  // Pass through any attribute filters (keys not in the known set)
  const knownKeys = new Set(['category', 'sort', 'page', 'limit', 'minPrice', 'maxPrice']);
  for (const [key, value] of Object.entries(sp)) {
    if (!knownKeys.has(key) && typeof value === 'string') {
      params.set(key, value);
    }
  }

  const qs = params.toString();

  let result: Awaited<ReturnType<typeof getProducts>>;
  try {
    result = await getProducts(qs ? '?' + qs : undefined);
  } catch {
    result = { products: [], pagination: { total: 0, page: 1, limit: 12, pages: 0 } };
  }

  const { products, pagination } = result;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
          {pagination.total > 0 && (
            <p className="mt-1 text-sm text-zinc-500">
              {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <Suspense fallback={<div className="animate-pulse rounded-lg bg-zinc-200 h-64" />}>
              <Filters currentParams={sp} />
            </Suspense>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white py-16 text-center">
                <p className="text-lg font-medium text-zinc-600">No products match</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Try adjusting your filters or check back later.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination info */}
                {pagination.pages > 1 && (
                  <div className="mt-6 flex items-center justify-between text-sm text-zinc-500">
                    <span>
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <span>{pagination.total} total products</span>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
