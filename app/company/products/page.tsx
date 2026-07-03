'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '@/components/company/PageHeader';
import { Card } from '@/components/company/Card';
import { StatusPill } from '@/components/company/StatusPill';
import {
  useCompanyProducts,
  usePatchProduct,
  useRequestProducts,
  type CompanyProduct,
} from '@/lib/company/products';
import { formatIN, initials, parsePointsInput } from '@/lib/company/format';
import { ApiError } from '@/lib/api';

const GRID = 'grid grid-cols-[minmax(220px,2.2fr)_1fr_.8fr_.7fr_.9fr_.9fr] items-center gap-4';

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11.3 1.7a1.4 1.4 0 0 1 2 2L4.5 12.5l-2.8.8.8-2.8Z" />
    </svg>
  );
}

function ProductThumbnail({ name }: { name: string }) {
  return (
    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-[#eef0f8] text-[11px] font-bold text-slate">
      {initials(name)}
    </span>
  );
}

function PointsCell({ product }: { product: CompanyProduct }) {
  const editPoints = usePatchProduct();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(String(product.points));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const startEdit = () => {
    setValue(String(product.points));
    setIsEditing(true);
  };
  const cancelEdit = () => setIsEditing(false);

  const saveEdit = () => {
    const n = parsePointsInput(value);
    if (n === null) return;
    editPoints.mutate(
      { id: product.productId, body: { pointsOverride: n } },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  if (isEditing) {
    return (
      <span className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={editPoints.isPending}
          className="w-20 rounded-md border border-line px-2 py-1 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
        />
        <button
          type="button"
          onClick={saveEdit}
          disabled={editPoints.isPending || value.trim() === ''}
          aria-label="Save points price"
          className="rounded-md px-1.5 py-1 text-[12px] font-bold text-[#1a8f5a] hover:bg-[rgba(31,170,107,.12)] disabled:opacity-40"
        >
          ✓
        </button>
        <button
          type="button"
          onClick={cancelEdit}
          disabled={editPoints.isPending}
          aria-label="Cancel editing points price"
          className="rounded-md px-1.5 py-1 text-[12px] font-bold text-muted hover:bg-[#eef0f8] disabled:opacity-40"
        >
          ✕
        </button>
      </span>
    );
  }

  return (
    <span className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={startEdit}
        className="group flex items-center gap-1.5 text-[13px] font-bold text-ink"
        aria-label={`Edit points price for ${product.name}`}
      >
        {formatIN(product.points)}
        <span className="text-muted opacity-0 transition-opacity group-hover:opacity-100">
          <PencilIcon />
        </span>
      </button>
      {editPoints.isError && (
        <span className="text-[11px] text-[#d8524d]">
          {editPoints.error instanceof ApiError ? editPoints.error.message : 'Could not update.'}
        </span>
      )}
    </span>
  );
}

function ProductRow({ product }: { product: CompanyProduct }) {
  const toggleHidden = usePatchProduct();

  const handleToggle = () => {
    toggleHidden.mutate({ id: product.productId, body: { hidden: !product.hidden } });
  };

  return (
    <div className={`${GRID} border-b border-line px-5 py-4 text-[13px] last:border-0`}>
      <span className="flex min-w-0 items-center gap-3">
        <ProductThumbnail name={product.name} />
        <span className="truncate font-bold text-ink">{product.name}</span>
      </span>

      <span className="truncate text-slate">{product.category ?? '—'}</span>

      <PointsCell product={product} />

      <span className="font-semibold text-ink">{formatIN(product.stock)}</span>

      <span>
        <StatusPill status={product.status} />
      </span>

      <span className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={handleToggle}
          disabled={toggleHidden.isPending}
          className="w-fit rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-slate transition-colors hover:bg-[#eef0f8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {toggleHidden.isPending ? '…' : product.hidden ? 'Show' : 'Hide'}
        </button>
        {toggleHidden.isError && (
          <span className="text-[11px] text-[#d8524d]">
            {toggleHidden.error instanceof ApiError ? toggleHidden.error.message : 'Could not update.'}
          </span>
        )}
      </span>
    </div>
  );
}

function RequestProductsModal({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const requestProducts = useRequestProducts();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    dialogRef.current?.querySelector<HTMLElement>('textarea')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestProducts.mutateAsync({
        subject: subject.trim() || undefined,
        message: message.trim() || undefined,
      });
      onSubmitted();
    } catch {
      // Surfaced inline below via requestProducts.isError.
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-products-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="request-products-title" className="text-[17px] font-bold text-ink">
          Request more products
        </h2>
        <p className="mt-1 text-[12px] text-muted">
          Tell Supreme what you&rsquo;d like to see in your store. We&rsquo;ll curate and add it
          from the catalogue.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <div>
            <label htmlFor="rp-subject" className="mb-1 block text-[12px] font-semibold text-slate">
              Subject (optional)
            </label>
            <input
              id="rp-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. More apparel options"
              className="w-full rounded-lg border border-line px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>
          <div>
            <label htmlFor="rp-message" className="mb-1 block text-[12px] font-semibold text-slate">
              Message
            </label>
            <textarea
              id="rp-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the products or categories you'd like added…"
              className="w-full resize-none rounded-lg border border-line px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>

          {requestProducts.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-[#d8524d]">
              {requestProducts.error instanceof ApiError
                ? requestProducts.error.message
                : 'Could not send the request. Please try again.'}
            </p>
          )}

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-slate transition-colors hover:bg-[#f6f7fb]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requestProducts.isPending}
              className="rounded-lg bg-ink px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {requestProducts.isPending ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CompanyProductsPage() {
  const { data, isLoading, isError } = useCompanyProducts();
  const [search, setSearch] = useState('');
  const [showRequest, setShowRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const products = useMemo(() => data?.products ?? [], [data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.category ?? '').toLowerCase().includes(q),
    );
  }, [products, search]);

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-7">
      <PageHeader
        title="Store Products"
        subtitle="Curate the products available in your branded store."
        right={
          <>
            <input
              type="search"
              placeholder="Search by name or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 rounded-full border border-line bg-white px-4 py-2 text-[13px] text-ink placeholder:text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowRequest(true)}
              className="whitespace-nowrap rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
            >
              + Request more products
            </button>
          </>
        }
      />

      <Card className="mb-6 flex items-start justify-between gap-4 border-[rgba(42,43,106,.14)] bg-[rgba(42,43,106,.05)] p-4 text-[13px] text-slate">
        <p>
          These are the products visible in your employees&rsquo; branded store. Hide items or
          adjust the points price. To stock new items, raise a request &mdash; Supreme curates and
          adds them from the catalogue.
        </p>
      </Card>

      {requestSent && (
        <Card className="mb-6 flex items-center justify-between gap-4 border-[rgba(31,170,107,.25)] bg-[rgba(31,170,107,.08)] p-4 text-[13px] font-semibold text-[#1a8f5a]">
          <span>Your request has been sent to Supreme. We&rsquo;ll be in touch soon.</span>
          <button
            type="button"
            onClick={() => setRequestSent(false)}
            aria-label="Dismiss"
            className="text-[12px] font-bold text-[#1a8f5a] hover:opacity-70"
          >
            ✕
          </button>
        </Card>
      )}

      {isError && <Card className="p-6 text-[13px] text-muted">Could not load store products.</Card>}

      {isLoading && !data && <Card className="p-6 text-[13px] text-muted">Loading…</Card>}

      {!isLoading && !isError && products.length === 0 && (
        <Card className="p-10 text-center text-[13px] text-muted">
          No products in your store yet. Request some to get started.
        </Card>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <Card className="overflow-hidden">
          {filtered.length === 0 ? (
            <p className="p-6 text-[13px] text-muted">No products match &ldquo;{search}&rdquo;.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[820px]">
                <div
                  className={`${GRID} font-jbmono border-b border-line px-5 pb-3 pt-4 text-[10px] uppercase tracking-[.05em] text-muted`}
                >
                  <span>Product</span>
                  <span>Category</span>
                  <span>Points</span>
                  <span>Stock</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {filtered.map((p) => (
                  <ProductRow key={p.productId} product={p} />
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {showRequest && (
        <RequestProductsModal
          onClose={() => setShowRequest(false)}
          onSubmitted={() => {
            setShowRequest(false);
            setRequestSent(true);
          }}
        />
      )}
    </div>
  );
}
