'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import {
  useAdminOrder,
  useUpdateOrderStatus,
  useRefundOrder,
  type OrderStatus,
} from '@/lib/admin/orders';
import { StatusChip } from '@/components/admin/StatusChip';

// ── Helpers ───────────────────────────────────────────────────────────────────

function inr(n: unknown): string {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
}

function formatDate(s: unknown): string {
  if (typeof s !== 'string' || !s) return '—';
  return new Date(s).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Allowed forward transitions matching server-side validTransitions map
const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped:    ['delivered'],
  delivered:  ['refunded'],
  cancelled:  [],
  refunded:   [],
};

function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}

// ── Detail Page ───────────────────────────────────────────────────────────────

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { data: order, isLoading, isError } = useAdminOrder(orderId);
  const updateStatus = useUpdateOrderStatus(orderId);
  const refundOrder = useRefundOrder(orderId);

  const [pendingStatus, setPendingStatus] = useState<OrderStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto space-y-6">
        <div className="h-7 w-48 rounded bg-zinc-200 animate-pulse" />
        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded bg-zinc-200" />
          ))}
        </div>
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="max-w-4xl mx-auto space-y-4">
        <Link href="/admin/orders" className="text-sm text-zinc-500 hover:underline">
          ← Back to Orders
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Order not found or could not be loaded.
        </div>
      </main>
    );
  }

  const nextStatuses = NEXT_STATUSES[order.status] ?? [];
  const canRefund =
    order.payment?.status === 'paid' && order.status !== 'refunded';

  async function handleStatusChange() {
    if (!pendingStatus) return;
    const confirmed = window.confirm(
      `Change order status from "${order!.status}" to "${pendingStatus}"?`,
    );
    if (!confirmed) return;
    setActionError(null);
    try {
      await updateStatus.mutateAsync({
        status: pendingStatus,
        note: statusNote.trim() || undefined,
      });
      setPendingStatus('');
      setStatusNote('');
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleRefund() {
    const confirmed = window.confirm(
      `Initiate refund for order ${order!.orderId}? This action cannot be undone.`,
    );
    if (!confirmed) return;
    setActionError(null);
    try {
      await refundOrder.mutateAsync();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  return (
    <main className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link href="/admin/orders" className="text-sm text-zinc-500 hover:underline">
        ← Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 font-mono">{order.orderId}</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Placed {formatDate(order.createdAt)}</p>
        </div>
        <StatusChip status={order.status} />
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* ── Grid layout ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* Customer */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Customer
          </h2>
          <p className="text-sm text-zinc-800">{order.customerEmail}</p>
          {order.guestInfo && (
            <div className="mt-1 space-y-0.5 text-xs text-zinc-500">
              <p>{order.guestInfo.name}</p>
              <p>{order.guestInfo.phone}</p>
            </div>
          )}
          <p className="mt-2 text-xs text-zinc-400 capitalize">
            Type: {order.orderType ?? '—'}
          </p>
        </section>

        {/* Shipping Address */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Shipping Address
          </h2>
          {order.shippingAddress ? (
            <address className="not-italic text-sm text-zinc-800 space-y-0.5">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-zinc-500">{order.shippingAddress.phone}</p>
            </address>
          ) : (
            <p className="text-sm text-zinc-400">No address recorded.</p>
          )}
        </section>

        {/* Payment */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Payment
          </h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Gateway</dt>
              <dd className="text-zinc-800 capitalize">{order.payment?.gateway ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Method</dt>
              <dd className="text-zinc-800">{order.payment?.method ?? '—'}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-zinc-500">Payment Status</dt>
              <dd>
                <StatusChip status={order.payment?.status ?? 'pending'} />
              </dd>
            </div>
            {order.payment?.razorpayPaymentId && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Payment ID</dt>
                <dd className="font-mono text-xs text-zinc-600 truncate max-w-[160px]">
                  {order.payment.razorpayPaymentId}
                </dd>
              </div>
            )}
            {order.payment?.paidAt && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Paid At</dt>
                <dd className="text-zinc-800">{formatDate(order.payment.paidAt)}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Billing Summary */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Billing
          </h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Subtotal</dt>
              <dd className="text-zinc-800">{inr(order.billing?.subtotal)}</dd>
            </div>
            {typeof order.billing?.couponDiscount === 'number' &&
              order.billing.couponDiscount > 0 && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">
                  Coupon{order.billing.couponCode ? ` (${order.billing.couponCode})` : ''}
                </dt>
                <dd className="text-green-700">−{inr(order.billing.couponDiscount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-zinc-500">Shipping</dt>
              <dd className="text-zinc-800">{inr(order.billing?.shippingCharge)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Shipping Tax</dt>
              <dd className="text-zinc-800">{inr(order.billing?.shippingTax)}</dd>
            </div>
            {typeof order.walletApplied === 'number' && order.walletApplied > 0 && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Wallet Applied</dt>
                <dd className="text-green-700">−{inr(order.walletApplied)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-100 pt-1 mt-1 font-semibold">
              <dt className="text-zinc-700">Total</dt>
              <dd className="text-zinc-900">{inr(order.billing?.total)}</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Tracking Info */}
      {order.trackingInfo &&
        (order.trackingInfo.courier || order.trackingInfo.trackingId) && (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Tracking
          </h2>
          <dl className="space-y-1 text-sm">
            {order.trackingInfo.courier && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Courier</dt>
                <dd className="text-zinc-800">{order.trackingInfo.courier}</dd>
              </div>
            )}
            {order.trackingInfo.trackingId && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Tracking ID</dt>
                <dd className="font-mono text-xs text-zinc-700">{order.trackingInfo.trackingId}</dd>
              </div>
            )}
            {order.trackingInfo.trackingUrl && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Tracking URL</dt>
                <dd>
                  <a
                    href={order.trackingInfo.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs truncate max-w-[200px] inline-block"
                  >
                    {order.trackingInfo.trackingUrl}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Line Items */}
      <section className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Line Items ({typeof order.items?.length === 'number' ? order.items.length : '—'})
          </h2>
        </div>

        {!Array.isArray(order.items) || order.items.length === 0 ? (
          <p className="px-5 py-4 text-sm text-zinc-400">No items.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 px-5 py-3">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.productName ?? ''}
                    className="h-14 w-14 rounded border border-zinc-200 object-cover shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 rounded border border-zinc-200 bg-zinc-100 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {item.productName ?? '—'}
                  </p>
                  <p className="text-xs text-zinc-500 font-mono">{item.sku ?? '—'}</p>
                  {Array.isArray(item.attributeLabels) && item.attributeLabels.length > 0 && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {item.attributeLabels.join(' / ')}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right space-y-0.5">
                  <p className="text-sm font-semibold text-zinc-900">
                    {inr(
                      typeof item.priceAtPurchase === 'number' &&
                      typeof item.qty === 'number'
                        ? item.priceAtPurchase * item.qty
                        : undefined,
                    )}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {inr(item.priceAtPurchase)} × {typeof item.qty === 'number' ? item.qty : '—'}
                  </p>
                  {typeof item.originalPriceAtPurchase === 'number' &&
                    typeof item.priceAtPurchase === 'number' &&
                    item.originalPriceAtPurchase > item.priceAtPurchase && (
                    <p className="text-xs text-zinc-400 line-through">
                      {inr(item.originalPriceAtPurchase)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Actions ── */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Actions
        </h2>

        {/* Status change */}
        {nextStatuses.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-700">Update Status</p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label htmlFor="next-status" className="text-xs text-zinc-500">
                  New status
                </label>
                <select
                  id="next-status"
                  value={pendingStatus}
                  onChange={(e) => setPendingStatus(e.target.value as OrderStatus | '')}
                  className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <option value="">— select —</option>
                  {nextStatuses.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 flex-1 min-w-[180px]">
                <label htmlFor="status-note" className="text-xs text-zinc-500">
                  Note (optional)
                </label>
                <input
                  id="status-note"
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Internal note for this transition"
                  className="w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>
              <button
                onClick={handleStatusChange}
                disabled={!pendingStatus || updateStatus.isPending}
                className="rounded bg-zinc-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {updateStatus.isPending ? 'Updating…' : 'Apply'}
              </button>
            </div>
          </div>
        )}

        {nextStatuses.length === 0 && (
          <p className="text-sm text-zinc-400">
            No further status transitions are available for this order.
          </p>
        )}

        {/* Refund */}
        {canRefund && (
          <div className="border-t border-zinc-100 pt-4">
            <p className="text-sm font-medium text-zinc-700 mb-2">Refund</p>
            <button
              onClick={handleRefund}
              disabled={refundOrder.isPending}
              className="rounded border border-red-300 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {refundOrder.isPending ? 'Initiating Refund…' : 'Initiate Refund'}
            </button>
            <p className="mt-1 text-xs text-zinc-400">
              Marks the order as refunded. Payment gateway refund requires manual follow-up.
            </p>
          </div>
        )}
      </section>

      {/* Timeline */}
      {Array.isArray(order.timeline) && order.timeline.length > 0 && (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Timeline
          </h2>
          <ol className="relative border-l border-zinc-200 space-y-4 ml-2">
            {order.timeline.map((entry, idx) => (
              <li key={idx} className="ml-4">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-zinc-400" />
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip status={entry.status} />
                  <span className="text-xs text-zinc-400">{formatDate(entry.timestamp)}</span>
                </div>
                {entry.note && (
                  <p className="mt-1 text-xs text-zinc-500">{entry.note}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
