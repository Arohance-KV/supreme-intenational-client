'use client';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { useMyProducts, useSetProductActive } from '@/lib/seller/products';

function ProductRow({ product }: { product: import('@/lib/seller/products').SellerProduct }) {
  const toggle = useSetProductActive(product._id);

  const handleToggle = () => {
    toggle.mutate(!product.isActive);
  };

  return (
    <div className="flex items-center justify-between rounded border border-zinc-200 bg-white px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{product.name}</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          ₹{product.minPrice.toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            product.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-zinc-100 text-zinc-500'
          }`}
        >
          {product.isActive ? 'Active' : 'Suspended'}
        </span>

        <button
          onClick={handleToggle}
          disabled={toggle.isPending}
          aria-label={product.isActive ? 'Deactivate product' : 'Activate product'}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-60 ${
            product.isActive ? 'bg-blue-600' : 'bg-zinc-300'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              product.isActive ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>

        {toggle.error && (
          <span className="text-xs text-red-600">
            {toggle.error instanceof ApiError ? toggle.error.message : 'Error'}
          </span>
        )}

        <Link
          href={`/seller/products/${product._id}`}
          className="rounded border border-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}

export default function SellerProductsPage() {
  const { data, isLoading, error } = useMyProducts();

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-sm text-zinc-500">Loading products…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-sm text-red-600">
          {error instanceof ApiError ? error.message : 'Failed to load products.'}
        </p>
      </main>
    );
  }

  const products = data?.products ?? [];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">My Products</h1>
      </div>

      {products.length === 0 ? (
        <div className="rounded border border-zinc-200 bg-white px-6 py-12 text-center">
          <p className="text-sm text-zinc-500 mb-4">
            No products yet. Submit a product for review to get started.
          </p>
          <Link
            href="/seller/submissions/new"
            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New submission
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <ProductRow key={p._id} product={p} />
          ))}
        </div>
      )}

      {data?.pagination && data.pagination.pages > 1 && (
        <p className="mt-4 text-xs text-zinc-400 text-center">
          Page {data.pagination.page} of {data.pagination.pages}
        </p>
      )}
    </main>
  );
}
