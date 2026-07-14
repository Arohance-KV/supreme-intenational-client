'use client';

import { use } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrder, useRetryPayment, useVerifyPayment } from '@/lib/employee/orders';
import { loadRazorpay, openRazorpay } from '@/lib/employee/razorpay';
import { glass, eyebrow, pageWrap, statusPill, primaryBtn } from '@/components/employee/ui';
import { useConfirm } from '@/components/ConfirmDialog';

function fmt(n: number | undefined | null) {
  if (n === undefined || n === null) return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function fmtDate(s: string | undefined) {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBanner({ status, paymentStatus }: { status: string; paymentStatus?: string }) {
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-[rgba(224,163,59,.14)] border border-[rgba(224,163,59,.3)] px-5 py-4">
        {/* Spinner */}
        <svg
          className="animate-spin h-5 w-5 text-[#b5801e] flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        <p className="text-[#b5801e] font-medium">Payment processing — confirming your order…</p>
      </div>
    );
  }

  if (
    status === 'confirmed' ||
    status === 'processing' ||
    status === 'shipped' ||
    status === 'delivered'
  ) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-[rgba(31,170,107,.12)] border border-[rgba(31,170,107,.25)] px-5 py-4">
        <svg className="h-5 w-5 text-[#1a8f5a] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-[#1a8f5a] font-medium">
          {status === 'confirmed' && 'Order confirmed'}
          {status === 'processing' && 'Order is being processed'}
          {status === 'shipped' && 'Order shipped'}
          {status === 'delivered' && 'Order delivered'}
        </p>
      </div>
    );
  }

  // cancelled / refunded / payment failed
  return (
    <div className="rounded-xl bg-[rgba(224,82,77,.1)] border border-[rgba(224,82,77,.3)] px-5 py-4">
      <p className="text-[#e0524d] font-medium">
        {status === 'cancelled' && 'This order was cancelled'}
        {status === 'refunded' && 'This order was refunded'}
        {status !== 'cancelled' && status !== 'refunded' &&
          (paymentStatus === 'failed' ? 'Payment failed' : 'Order could not be processed')}
      </p>
    </div>
  );
}

// Linear progress steps for the happy path. Cancelled/refunded orders keep
// every dot in the pending state — the status pill in the header already
// communicates that terminal state.
const TIMELINE_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'] as const;

function timelineStepIndex(status: string): number {
  if (status === 'processing') return 1; // "processing" reads as post-confirmation
  return TIMELINE_STEPS.indexOf(status as (typeof TIMELINE_STEPS)[number]);
}

function StatusTimeline({ status }: { status: string }) {
  const currentIdx = timelineStepIndex(status);
  return (
    <ol>
      {TIMELINE_STEPS.map((step, i) => {
        const completed = currentIdx >= 0 && i <= currentIdx;
        const isCurrent = i === currentIdx;
        const isLast = i === TIMELINE_STEPS.length - 1;
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                aria-current={isCurrent ? 'step' : undefined}
                className={`h-3 w-3 flex-shrink-0 rounded-full ${completed ? 'bg-accent' : 'bg-line'}`}
              />
              {!isLast && <div className="w-px flex-1 min-h-[24px] border-l border-line" />}
            </div>
            <p className={`font-jbmono text-[11px] uppercase text-slate ${isLast ? '' : 'pb-6'}`}>{step}</p>
          </li>
        );
      })}
    </ol>
  );
}

