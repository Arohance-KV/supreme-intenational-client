'use client';

import { Suspense, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  useReviews,
  useCreateReview,
  useDeleteReview,
  type AdminReview,
  type ReviewProduct,
  type ReviewUser,
  type CreateReviewBody,
} from '@/lib/admin/reviews';
import { useAdminProducts } from '@/lib/admin/products';
import { useCustomers } from '@/lib/admin/customers';
import { fmtDate } from '@/lib/admin/format';
import { useConfirm } from '@/components/ConfirmDialog';
import SearchSelect, { type SearchOption } from '@/components/admin/SearchSelect';

// Debounce a fast-changing value (search box) so we don't fire a query per keystroke.
function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

/** Safely extract product name from populated or raw productId */
function getProductName(productId: AdminReview['productId']): string {
  if (productId && typeof productId === 'object' && 'name' in productId) {
    return (productId as ReviewProduct).name;
  }
  return typeof productId === 'string' ? productId : '—';
}

/** Safely extract author display name */
function getAuthorName(review: AdminReview): string {
  if (review.reviewerName) return review.reviewerName;
  if (review.userId && typeof review.userId === 'object' && 'firstName' in review.userId) {
    const u = review.userId as ReviewUser;
    return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || '—';
  }
  return '—';
}

/** Render star rating as text (★★★★☆ style) */
function StarRating({ rating }: { rating: unknown }) {
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return <span className="text-muted">—</span>;
  }
  const filled = Math.round(rating);
  return (
    <span className="text-amber-500 tracking-tight" aria-label={`${filled} out of 5 stars`}>
      {'★'.repeat(filled)}
      {'☆'.repeat(5 - filled)}
      <span className="ml-1 text-xs text-slate">{rating}/5</span>
    </span>
  );
}

// ── Blank form state ──────────────────────────────────────────────────────────

function blankCreateForm(): CreateReviewBody {
  return {
    productId: '',
    reviewerName: '',
    userId: '',
    rating: 5,
    title: '',
    body: '',
  };
}

// ── Create Review Modal ───────────────────────────────────────────────────────

interface CreateReviewModalProps {
  onClose: () => void;
}

