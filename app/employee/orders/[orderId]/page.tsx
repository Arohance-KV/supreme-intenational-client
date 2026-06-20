'use client';

import { use } from 'react';
import { useOrder, useRetryPayment } from '@/lib/employee/orders';
import { loadRazorpay, openRazorpay } from '@/lib/employee/razorpay';

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
      <div className="flex items-center gap-3 rounded-xl bg-yellow-50 border border-yellow-200 px-5 py-4">
        {/* Spinner */}
        <svg
          className="animate-spin h-5 w-5 text-yellow-500 flex-shrink-0"
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
        <p className="text-yellow-800 font-medium">Payment processing — confirming your order…</p>
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
      <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-5 py-4">
        <svg className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-green-800 font-medium">
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
    <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4">
      <p className="text-red-700 font-medium">
        {status === 'cancelled' && 'This order was cancelled'}
        {status === 'refunded' && 'This order was refunded'}
        {status !== 'cancelled' && status !== 'refunded' &&
          (paymentStatus === 'failed' ? 'Payment failed' : 'Order could not be processed')}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-700',
  };
  const cls = map[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {status}
    </span>
  );
}

function isRetriable(status: string, paymentStatus?: string) {
  return (
    status === 'cancelled' ||
    status === 'refunded' ||
    paymentStatus === 'failed' ||
    paymentStatus === 'refunded'
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { data: order, isLoading, isError } = useOrder(orderId);
  const retry = useRetryPayment();

  async function handleRetry() {
    try {
      const result = await retry.mutateAsync({ orderId });
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert('Failed to load payment gateway. Please check your internet connection.');
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
        onSuccess: () => {
          // Polling will auto-update when status changes
        },
        onDismiss: () => {
          // Stay on page; polling continues
        },
      });
    } catch {
      alert('Could not initiate retry. Please try again.');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading order…</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Could not load order details. Please try again.</p>
      </div>
    );
  }

  const showRetry = isRetriable(order.status, order.payment?.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">Order ID</p>
          <p className="text-lg font-semibold text-gray-800 font-mono">{order.orderId}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={order.status} />
          {order.createdAt && (
            <p className="text-xs text-gray-400">{fmtDate(order.createdAt)}</p>
          )}
        </div>
      </div>

      {/* Status banner */}
      <StatusBanner status={order.status} paymentStatus={order.payment?.status} />

      {/* Retry button */}
      {showRetry && (
        <button
          onClick={handleRetry}
          disabled={retry.isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {retry.isPending ? 'Opening payment…' : 'Retry Payment'}
        </button>
      )}

      {/* Items */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Items</h2>
        <ul className="divide-y divide-gray-100">
          {(order.items ?? []).map((item, i) => (
            <li key={i} className="py-3 flex gap-4 items-start">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                {item.sku && (
                  <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                )}
                {item.attributeLabels?.length > 0 && (
                  <p className="text-xs text-gray-500">{item.attributeLabels.join(', ')}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Qty: {item.qty}</p>
              </div>
              <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
                {fmt(item.priceAtPurchase * item.qty)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Billing */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-2">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Billing</h2>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>{fmt(order.billing?.subtotal)}</span>
        </div>
        {!!order.billing?.couponDiscount && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Coupon discount</span>
            <span>-{fmt(order.billing.couponDiscount)}</span>
          </div>
        )}
        {!!order.billing?.shippingCharge && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Shipping</span>
            <span>{fmt(order.billing.shippingCharge)}</span>
          </div>
        )}
        {!!order.walletApplied && (
          <div className="flex justify-between text-sm text-blue-600">
            <span>Wallet applied</span>
            <span>-{fmt(order.walletApplied)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-semibold text-gray-800 pt-2 border-t border-gray-100">
          <span>Total</span>
          <span>{fmt(order.billing?.total)}</span>
        </div>
      </section>

      {/* Payment info */}
      {order.payment && (
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Payment</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Status</span>
            <span className="capitalize font-medium">{order.payment.status ?? '—'}</span>
          </div>
          {order.payment.method && (
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Method</span>
              <span>{order.payment.method}</span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
