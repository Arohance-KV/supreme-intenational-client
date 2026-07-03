'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError } from '@/lib/api';
import {
  useAdminProducts,
  useCreateProduct,
  useDeleteProduct,
  type CreateProductBody,
  type AdminProduct,
} from '@/lib/admin/products';
import { useCategories } from '@/lib/admin/taxonomy';
import { useCompanies } from '@/lib/admin/companies';
import { StatusChip } from '@/components/admin/StatusChip';

// ── Helpers ───────────────────────────────────────────────────────────────────

function inr(n: unknown): string {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
}

// ── Create product modal ──────────────────────────────────────────────────────

function CreateProductModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: companiesData, isLoading: companiesLoading } = useCompanies(1);
  const companies = companiesData?.items ?? [];
  const [form, setForm] = useState<CreateProductBody>({
    name: '',
    categoryId: '',
    images: [],
    description: '',
    visibility: 'public',
    ownerCompanyId: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateProductBody = {
      ...form,
      ownerCompanyId: form.visibility === 'company' ? form.ownerCompanyId : undefined,
    };
    createProduct.mutate(payload, {
      onSuccess: (product) => {
        // Navigate to the new product detail page (use slug)
        router.push(`/admin/catalog/products/${product.slug}`);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Create product</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cp-name" className="mb-1 block text-sm font-medium text-zinc-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="cp-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label htmlFor="cp-categoryId" className="mb-1 block text-sm font-medium text-zinc-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="cp-categoryId"
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="" disabled>
                {catsLoading ? 'Loading categories…' : 'Select category…'}
              </option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cp-description" className="mb-1 block text-sm font-medium text-zinc-700">
              Description
            </label>
            <textarea
              id="cp-description"
              rows={3}
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label htmlFor="cp-visibility" className="mb-1 block text-sm font-medium text-zinc-700">
              Visibility
            </label>
            <select
              id="cp-visibility"
              value={form.visibility ?? 'public'}
              onChange={(e) =>
                setForm({ ...form, visibility: e.target.value as 'public' | 'company' })
              }
              className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="public">Public</option>
              <option value="company">Company</option>
            </select>
          </div>

          {form.visibility === 'company' && (
            <div>
              <label htmlFor="cp-ownerCompanyId" className="mb-1 block text-sm font-medium text-zinc-700">
                Owner company <span className="text-red-500">*</span>
              </label>
              <select
                id="cp-ownerCompanyId"
                required={form.visibility === 'company'}
                value={form.ownerCompanyId ?? ''}
                onChange={(e) => setForm({ ...form, ownerCompanyId: e.target.value })}
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                <option value="" disabled>
                  {companiesLoading ? 'Loading companies…' : 'Select company…'}
                </option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {createProduct.error && (
            <p className="text-sm text-red-600">
              {createProduct.error instanceof ApiError
                ? createProduct.error.message
                : 'Failed to create product'}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProduct.isPending}
              className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {createProduct.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Product row ───────────────────────────────────────────────────────────────

function ProductRow({ product }: { product: AdminProduct }) {
  const deleteProduct = useDeleteProduct();

  const handleDelete = () => {
    if (!confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;
    deleteProduct.mutate(product._id);
  };

  return (
    <div className="grid grid-cols-[1fr_120px_120px_100px_120px] items-center gap-4 border-b border-zinc-100 px-5 py-3 hover:bg-zinc-50 transition-colors">
      <div className="min-w-0">
        <Link
          href={`/admin/catalog/products/${product.slug}`}
          className="text-sm font-medium text-zinc-900 hover:underline truncate block"
        >
          {product.name}
        </Link>
        <p className="text-xs text-zinc-400 truncate font-mono">{product.slug}</p>
      </div>

      <span className="text-sm text-zinc-700">{inr(product.minPrice)}</span>

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
          className="rounded border border-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
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
        <p className="text-sm text-zinc-500">
          {typeof pagination?.total === 'number'
            ? `${pagination.total.toLocaleString('en-IN')} products`
            : ''}
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          + New product
        </button>
      </div>

      {showCreate && <CreateProductModal onClose={() => setShowCreate(false)} />}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 w-48 rounded bg-zinc-200" />
              <div className="h-4 w-20 rounded bg-zinc-200" />
              <div className="h-5 w-16 rounded-full bg-zinc-200" />
              <div className="h-5 w-16 rounded bg-zinc-200" />
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
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
          <p className="text-sm text-zinc-500">No products found.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && products.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_120px_100px_120px] gap-4 bg-zinc-50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
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
          <p className="text-xs text-zinc-500">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
              className="rounded border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage(pagination.page + 1)}
              className="rounded border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
        <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage catalog products and variants</p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 animate-pulse">
            Loading products…
          </div>
        }
      >
        <ProductsTable />
      </Suspense>
    </div>
  );
}
