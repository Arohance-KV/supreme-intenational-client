'use client';

import { Suspense, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeactivateCoupon,
  type AdminCoupon,
  type CreateCouponBody,
  type UpdateCouponBody,
} from '@/lib/admin/coupons';
import { StatusChip } from '@/components/admin/StatusChip';
import { inr, fmtDate } from '@/lib/admin/format';

/** Convert an ISO string (or Date) to the value expected by <input type="datetime-local"> */
function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    // datetime-local format: YYYY-MM-DDTHH:mm
    return d.toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

// ── Blank form state ──────────────────────────────────────────────────────────

function blankForm(): CreateCouponBody {
  return {
    code: '',
    description: '',
    type: 'flat',
    value: 0,
    startsAt: toDatetimeLocal(new Date().toISOString()),
    expiresAt: '',
    minOrderValue: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    perUserLimit: 0,
  };
}

function couponToForm(c: AdminCoupon): CreateCouponBody {
  return {
    code: c.code,
    description: c.description ?? '',
    type: c.type,
    value: c.value,
    startsAt: toDatetimeLocal(c.startsAt),
    expiresAt: c.expiresAt ? toDatetimeLocal(c.expiresAt) : '',
    minOrderValue: typeof c.minOrderValue === 'number' ? c.minOrderValue : 0,
    maxDiscountAmount: typeof c.maxDiscountAmount === 'number' ? c.maxDiscountAmount : 0,
    usageLimit: typeof c.usageLimit === 'number' ? c.usageLimit : 0,
    perUserLimit: typeof c.perUserLimit === 'number' ? c.perUserLimit : 0,
    companyId: c.companyId ?? '',
  };
}

// ── Coupon form modal ─────────────────────────────────────────────────────────

interface CouponFormModalProps {
  mode: 'create' | 'edit';
  initial: CreateCouponBody;
  couponId?: string;
  onClose: () => void;
}

