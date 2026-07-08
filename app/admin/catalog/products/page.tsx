'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError } from '@/lib/api';
import {
  useAdminProducts,
  useDeleteProduct,
  type AdminProduct,
} from '@/lib/admin/products';
import { StatusChip } from '@/components/admin/StatusChip';
import CreateProductModal from '@/components/admin/CreateProductModal';

// ── Helpers ───────────────────────────────────────────────────────────────────

function inr(n: unknown): string {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
}

// ── Product row ───────────────────────────────────────────────────────────────

function ProductRow({ product }: { product: AdminProduct }) {
  const deleteProduct = useDeleteProduct();

  const handleDelete = () => {
    if (!confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;
    deleteProduct.mutate(product._id);
  };

  return (
    <div className="grid grid-cols-[1fr_120px_120px_100px_120px] items-center gap-4 border-b border-line px-5 py-3 hover:bg-white/50 transition-colors">
      <div className="min-w-0">
        <Link
          href={`/admin/catalog/products/${product.slug}`}
          className="text-sm font-medium text-ink hover:underline truncate block"
        >
          {product.name}
        </Link>
        <p className="text-xs text-muted truncate font-jbmono">{product.slug}</p>
      </div>

      <span className="text-sm text-slate">{inr(product.minPrice)}</span>

      <div>
        <StatusChip
          status={product.isActive === false ? 'inactive' : 'active'}
          label={product.isActive === false ? 'Inactive' : 'Active'}
        />
      </div>

      <div>
        {product.isFeatured && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            Featured
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/admin/catalog/products/${product.slug}`}
          className="rounded border border-line px-3 py-1 text-xs text-slate hover:bg-white/60"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleteProduct.isPending}
          className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {deleteProduct.isPending ? '…' : 'Delete'}
        </button>
        {deleteProduct.error && (
          <span className="text-xs text-red-600">
            {deleteProduct.error instanceof ApiError
              ? deleteProduct.error.message
              : 'Error'}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Inner table (needs useSearchParams — must be inside Suspense) ─────────────

function ProductsTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);

  const pageParam = Number(searchParams.get('page') ?? '1');
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const { data, isLoading, isError, error } = useAdminProducts(page);

  const products = data?.products ?? [];
  const pagination = data?.pagination;

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/admin/catalog/products?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate">
          {typeof pagination?.total === 'number'
            ? `${pagination.total.toLocaleString('en-IN')} products`
            : ''}
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-colors"
        >
          + New product
        </button>
      </div>

      {showCreate && <CreateProductModal onClose={() => setShowCreate(false)} />}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] divide-y divide-line">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 w-48 rounded bg-black/5" />
              <div className="h-4 w-20 rounded bg-black/5" />
              <div className="h-5 w-16 rounded-full bg-black/5" />
              <div className="h-5 w-16 rounded bg-black/5" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : 'Failed to load products. Please try refreshing.'}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && products.length === 0 && (
        <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-10 text-center">
          <p className="text-sm text-slate">No products found.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && products.length > 0 && (
        <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_120px_100px_120px] gap-4 bg-white/50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate">
            <span>Product</span>
            <span>Min Price</span>
            <span>Status</span>
            <span>Featured</span>
            <span>Actions</span>
          </div>
          {products.map((p) => (
            <ProductRow key={p._id} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage(pagination.page + 1)}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Products</h1>
        <p className="mt-1 text-sm text-slate">Manage catalog products and variants</p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-8 text-center text-sm text-slate animate-pulse">
            Loading products…
          </div>
        }
      >
        <ProductsTable />
      </Suspense>
    </div>
  );
}