function CreateReviewModal({ onClose }: CreateReviewModalProps) {
  const [form, setForm] = useState<CreateReviewBody>(blankCreateForm());
  const createReview = useCreateReview();

  // Product picker (required) — search products by name, store the picked _id.
  const [product, setProduct] = useState<SearchOption | null>(null);
  const [productQuery, setProductQuery] = useState('');
  const productSearch = useDebounced(productQuery);
  const productsQ = useAdminProducts(1, productSearch || undefined);
  const productOptions: SearchOption[] = (productsQ.data?.products ?? []).map((p) => ({
    id: p._id,
    label: p.name,
    sub: `₹${p.minPrice?.toLocaleString('en-IN') ?? '—'}`,
    image: p.images?.[0] ?? null,
  }));

  // Customer picker (optional) — link the review to a real account by name/email.
  const [customer, setCustomer] = useState<SearchOption | null>(null);
  const [customerQuery, setCustomerQuery] = useState('');
  const customerSearch = useDebounced(customerQuery);
  const customersQ = useCustomers({ search: customerSearch || undefined });
  const customerOptions: SearchOption[] = (customersQ.data?.items ?? []).map((c) => ({
    id: c._id,
    label: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email,
    sub: c.email,
  }));

  function set<K extends keyof CreateReviewBody>(key: K, val: CreateReviewBody[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  const formValid = !!product && form.reviewerName.trim() && form.title.trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    const payload: CreateReviewBody = {
      productId: product.id,
      reviewerName: form.reviewerName.trim(),
      rating: Number(form.rating),
      title: form.title.trim(),
      body: form.body?.trim() || undefined,
      userId: customer?.id || undefined,
    };
    createReview.mutate(payload, { onSuccess: onClose });
  }

  const inputCls =
    'w-full rounded-[11px] border border-line bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent';
  const labelCls = 'mb-1.5 block text-sm font-medium text-slate';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(22,23,58,.45)] p-4 backdrop-blur-[3px] animate-overlay-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="my-8 w-full max-w-lg animate-dialog-in rounded-[20px] border border-white/80 bg-white p-6 shadow-[0_40px_100px_rgba(22,23,58,.35)]">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-[17px] font-extrabold tracking-[-.01em] text-ink">Create review</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-black/5 hover:text-slate"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="mb-5 text-[13px] text-muted">Publish an admin-authored review on a product.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product — searchable */}
          <div>
            <label className={labelCls}>
              Product <span className="text-red-500">*</span>
            </label>
            <SearchSelect
              query={productQuery}
              onQueryChange={setProductQuery}
              options={productOptions}
              selected={product}
              onSelect={setProduct}
              onClear={() => setProduct(null)}
              loading={productsQ.isFetching}
              placeholder="Search products by name…"
              emptyText="No products match"
            />
          </div>

          {/* Rating + Title row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Rating <span className="text-red-500">*</span>
              </label>
              <select
                value={form.rating}
                onChange={(e) => set('rating', parseInt(e.target.value, 10))}
                className={inputCls}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} {'★'.repeat(n)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Title <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Great quality!"
                maxLength={120}
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Reviewer name */}
          <div>
            <label className={labelCls}>
              Reviewer name <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Rahul S."
              maxLength={100}
              value={form.reviewerName}
              onChange={(e) => set('reviewerName', e.target.value)}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-muted">Shown as the review author on the storefront.</p>
          </div>

          {/* Customer link — optional searchable */}
          <div>
            <label className={labelCls}>
              Link to a customer account
              <span className="ml-1 font-normal text-muted">(optional)</span>
            </label>
            <SearchSelect
              query={customerQuery}
              onQueryChange={setCustomerQuery}
              options={customerOptions}
              selected={customer}
              onSelect={(opt) => {
                setCustomer(opt);
                // Pre-fill the author name from the account if it's still empty.
                if (!form.reviewerName.trim()) set('reviewerName', opt.label);
              }}
              onClear={() => setCustomer(null)}
              loading={customersQ.isFetching}
              placeholder="Search customers by name or email…"
              emptyText="No customers match"
            />
          </div>

          {/* Body */}
          <div>
            <label className={labelCls}>
              Review body
              <span className="ml-1 font-normal text-muted">(optional, up to 2000 chars)</span>
            </label>
            <textarea
              rows={4}
              maxLength={2000}
              placeholder="Detailed review text…"
              value={form.body ?? ''}
              onChange={(e) => set('body', e.target.value)}
              className={`${inputCls} resize-y`}
            />
          </div>

          {/* Error */}
          {createReview.error && (
            <p className="text-sm text-red-600">
              {createReview.error instanceof ApiError
                ? createReview.error.message
                : 'Failed to create review'}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[11px] border border-line px-4 py-2.5 text-sm font-semibold text-slate hover:bg-[#f6f7fb]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createReview.isPending || !formValid}
              className="rounded-[11px] bg-gradient-to-br from-indigo to-indigo2 px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {createReview.isPending ? 'Creating…' : 'Create review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Review row ─────────────────────────────────────────────────────────────────

function ReviewRow({ review }: { review: AdminReview }) {
  const { confirm } = useConfirm();
  const deleteReview = useDeleteReview();

  async function handleDelete() {
    const productName = getProductName(review.productId);
    if (
      !(await confirm({
        title: 'Delete review',
        message: `Delete review "${review.title}" for "${productName}"? This will hide it from the storefront.`,
        confirmLabel: 'Delete',
        tone: 'danger',
      }))
    )
      return;
    deleteReview.mutate(review._id);
  }

  const authorName = getAuthorName(review);
  const productName = getProductName(review.productId);

  return (
    <div className="grid grid-cols-[1fr_160px_120px_80px_100px_130px] items-start gap-3 border-b border-line px-5 py-3 hover:bg-white/50 transition-colors">
      {/* Product + title */}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{review.title || '—'}</p>
        <p className="truncate text-xs text-slate mt-0.5">{productName}</p>
        {review.body && (
          <p className="mt-1 text-xs text-slate line-clamp-2">{review.body}</p>
        )}
      </div>

      {/* Author */}
      <div className="min-w-0">
        <p className="truncate text-sm text-slate">{authorName}</p>
        {review.isAdminCreated && (
          <span className="mt-0.5 inline-block rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-700">
            admin
          </span>
        )}
      </div>

      {/* Rating */}
      <div>
        <StarRating rating={review.rating} />
      </div>

      {/* Visibility */}
      <div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            review.isVisible
              ? 'bg-green-100 text-green-700'
              : 'bg-black/5 text-slate'
          }`}
        >
          {review.isVisible ? 'Visible' : 'Hidden'}
        </span>
      </div>

      {/* Date */}
      <span className="text-xs text-slate">{fmtDate(review.createdAt)}</span>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={deleteReview.isPending}
          className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {deleteReview.isPending ? '…' : 'Delete'}
        </button>
        {deleteReview.error && (
          <span className="text-xs text-red-600">
            {deleteReview.error instanceof ApiError
              ? deleteReview.error.message
              : 'Error'}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Pagination controls ───────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onPage: (p: number) => void;
}

function Pagination({ page, pages, total, onPage }: PaginationProps) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-2 text-sm text-slate">
      <span>
        {typeof total === 'number' ? total.toLocaleString('en-IN') : '—'} reviews total
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="rounded border border-line px-3 py-1 text-xs disabled:opacity-40 hover:bg-white/60"
        >
          Previous
        </button>
        <span className="text-xs">
          Page {page} of {pages}
        </span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          className="rounded border border-line px-3 py-1 text-xs disabled:opacity-40 hover:bg-white/60"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ── Reviews table ─────────────────────────────────────────────────────────────

function ReviewsTable() {
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useReviews(page, 20);

  const list = data?.reviews ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate">
          {pagination
            ? `${typeof pagination.total === 'number' ? pagination.total.toLocaleString('en-IN') : '—'} review${pagination.total !== 1 ? 's' : ''}`
            : ''}
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white hover:opacity-95 transition-colors"
        >
          + New review
        </button>
      </div>

      {showCreate && <CreateReviewModal onClose={() => setShowCreate(false)} />}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] divide-y divide-line">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex items-start gap-4 px-5 py-3 animate-pulse">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-black/5" />
                <div className="h-3 w-32 rounded bg-black/5" />
              </div>
              <div className="h-4 w-24 rounded bg-black/5" />
              <div className="h-4 w-20 rounded bg-black/5" />
              <div className="h-5 w-14 rounded-full bg-black/5" />
              <div className="h-5 w-16 rounded bg-black/5" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError
            ? error.message
            : 'Failed to load reviews. Please try refreshing.'}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && list.length === 0 && (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] p-10 text-center">
          <p className="text-sm text-slate">No reviews found.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && list.length > 0 && (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_160px_120px_80px_100px_130px] gap-3 bg-white/50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate">
            <span>Review / Product</span>
            <span>Author</span>
            <span>Rating</span>
            <span>Status</span>
            <span>Date</span>
            <span>Actions</span>
          </div>
          {list.map((r) => (
            <ReviewRow key={r._id} review={r} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          onPage={setPage}
        />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Reviews</h1>
        <p className="mt-1 text-sm text-slate">
          Moderate customer reviews — view, create admin-authored reviews, or delete
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] p-8 text-center text-sm text-slate animate-pulse">
            Loading reviews…
          </div>
        }
      >
        <ReviewsTable />
      </Suspense>
    </div>
  );
}