function CouponFormModal({ mode, initial, couponId, onClose }: CouponFormModalProps) {
  const [form, setForm] = useState<CreateCouponBody>(initial);
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon(couponId ?? '');

  const isPending = mode === 'create' ? createCoupon.isPending : updateCoupon.isPending;
  const mutErr = mode === 'create' ? createCoupon.error : updateCoupon.error;

  function set<K extends keyof CreateCouponBody>(key: K, val: CreateCouponBody[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function buildPayload(): CreateCouponBody {
    return {
      ...form,
      // Ensure empty-string optional fields are omitted
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      startsAt: new Date(form.startsAt).toISOString(),
      companyId: form.companyId || undefined,
      description: form.description || undefined,
      // 0 means "unlimited" — still valid per validator (isInt min: 0)
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = buildPayload();

    if (mode === 'create') {
      createCoupon.mutate(payload, { onSuccess: onClose });
    } else {
      // For update, exclude code (not in updateCouponValidator)
      const { code: _code, ...rest } = payload;
      void _code; // intentionally excluded
      updateCoupon.mutate(rest as UpdateCouponBody, { onSuccess: onClose });
    }
  }

  const inputCls =
    'w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400';
  const labelCls = 'mb-1 block text-sm font-medium text-zinc-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto">
      <div className="my-8 w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">
            {mode === 'create' ? 'Create coupon' : 'Edit coupon'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: code + type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Code <span className="text-red-500">*</span>
              </label>
              <input
                required
                disabled={mode === 'edit'}
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                placeholder="SUMMER20"
                className={`${inputCls} uppercase font-mono ${mode === 'edit' ? 'bg-zinc-50 text-zinc-400 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className={labelCls}>
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value as 'flat' | 'percent')}
                className={inputCls}
              >
                <option value="flat">Flat (₹)</option>
                <option value="percent">Percent (%)</option>
              </select>
            </div>
          </div>

          {/* Row 2: value + min order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Discount value <span className="text-red-500">*</span>
                <span className="ml-1 font-normal text-zinc-400">
                  {form.type === 'percent' ? '(0–100)' : '(₹)'}
                </span>
              </label>
              <input
                required
                type="number"
                min={0}
                max={form.type === 'percent' ? 100 : undefined}
                step="0.01"
                value={form.value}
                onChange={(e) => set('value', parseFloat(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Min order value (₹)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.minOrderValue ?? 0}
                onChange={(e) => set('minOrderValue', parseFloat(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 3: max discount + starts at */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Max discount amount (₹)
                {form.type === 'flat' && (
                  <span className="ml-1 font-normal text-zinc-400">(ignored for flat)</span>
                )}
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.maxDiscountAmount ?? 0}
                onChange={(e) => set('maxDiscountAmount', parseFloat(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Starts at <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => set('startsAt', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 4: expires at + usage limit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Expires at
                <span className="ml-1 font-normal text-zinc-400">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt ?? ''}
                onChange={(e) => set('expiresAt', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Usage limit
                <span className="ml-1 font-normal text-zinc-400">(0 = unlimited)</span>
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.usageLimit ?? 0}
                onChange={(e) => set('usageLimit', parseInt(e.target.value, 10) || 0)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 5: per-user limit + company ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Per-user limit
                <span className="ml-1 font-normal text-zinc-400">(0 = unlimited)</span>
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.perUserLimit ?? 0}
                onChange={(e) => set('perUserLimit', parseInt(e.target.value, 10) || 0)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Company ID
                <span className="ml-1 font-normal text-zinc-400">(optional, employee-only)</span>
              </label>
              <input
                type="text"
                placeholder="MongoDB ObjectId"
                value={form.companyId ?? ''}
                onChange={(e) => set('companyId', e.target.value)}
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <input
              type="text"
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Optional customer-facing note"
              className={inputCls}
            />
          </div>

          {/* Error */}
          {mutErr && (
            <p className="text-sm text-red-600">
              {mutErr instanceof ApiError ? mutErr.message : 'Operation failed'}
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
              disabled={isPending}
              className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isPending
                ? mode === 'create'
                  ? 'Creating…'
                  : 'Saving…'
                : mode === 'create'
                  ? 'Create'
                  : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Coupon row ────────────────────────────────────────────────────────────────

function CouponRow({ coupon }: { coupon: AdminCoupon }) {
  const [showEdit, setShowEdit] = useState(false);
  const deactivate = useDeactivateCoupon();

  function handleDeactivate() {
    if (!confirm(`Deactivate coupon "${coupon.code}"? It will no longer be usable.`)) return;
    deactivate.mutate(coupon._id);
  }

  const discountLabel =
    coupon.type === 'flat'
      ? `₹${typeof coupon.value === 'number' ? coupon.value.toLocaleString('en-IN') : '?'} off`
      : `${typeof coupon.value === 'number' ? coupon.value : '?'}% off`;

  return (
    <>
      <div className="grid grid-cols-[140px_1fr_120px_100px_120px_110px_140px] items-center gap-3 border-b border-zinc-100 px-5 py-3 hover:bg-zinc-50 transition-colors">
        {/* Code */}
        <span className="font-mono text-sm font-semibold text-zinc-900 truncate">
          {coupon.code}
        </span>

        {/* Discount */}
        <span className="text-sm text-zinc-700">{discountLabel}</span>

        {/* Min order */}
        <span className="text-sm text-zinc-600">{inr(coupon.minOrderValue)}</span>

        {/* Usage */}
        <span className="text-sm text-zinc-600">
          {typeof coupon.usedCount === 'number' ? coupon.usedCount : 0}
          {typeof coupon.usageLimit === 'number' && coupon.usageLimit > 0
            ? ` / ${coupon.usageLimit}`
            : ' / ∞'}
        </span>

        {/* Expiry */}
        <span className="text-xs text-zinc-500">{fmtDate(coupon.expiresAt)}</span>

        {/* Status */}
        <StatusChip
          status={coupon.isActive ? 'active' : 'inactive'}
          label={coupon.isActive ? 'Active' : 'Inactive'}
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="rounded border border-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
          >
            Edit
          </button>
          {coupon.isActive && (
            <button
              onClick={handleDeactivate}
              disabled={deactivate.isPending}
              className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {deactivate.isPending ? '…' : 'Deactivate'}
            </button>
          )}
          {deactivate.error && (
            <span className="text-xs text-red-600">
              {deactivate.error instanceof ApiError
                ? deactivate.error.message
                : 'Error'}
            </span>
          )}
        </div>
      </div>

      {showEdit && (
        <CouponFormModal
          mode="edit"
          initial={couponToForm(coupon)}
          couponId={coupon._id}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}

// ── Inner table (contains useSearchParams — must be inside Suspense) ──────────

function CouponsTable() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: coupons, isLoading, isError, error } = useCoupons();

  const list = coupons ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {Array.isArray(coupons)
            ? `${coupons.length.toLocaleString('en-IN')} coupon${coupons.length !== 1 ? 's' : ''}`
            : ''}
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          + New coupon
        </button>
      </div>

      {showCreate && (
        <CouponFormModal
          mode="create"
          initial={blankForm()}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 w-28 rounded bg-zinc-200 font-mono" />
              <div className="h-4 w-20 rounded bg-zinc-200" />
              <div className="h-4 w-16 rounded bg-zinc-200" />
              <div className="h-5 w-16 rounded-full bg-zinc-200" />
              <div className="h-5 w-20 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError
            ? error.message
            : 'Failed to load coupons. Please try refreshing.'}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && list.length === 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
          <p className="text-sm text-zinc-500">No coupons found. Create your first one above.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && list.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[140px_1fr_120px_100px_120px_110px_140px] gap-3 bg-zinc-50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <span>Code</span>
            <span>Discount</span>
            <span>Min Order</span>
            <span>Uses</span>
            <span>Expires</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {list.map((c) => (
            <CouponRow key={c._id} coupon={c} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminCouponsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Coupons</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage discount coupons — flat and percentage based
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 animate-pulse">
            Loading coupons…
          </div>
        }
      >
        <CouponsTable />
      </Suspense>
    </div>
  );
}