function isRetriable(status: string, paymentStatus?: string) {
  return status === 'cancelled' || paymentStatus === 'failed';
}

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { alert } = useConfirm();
  const queryClient = useQueryClient();
  const { data: order, isLoading, isError } = useOrder(orderId);
  const retry = useRetryPayment();
  const verifyPayment = useVerifyPayment();

  async function handleRetry() {
    try {
      const result = await retry.mutateAsync({ orderId });
      const loaded = await loadRazorpay();
      if (!loaded) {
        await alert({
          title: 'Payment gateway error',
          message: 'Failed to load payment gateway. Please check your internet connection.',
        });
        return;
      }
      // Read response defensively — server may use different field names
      const rzpOrderId = result.razorpayOrderId ?? result.orderId ?? '';
      const rzpKey = result.razorpayKeyId ?? result.keyId ?? '';
      const rzpAmount = result.amountInPaise ?? result.amount ?? 0;
      const rzpCurrency = result.currency ?? 'INR';

      openRazorpay({
        key: rzpKey,
        orderId: rzpOrderId,
        amount: rzpAmount,
        currency: rzpCurrency,
        name: 'Supreme International',
        onSuccess: async (r) => {
          // Confirm immediately; the webhook is the backstop if this fails.
          try {
            await verifyPayment.mutateAsync({ orderId, payment: r });
          } catch {
            queryClient.invalidateQueries({ queryKey: ['employee', 'order', orderId] });
          }
        },
        onDismiss: () => {
          queryClient.invalidateQueries({ queryKey: ['employee', 'order', orderId] });
        },
      });
    } catch {
      await alert({
        title: 'Retry failed',
        message: 'Could not initiate retry. Please try again.',
      });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#eef0f8] flex items-center justify-center font-display">
        <p className="text-slate animate-pulse">Loading order…</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-[#eef0f8] flex items-center justify-center font-display">
        <p className="text-[#e0524d]">Could not load order details. Please try again.</p>
      </div>
    );
  }

  const showRetry = isRetriable(order.status, order.payment?.status);

  return (
    <div className={`min-h-screen bg-[#eef0f8] ${pageWrap}`}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={eyebrow}>ORDER</p>
            <p className="text-lg font-semibold font-jbmono text-ink">{order.orderId}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={statusPill(order.status)}>{order.status}</span>
            {order.createdAt && (
              <p className="text-xs text-muted">{fmtDate(order.createdAt)}</p>
            )}
          </div>
        </div>

        {/* Status timeline */}
        <div className={`${glass} rounded-[20px] p-6`}>
          <StatusTimeline status={order.status} />
        </div>

        {/* Status banner */}
        <StatusBanner status={order.status} paymentStatus={order.payment?.status} />

        {/* Retry button */}
        {showRetry && (
          <button
            onClick={handleRetry}
            disabled={retry.isPending}
            className={`${primaryBtn} w-full py-3`}
          >
            {retry.isPending ? 'Opening payment…' : 'Retry Payment'}
          </button>
        )}

        {/* Items */}
        <section className={`${glass} rounded-[20px] p-6`}>
          <h2 className="text-base font-semibold text-ink mb-4">Items</h2>
          <ul className="divide-y divide-line">
            {(order.items ?? []).map((item, i) => (
              <li key={i} className="py-3 flex gap-4 items-start">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-16 h-16 rounded-lg object-cover border border-line flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{item.productName}</p>
                  {item.sku && (
                    <p className="text-xs text-muted">SKU: {item.sku}</p>
                  )}
                  {(item.attributeLabels?.length ?? 0) > 0 && (
                    <p className="text-xs text-slate">{item.attributeLabels.join(', ')}</p>
                  )}
                  <p className="text-xs text-slate mt-1">Qty: {item.qty}</p>
                </div>
                <p className="text-sm font-medium text-ink whitespace-nowrap">
                  {fmt((item.priceAtPurchase ?? 0) * (item.qty ?? 0))}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Billing */}
        <section className={`${glass} rounded-[20px] p-6 space-y-2`}>
          <h2 className="text-base font-semibold text-ink mb-4">Billing</h2>
          <div className="flex justify-between text-sm text-slate">
            <span>Subtotal</span>
            <span>{fmt(order.billing?.subtotal)}</span>
          </div>
          {!!order.billing?.couponDiscount && (
            <div className="flex justify-between text-sm text-accent">
              <span>Coupon discount</span>
              <span>-{fmt(order.billing.couponDiscount)}</span>
            </div>
          )}
          {!!order.billing?.shippingCharge && (
            <div className="flex justify-between text-sm text-slate">
              <span>Shipping</span>
              <span>{fmt(order.billing.shippingCharge)}</span>
            </div>
          )}
          {!!order.walletApplied && (
            <div className="flex justify-between text-sm text-accent">
              <span>Wallet applied</span>
              <span>-{fmt(order.walletApplied)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold text-ink pt-2 border-t border-line">
            <span>Total</span>
            <span>{fmt(order.billing?.total)}</span>
          </div>
        </section>

        {/* Payment info */}
        {order.payment && (
          <section className={`${glass} rounded-[20px] p-6`}>
            <h2 className="text-base font-semibold text-ink mb-3">Payment</h2>
            <div className="flex justify-between text-sm text-slate">
              <span>Status</span>
              <span className="capitalize font-medium text-ink">{order.payment.status ?? '—'}</span>
            </div>
            {order.payment.method && (
              <div className="flex justify-between text-sm text-slate mt-1">
                <span>Method</span>
                <span>{order.payment.method}</span>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
