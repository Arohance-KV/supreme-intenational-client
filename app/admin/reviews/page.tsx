'use client';

import { Suspense, useState } from 'react';
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
import { fmtDate } from '@/lib/admin/format';

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
    return <span className="text-zinc-400">—</span>;
  }
  const filled = Math.round(rating);
  return (
    <span className="text-amber-500 tracking-tight" aria-label={`${filled} out of 5 stars`}>
      {'★'.repeat(filled)}
      {'☆'.repeat(5 - filled)}
      <span className="ml-1 text-xs text-zinc-500">{rating}/5</span>
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

  function set<K extends keyof CreateReviewBody>(key: K, val: CreateReviewBody[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CreateReviewBody = {
      productId: form.productId.trim(),
      reviewerName: form.reviewerName.trim(),
      rating: Number(form.rating),
      title: form.title.trim(),
      body: form.body?.trim() || undefined,
      userId: form.userId?.trim() || undefined,
    };
    createReview.mutate(payload, { onSuccess: onClose });
  }

  const inputCls =
    'w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400';
  const labelCls = 'mb-1 block text-sm font-medium text-zinc-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto">
      <div className="my-8 w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Create admin review</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product ID */}
          <div>
            <label className={labelCls}>
              Product ID <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="MongoDB ObjectId of product"
              value={form.productId}
              onChange={(e) => set('productId', e.target.value)}
              className={`${inputCls} font-mono`}
            />
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
          </div>

          {/* User ID (optional) */}
          <div>
            <label className={labelCls}>
              User ID
              <span className="ml-1 font-normal text-zinc-400">(optional — links to an account)</span>
            </label>
            <input
              type="text"
              placeholder="MongoDB ObjectId of user"
              value={form.userId ?? ''}
              onChange={(e) => set('userId', e.target.value)}
              className={`${inputCls} font-mono`}
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

          {/* Body */}
          <div>
            <label className={labelCls}>
              Review body
              <span className="ml-1 font-normal text-zinc-400">(optional, up to 2000 chars)</span>
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
              className="rounded border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createReview.isPending}
              className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
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
  const deleteReview = useDeleteReview();

  function handleDelete() {
    const productName = getProductName(review.productId);
    if (
      !confirm(
        `Delete review "${review.title}" for "${productName}"? This will hide it from the storefront.`,
      )
    )
      return;
    deleteReview.mutate(review._id);
  }

  const authorName = getAuthorName(review);
  const productName = getProductName(review.productId);

  return (
    <div className="grid grid-cols-[1fr_160px_120px_80px_100px_130px] items-start gap-3 border-b border-zinc-100 px-5 py-3 hover:bg-zinc-50 transition-colors">
      {/* Product + title */}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900">{review.title || '—'}</p>
        <p className="truncate text-xs text-zinc-500 mt-0.5">{productName}</p>
        {review.body && (
          <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{review.body}</p>
        )}
      </div>

      {/* Author */}
      <div className="min-w-0">
        <p className="truncate text-sm text-zinc-700">{authorName}</p>
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
              : 'bg-zinc-100 text-zinc-500'
          }`}
        >
          {review.isVisible ? 'Visible' : 'Hidden'}
        </span>
      </div>

      {/* Date */}
      <span className="text-xs text-zinc-500">{fmtDate(review.createdAt)}</span>

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
    <div className="flex items-center justify-between pt-2 text-sm text-zinc-500">
      <span>
        {typeof total === 'number' ? total.toLocaleString('en-IN') : '—'} reviews total
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="rounded border border-zinc-200 px-3 py-1 text-xs disabled:opacity-40 hover:bg-zinc-50"
        >
          Previous
        </button>
        <span className="text-xs">
          Page {page} of {pages}
        </span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          className="rounded border border-zinc-200 px-3 py-1 text-xs disabled:opacity-40 hover:bg-zinc-50"
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
        <p className="text-sm text-zinc-500">
          {pagination
            ? `${typeof pagination.total === 'number' ? pagination.total.toLocaleString('en-IN') : '—'} review${pagination.total !== 1 ? 's' : ''}`
            : ''}
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          + New review
        </button>
      </div>

      {showCreate && <CreateReviewModal onClose={() => setShowCreate(false)} />}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex items-start gap-4 px-5 py-3 animate-pulse">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-zinc-200" />
                <div className="h-3 w-32 rounded bg-zinc-200" />
              </div>
              <div className="h-4 w-24 rounded bg-zinc-200" />
              <div className="h-4 w-20 rounded bg-zinc-200" />
              <div className="h-5 w-14 rounded-full bg-zinc-200" />
              <div className="h-5 w-16 rounded bg-zinc-200" />
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
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
          <p className="text-sm text-zinc-500">No reviews found.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && list.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_160px_120px_80px_100px_130px] gap-3 bg-zinc-50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
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
        <h1 className="text-2xl font-bold text-zinc-900">Reviews</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Moderate customer reviews — view, create admin-authored reviews, or delete
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 animate-pulse">
            Loading reviews…
          </div>
        }
      >
        <ReviewsTable />
      </Suspense>
    </div>
  );
}
