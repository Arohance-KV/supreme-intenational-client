'use client';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import DcPhoto from '@/components/DcPhoto';
import { useMyProducts, useSetProductActive } from '@/lib/seller/products';
import { useImportSubmissions } from '@/lib/seller/submissions';
import { CSV_TEMPLATE } from '@/lib/admin/products';
import CsvImportButton from '@/components/CsvImportButton';

const GRID = 'grid grid-cols-[minmax(150px,1.8fr)_.8fr_1.1fr_auto] items-center gap-4';

function ProductRow({ product }: { product: import('@/lib/seller/products').SellerProduct }) {
  const toggle = useSetProductActive(product._id);
  const handleToggle = () => toggle.mutate(!product.isActive);

  return (
    <div className={`${GRID} border-b border-line px-4 py-3.5 text-[13px] last:border-0`}>
      <span className="flex min-w-0 items-center gap-3">
        <DcPhoto seed={product.slug} className="h-10 w-10 flex-none rounded-[10px]" />
        <span className="min-w-0">
          <span className="block truncate font-bold text-ink">{product.name}</span>
          {product.category && (
            <span className="font-jbmono block truncate text-[11px] text-muted">{product.category}</span>
          )}
        </span>
      </span>

      <span>
        <span className="block text-[11px] text-muted">price</span>
        <strong className="text-ink">
          {typeof product.minPrice === 'number' ? `₹ ${product.minPrice.toLocaleString('en-IN')}` : '—'}
        </strong>
      </span>

      <span className="flex items-center gap-2.5">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
            product.isActive ? 'text-[#1a8f5a] bg-[rgba(31,170,107,.12)]' : 'text-slate bg-[rgba(91,93,122,.12)]'
          }`}
        >
          {product.isActive ? 'Live' : 'Suspended'}
        </span>
        <button
          onClick={handleToggle}
          disabled={toggle.isPending}
          aria-label={product.isActive ? 'Deactivate product' : 'Activate product'}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-60 ${
            product.isActive ? 'bg-accent' : 'bg-line'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              product.isActive ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </span>

      <span className="flex items-center gap-2 justify-self-end">
        {toggle.error && (
          <span className="text-[11px] text-[#d8524d]">
            {toggle.error instanceof ApiError ? toggle.error.message : 'Error'}
          </span>
        )}
        <Link
          href={`/seller/products/${product._id}`}
          className="rounded-[9px] border border-[rgba(42,43,106,.12)] bg-[rgba(42,43,106,.07)] px-3 py-1.5 text-[12px] font-semibold text-indigo no-underline hover:bg-[rgba(42,43,106,.12)]"
        >
          Edit
        </Link>
      </span>
    </div>
  );
}

export default function SellerProductsPage() {
  const { data, isLoading, error } = useMyProducts();
  const importSubmissions = useImportSubmissions();
  const products = data?.products ?? [];

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-7">
      <div className="mb-6 flex items-center justify-between gap-5">
        <div>
          <h1 className="mb-0.5 text-[26px] font-extrabold tracking-[-.02em] text-ink">My Products</h1>
          <div className="text-[13px] text-slate">Manage and toggle your live catalogue listings.</div>
        </div>
        <div className="flex items-center gap-3">
          <CsvImportButton
            importFn={(f) => importSubmissions.mutateAsync(f)}
            templateCsv={CSV_TEMPLATE}
            templateName="products-template.csv"
          />
          <Link
            href="/seller/submissions/new"
            className="flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#176054,#179b8e)] px-[18px] py-3 text-sm font-bold text-white no-underline shadow-[0_10px_24px_rgba(23,155,142,.3)]"
          >
            ＋ Add Product
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-[20px] bg-white/55" />
      ) : error ? (
        <div className="rounded-[20px] border border-white/80 bg-white/55 p-6 text-sm text-[#d8524d] backdrop-blur-[16px]">
          {error instanceof ApiError ? error.message : 'Failed to load products.'}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-[20px] border border-white/80 bg-white/55 px-6 py-12 text-center backdrop-blur-[16px]">
          <p className="mb-4 text-sm text-slate">No products yet. Submit a product for review to get started.</p>
          <Link
            href="/seller/submissions/new"
            className="inline-flex items-center rounded-xl bg-[linear-gradient(135deg,#176054,#179b8e)] px-4 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_8px_22px_rgba(23,155,142,.3)]"
          >
            New submission
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[20px] border border-white/80 bg-white/[.62] p-2 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]">
          <div className="min-w-[560px]">
            <div className={`${GRID} font-jbmono border-b border-line px-4 pb-3 pt-2 text-[10px] uppercase tracking-[.05em] text-muted`}>
              <span>Product</span>
              <span>Price</span>
              <span>Status</span>
              <span className="justify-self-end">Actions</span>
            </div>
            {products.map((p) => (
              <ProductRow key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {data?.pagination && data.pagination.pages > 1 && (
        <p className="mt-4 text-center text-xs text-muted">
          Page {data.pagination.page} of {data.pagination.pages}
        </p>
      )}
    </div>
  );
}
