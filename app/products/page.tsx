import { Suspense } from 'react';
import { getProducts } from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';
import ProductsToolbar from '@/components/ProductsToolbar';
import DcFooter from '@/components/DcFooter';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  // Forward every search param to the API, preserving multi-value (repeated) keys
  // for multi-select categories and attribute filters.
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else if (typeof value === 'string') params.append(key, value);
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
    <main className="font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink selection:bg-[rgba(23,155,142,0.22)]">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(20,155,142,.16),transparent_60%),radial-gradient(50%_45%_at_0%_6%,rgba(58,60,152,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />
      <div className="pointer-events-none fixed -right-[120px] -top-[160px] z-0 h-[500px] w-[500px] animate-blob1 rounded-full bg-[radial-gradient(circle,rgba(20,155,142,.16),transparent_70%)] blur-[20px]" />

      <div className="relative z-[1] mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-jbmono mb-2 text-[11px] uppercase tracking-[.22em] text-accent">Catalogue</div>
            <h1 className="text-[32px] font-extrabold tracking-[-.02em] text-ink">Products</h1>
            {pagination.total > 0 && (
              <p className="mt-1 text-sm text-slate">
                {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          <ProductsToolbar />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full shrink-0 lg:w-72">
            <Suspense fallback={<div className="h-64 animate-pulse rounded-[20px] bg-white/50" />}>
              <Filters />
            </Suspense>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-line bg-white/55 py-16 text-center backdrop-blur-[14px]">
                <p className="text-lg font-bold text-ink">No products match</p>
                <p className="mt-1 text-sm text-muted">
                  Try adjusting your filters or check back later.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination info */}
                {pagination.pages > 1 && (
                  <div className="mt-6 flex items-center justify-between text-sm text-slate">
                    <span>
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <span>{pagination.total} total products</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <DcFooter />
    </main>
  );
}
