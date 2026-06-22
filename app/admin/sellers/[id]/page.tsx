'use client';

import { use, useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { StatusChip } from '@/components/admin/StatusChip';
import {
  useSeller,
  useUpdateSellerStatus,
  useUpdateSeller,
  useSellerProducts,
  useSellerPerformance,
  type AdminSeller,
  type SellerStatus,
  type UpdateSellerBody,
  type SellerTopProduct,
} from '@/lib/admin/sellers';

// ── Helpers ───────────────────────────────────────────────────────────────────

function inr(n: unknown): string {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
}

function fmtDate(iso: unknown): string {
  if (!iso || typeof iso !== 'string') return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function fmtDateTime(iso: unknown): string {
  if (!iso || typeof iso !== 'string') return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

const inputCls =
  'w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400';
const labelCls = 'mb-1 block text-sm font-medium text-zinc-700';
const sectionCls = 'rounded-xl border border-zinc-200 bg-white p-5';

// ── Allowed next transitions (mirrors backend logic) ──────────────────────────

function allowedTransitions(current: SellerStatus): SellerStatus[] {
  const map: Record<SellerStatus, SellerStatus[]> = {
    pending:   ['active', 'rejected'],
    active:    ['suspended'],
    suspended: ['active'],
    rejected:  ['pending'],
  };
  return map[current] ?? [];
}

// ── SellerStatusPanel ─────────────────────────────────────────────────────────

function SellerStatusPanel({ seller }: { seller: AdminSeller }) {
  const updateStatus = useUpdateSellerStatus(seller._id);
  const transitions = allowedTransitions(seller.status);

  const [selectedStatus, setSelectedStatus] = useState<SellerStatus | ''>(
    transitions[0] ?? '',
  );
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (updateStatus.isSuccess) {
      const timer = setTimeout(() => {
        updateStatus.reset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateStatus.isSuccess, updateStatus]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStatus) return;
    if (selectedStatus === 'rejected' && !reason.trim()) {
      alert('A reason is required when rejecting a seller.');
      return;
    }
    const label = selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1);
    if (!confirm(`Change seller status to "${label}"?`)) return;
    updateStatus.mutate(
      {
        status: selectedStatus,
        reason: selectedStatus === 'rejected' ? reason.trim() : undefined,
      },
      {
        onSuccess: () => {
          setReason('');
        },
      },
    );
  }

  if (transitions.length === 0) {
    return (
      <section className={sectionCls}>
        <h2 className="mb-3 text-base font-semibold text-zinc-800">Status</h2>
        <div className="flex items-center gap-3">
          <StatusChip status={seller.status} label={seller.status} />
          <span className="text-xs text-zinc-400">No transitions available from this state.</span>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionCls}>
      <h2 className="mb-3 text-base font-semibold text-zinc-800">Status</h2>
      <div className="mb-4 flex items-center gap-3">
        <StatusChip status={seller.status} label={seller.status} />
        {seller.rejectionReason && (
          <span className="text-xs text-zinc-500 italic">
            Reason: {seller.rejectionReason}
          </span>
        )}
        {seller.reviewedAt && (
          <span className="text-xs text-zinc-400">
            Reviewed {fmtDateTime(seller.reviewedAt)}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className={labelCls}>Change status to</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as SellerStatus)}
              className={inputCls + ' w-40'}
            >
              {transitions.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {selectedStatus === 'rejected' && (
            <div className="flex-1 min-w-48">
              <label className={labelCls}>
                Reason <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for rejection"
                className={inputCls}
              />
            </div>
          )}
        </div>

        {updateStatus.error && (
          <p className="text-sm text-red-600">
            {updateStatus.error instanceof ApiError
              ? updateStatus.error.message
              : 'Status update failed.'}
          </p>
        )}
        {updateStatus.isSuccess && (
          <p className="text-sm text-green-600">Status updated successfully.</p>
        )}

        <button
          type="submit"
          disabled={updateStatus.isPending || !selectedStatus}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-zinc-700 transition-colors"
        >
          {updateStatus.isPending ? 'Updating…' : 'Update status'}
        </button>
      </form>
    </section>
  );
}

// ── SellerEditForm ────────────────────────────────────────────────────────────

function SellerEditForm({ seller }: { seller: AdminSeller }) {
  const update = useUpdateSeller(seller._id);

  const [fields, setFields] = useState<UpdateSellerBody>({
    businessName: seller.businessName,
    description: seller.description ?? '',
    marginPercent: seller.marginPercent,
    contact: {
      name: seller.contact?.name ?? '',
      email: seller.contact?.email ?? '',
      isdCode: seller.contact?.isdCode ?? '',
      phoneNumber: seller.contact?.phoneNumber ?? '',
    },
  });

  const [marginError, setMarginError] = useState('');

  useEffect(() => {
    if (update.isSuccess) {
      const timer = setTimeout(() => {
        update.reset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [update.isSuccess, update]);

  function setContact(key: keyof NonNullable<UpdateSellerBody['contact']>, val: string) {
    setFields((prev) => ({
      ...prev,
      contact: { ...prev.contact, [key]: val },
    }));
  }

  function handleMarginChange(val: string) {
    setMarginError('');
    const n = val === '' ? 0 : parseFloat(val);
    if (isNaN(n) || n < 0 || n > 100) {
      setMarginError('Margin must be between 0 and 100');
    }
    setFields((prev) => ({ ...prev, marginPercent: isNaN(n) ? 0 : n }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const margin = fields.marginPercent ?? 0;
    if (margin < 0 || margin > 100) {
      setMarginError('Margin must be between 0 and 100');
      return;
    }
    const contact = {
      name: fields.contact?.name?.trim() || undefined,
      email: fields.contact?.email?.trim() || undefined,
      isdCode: fields.contact?.isdCode?.trim() || undefined,
      phoneNumber: fields.contact?.phoneNumber?.trim() || undefined,
    };
    const hasContact = contact.name || contact.email || contact.isdCode || contact.phoneNumber;
    const payload: UpdateSellerBody = {
      businessName: fields.businessName?.trim() || undefined,
      description: fields.description?.trim() || undefined,
      marginPercent: margin,
      ...(hasContact && { contact }),
    };
    update.mutate(payload);
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>
            Business name <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={fields.businessName ?? ''}
            onChange={(e) => setFields({ ...fields, businessName: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            Margin % (admin commission, 0–100)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={fields.marginPercent ?? 0}
            onChange={(e) => handleMarginChange(e.target.value)}
            className={inputCls}
          />
          {marginError && (
            <p className="mt-1 text-xs text-red-600">{marginError}</p>
          )}
          <p className="mt-1 text-xs text-zinc-400">
            Seller receives (100 − margin)% of the deal amount.
          </p>
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          rows={2}
          value={fields.description ?? ''}
          onChange={(e) => setFields({ ...fields, description: e.target.value })}
          className={inputCls}
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pt-1">
        Contact
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Name</label>
          <input
            value={fields.contact?.name ?? ''}
            onChange={(e) => setContact('name', e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input
            type="email"
            value={fields.contact?.email ?? ''}
            onChange={(e) => setContact('email', e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>ISD code</label>
          <input
            value={fields.contact?.isdCode ?? ''}
            onChange={(e) => setContact('isdCode', e.target.value)}
            placeholder="+91"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input
            value={fields.contact?.phoneNumber ?? ''}
            onChange={(e) => setContact('phoneNumber', e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {update.error && (
        <p className="text-sm text-red-600">
          {update.error instanceof ApiError ? update.error.message : 'Save failed.'}
        </p>
      )}
      {update.isSuccess && (
        <p className="text-sm text-green-600">Saved successfully.</p>
      )}

      <button
        type="submit"
        disabled={update.isPending || !!marginError}
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-zinc-700 transition-colors"
      >
        {update.isPending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

// ── SellerProductsSection ─────────────────────────────────────────────────────

function SellerProductsSection({ sellerId }: { sellerId: string }) {
  const { data, isLoading, isError, error } = useSellerProducts(sellerId);

  const products = data?.products ?? [];

  return (
    <section className={sectionCls}>
      <h2 className="mb-4 text-base font-semibold text-zinc-800">
        Products ({products.length})
      </h2>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="h-10 animate-pulse rounded bg-zinc-100" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-600">
          {error instanceof ApiError ? error.message : 'Failed to load products.'}
        </p>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <p className="text-sm text-zinc-500">No products listed yet.</p>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Slug</th>
                <th className="px-3 py-2 font-medium">Min price</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Link</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-3 py-2 text-zinc-800 truncate max-w-xs">{p.name}</td>
                  <td className="px-3 py-2 text-zinc-500 font-mono text-xs">{p.slug}</td>
                  <td className="px-3 py-2">{inr(p.minPrice)}</td>
                  <td className="px-3 py-2">
                    <StatusChip
                      status={p.isActive ? 'active' : 'inactive'}
                      label={p.isActive ? 'Active' : 'Inactive'}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/catalog/products/${p.slug}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ── SellerPerformancePanel ────────────────────────────────────────────────────

function SellerPerformancePanel({ sellerId }: { sellerId: string }) {
  const { data, isLoading, isError, error } = useSellerPerformance(sellerId);

  return (
    <section className={sectionCls}>
      <h2 className="mb-4 text-base font-semibold text-zinc-800">Performance</h2>

      {isLoading && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-20 animate-pulse rounded-lg bg-zinc-100" />
            ))}
          </div>
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-600">
          {error instanceof ApiError ? error.message : 'Failed to load performance data.'}
        </p>
      )}

      {!isLoading && !isError && data && (
        <div className="space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs text-zinc-500 mb-0.5">Gross revenue</p>
              <p className="text-xl font-bold text-zinc-900">{inr(data.gross)}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs text-zinc-500 mb-0.5">Admin commission</p>
              <p className="text-xl font-bold text-amber-700">{inr(data.commission)}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs text-zinc-500 mb-0.5">Seller earnings</p>
              <p className="text-xl font-bold text-green-700">{inr(data.earnings)}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs text-zinc-500 mb-0.5">Total deals</p>
              <p className="text-xl font-bold text-zinc-900">
                {typeof data.dealCount === 'number' ? data.dealCount.toLocaleString() : '—'}
              </p>
            </div>
          </div>

          {/* Top products */}
          {Array.isArray(data.topProducts) && data.topProducts.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Top products (by revenue)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 font-medium text-right">Qty sold</th>
                      <th className="px-3 py-2 font-medium text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((p: SellerTopProduct) => (
                      <tr key={p.productId} className="border-b border-zinc-100 hover:bg-zinc-50">
                        <td className="px-3 py-2 text-zinc-800 truncate max-w-xs">
                          {p.productName ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-600">
                          {typeof p.qty === 'number' ? p.qty.toLocaleString() : '—'}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-zinc-800">
                          {inr(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {Array.isArray(data.topProducts) && data.topProducts.length === 0 && (
            <p className="text-sm text-zinc-500">No sales data yet.</p>
          )}
        </div>
      )}
    </section>
  );
}

// ── Page inner ────────────────────────────────────────────────────────────────

function SellerDetailInner({ id }: { id: string }) {
  const { data: seller, isLoading, error } = useSeller(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-zinc-200" />
        <div className="h-48 animate-pulse rounded-xl bg-zinc-100" />
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error instanceof ApiError ? error.message : 'Failed to load seller.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/admin/sellers" className="hover:underline">
          Sellers
        </Link>
        <span>/</span>
        <span className="text-zinc-800 font-medium truncate">{seller.businessName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{seller.businessName}</h1>
          <p className="mt-1 text-xs text-zinc-400 font-mono">{seller.slug}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Joined {fmtDate(seller.createdAt)}
            {typeof seller.marginPercent === 'number' && (
              <span className="ml-3 rounded bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700">
                Margin: {seller.marginPercent}%
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusChip status={seller.status} label={seller.status} />
        </div>
      </div>

      {/* Status change */}
      <SellerStatusPanel seller={seller} />

      {/* Edit form */}
      <section className={sectionCls}>
        <h2 className="mb-4 text-base font-semibold text-zinc-800">Seller details</h2>
        <SellerEditForm seller={seller} />
      </section>

      {/* Products */}
      <SellerProductsSection sellerId={id} />

      {/* Performance */}
      <SellerPerformancePanel sellerId={id} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded bg-zinc-200" />
          <div className="h-48 animate-pulse rounded-xl bg-zinc-100" />
        </div>
      }
    >
      <SellerDetailInner id={id} />
    </Suspense>
  );
}
