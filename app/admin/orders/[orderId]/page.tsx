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
import { useConfirm } from '@/components/ConfirmDialog';

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
  const { confirm } = useConfirm();
  const { data: order, isLoading, isError } = useAdminOrder(orderId);
  const updateStatus = useUpdateOrderStatus(orderId);
  const refundOrder = useRefundOrder(orderId);

  const [pendingStatus, setPendingStatus] = useState<OrderStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto space-y-6">
        <div className="h-7 w-48 rounded bg-black/5 animate-pulse" />
        <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-6 space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded bg-black/5" />
          ))}
        </div>
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="max-w-4xl mx-auto space-y-4">
        <Link href="/admin/orders" className="text-sm text-slate hover:underline">
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
    order.payment?.status === 'paid' && order.status === 'delivered';

  async function handleStatusChange() {
    if (!pendingStatus) return;
    const confirmed = await confirm({
      title: 'Update order status',
      message: `Change order status from "${order!.status}" to "${pendingStatus}"?`,
      confirmLabel: 'Change status',
      tone: pendingStatus === 'cancelled' || pendingStatus === 'refunded' ? 'danger' : 'default',
    });
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
    const confirmed = await confirm({
      title: 'Initiate refund',
      message: `Initiate refund for order ${order!.orderId}? This action cannot be undone.`,
      confirmLabel: 'Initiate refund',
      tone: 'danger',
    });
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
      <Link href="/admin/orders" className="text-sm text-slate hover:underline">
        ← Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-extrabold tracking-tight text-ink font-jbmono">{order.orderId}</h1>
          <p className="mt-0.5 text-sm text-slate">Placed {formatDate(order.createdAt)}</p>
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
        <section className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">
            Customer
          </h2>
          <p className="text-sm text-ink">{order.customerEmail}</p>
          {order.guestInfo && (
            <div className="mt-1 space-y-0.5 text-xs text-slate">
              <p>{order.guestInfo.name}</p>
              <p>{order.guestInfo.phone}</p>
            </div>
          )}
          <p className="mt-2 text-xs text-muted capitalize">
            Type: {order.orderType ?? '—'}
          </p>
        </section>

        {/* Shipping Address */}
        <section className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">
            Shipping Address
          </h2>
          {order.shippingAddress ? (
            <address className="not-italic text-sm text-ink space-y-0.5">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-slate">{order.shippingAddress.phone}</p>
            </address>
          ) : (
            <p className="text-sm text-muted">No address recorded.</p>
          )}
        </section>

        {/* Payment */}
        <section className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">
            Payment
          </h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate">Gateway</dt>
              <dd className="text-ink capitalize">{order.payment?.gateway ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate">Method</dt>
              <dd className="text-ink">{order.payment?.method ?? '—'}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate">Payment Status</dt>
              <dd>
                <StatusChip status={order.payment?.status ?? 'pending'} />
              </dd>
            </div>
            {order.payment?.razorpayPaymentId && (
              <div className="flex justify-between">
                <dt className="text-slate">Payment ID</dt>
                <dd className="font-jbmono text-xs text-slate truncate max-w-[160px]">
                  {order.payment.razorpayPaymentId}
                </dd>
              </div>
            )}
            {order.payment?.paidAt && (
              <div className="flex justify-between">
                <dt className="text-slate">Paid At</dt>
                <dd className="text-ink">{formatDate(order.payment.paidAt)}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Billing Summary */}
        <section className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">
            Billing
          </h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate">Subtotal</dt>
              <dd className="text-ink">{inr(order.billing?.subtotal)}</dd>
            </div>
            {typeof order.billing?.couponDiscount === 'number' &&
              order.billing.couponDiscount > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate">
                  Coupon{order.billing.couponCode ? ` (${order.billing.couponCode})` : ''}
                </dt>
                <dd className="text-green-700">−{inr(order.billing.couponDiscount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate">Shipping</dt>
              <dd className="text-ink">{inr(order.billing?.shippingCharge)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate">Shipping Tax</dt>
              <dd className="text-ink">{inr(order.billing?.shippingTax)}</dd>
            </div>
            {typeof order.walletApplied === 'number' && order.walletApplied > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate">Wallet Applied</dt>
                <dd className="text-green-700">−{inr(order.walletApplied)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-1 mt-1 font-semibold">
              <dt className="text-slate">Total</dt>
              <dd className="text-ink">{inr(order.billing?.total)}</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Tracking Info */}
      {order.trackingInfo &&
        (order.trackingInfo.courier || order.trackingInfo.trackingId) && (
        <section className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">
            Tracking
          </h2>
          <dl className="space-y-1 text-sm">
            {order.trackingInfo.courier && (
              <div className="flex justify-between">
                <dt className="text-slate">Courier</dt>
                <dd className="text-ink">{order.trackingInfo.courier}</dd>
              </div>
            )}
            {order.trackingInfo.trackingId && (
              <div className="flex justify-between">
                <dt className="text-slate">Tracking ID</dt>
                <dd className="font-jbmono text-xs text-slate">{order.trackingInfo.trackingId}</dd>
              </div>
            )}
            {order.trackingInfo.trackingUrl && (
              <div className="flex justify-between">
                <dt className="text-slate">Tracking URL</dt>
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
      <section className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] overflow-hidden">
        <div className="px-5 py-3 bg-white/50 border-b border-line">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate">
            Line Items ({typeof order.items?.length === 'number' ? order.items.length : '—'})
          </h2>
        </div>

        {!Array.isArray(order.items) || order.items.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted">No items.</p>
        ) : (
          <div className="divide-y divide-line">
            {order.items.map((item, idx) => (
              <div key={item.variantId ?? item.sku ?? idx} className="flex items-start gap-3 px-5 py-3">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.productName ?? ''}
                    className="h-14 w-14 rounded border border-line object-cover shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 rounded border border-line bg-black/5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {item.productName ?? '—'}
                  </p>
                  <p className="text-xs text-slate font-jbmono">{item.sku ?? '—'}</p>
                  {Array.isArray(item.attributeLabels) && item.attributeLabels.length > 0 && (
                    <p className="text-xs text-muted mt-0.5">
                      {item.attributeLabels.join(' / ')}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right space-y-0.5">
                  <p className="text-sm font-semibold text-ink">
                    {inr(
                      typeof item.priceAtPurchase === 'number' &&
                      typeof item.qty === 'number'
                        ? item.priceAtPurchase * item.qty
                        : undefined,
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    {inr(item.priceAtPurchase)} × {typeof item.qty === 'number' ? item.qty : '—'}
                  </p>
                  {typeof item.originalPriceAtPurchase === 'number' &&
                    typeof item.priceAtPurchase === 'number' &&
                    item.originalPriceAtPurchase > item.priceAtPurchase && (
                    <p className="text-xs text-muted line-through">
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
      <section className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate">
          Actions
        </h2>

        {/* Status change */}
        {nextStatuses.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate">Update Status</p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label htmlFor="next-status" className="text-xs text-slate">
                  New status
                </label>
                <select
                  id="next-status"
                  value={pendingStatus}
                  onChange={(e) => setPendingStatus(e.target.value as OrderStatus | '')}
                  className="rounded border border-line bg-white px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
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
                <label htmlFor="status-note" className="text-xs text-slate">
                  Note (optional)
                </label>
                <input
                  id="status-note"
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Internal note for this transition"
                  className="w-full rounded border border-line bg-white px-3 py-1.5 text-sm text-ink placeholder-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <button
                onClick={handleStatusChange}
                disabled={!pendingStatus || updateStatus.isPending}
                className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {updateStatus.isPending ? 'Updating…' : 'Apply'}
              </button>
            </div>
          </div>
        )}

        {nextStatuses.length === 0 && (
          <p className="text-sm text-muted">
            No further status transitions are available for this order.
          </p>
        )}

        {/* Refund */}
        {canRefund && (
          <div className="border-t border-line pt-4">
            <p className="text-sm font-medium text-slate mb-2">Refund</p>
            <button
              onClick={handleRefund}
              disabled={refundOrder.isPending}
              className="rounded border border-red-300 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {refundOrder.isPending ? 'Initiating Refund…' : 'Initiate Refund'}
            </button>
            <p className="mt-1 text-xs text-muted">
              Marks the order as refunded. Payment gateway refund requires manual follow-up.
            </p>
          </div>
        )}
      </section>

      {/* Timeline */}
      {Array.isArray(order.timeline) && order.timeline.length > 0 && (
        <section className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate">
            Timeline
          </h2>
          <ol className="relative border-l border-line space-y-4 ml-2">
            {order.timeline.map((entry, idx) => (
              <li key={`${entry.status}-${entry.timestamp}`} className="ml-4">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-muted" />
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip status={entry.status} />
                  <span className="text-xs text-muted">{formatDate(entry.timestamp)}</span>
                </div>
                {entry.note && (
                  <p className="mt-1 text-xs text-slate">{entry.note}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
