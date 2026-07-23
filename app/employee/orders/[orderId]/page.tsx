'use client';

import { use } from 'react';
import Link from 'next/link';
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
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Horizontal tracking stepper (happy path) ──────────────────────────────────
const STEPS = ['Ordered', 'Confirmed', 'Shipped', 'Delivered'] as const;

function stepIndex(status: string): number {
  if (status === 'processing') return 1;
  return (['pending', 'confirmed', 'shipped', 'delivered'] as const).indexOf(status as never);
}

function Tracker({ status }: { status: string }) {
  const current = stepIndex(status);
  const last = STEPS.length - 1;
  return (
    <div className="flex items-start">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        // The segment INTO node i (left) is filled once node i is reached; the
        // segment OUT of node i (right) once you've moved past it. Both halves of
        // the join between i and i+1 light up together (iff i < current).
        return (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span className={`h-[3px] flex-1 rounded-full ${i === 0 ? 'opacity-0' : i <= current ? 'bg-accent' : 'bg-line'}`} />
              <span
                className={`mx-1 grid h-8 w-8 flex-none place-items-center rounded-full text-xs font-bold transition-colors ${
                  done ? 'bg-accent text-white' : active ? 'bg-accent text-white ring-4 ring-[rgba(20,155,142,.18)]' : 'bg-line text-muted'
                }`}
              >
                {done ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className={`h-[3px] flex-1 rounded-full ${i === last ? 'opacity-0' : i < current ? 'bg-accent' : 'bg-line'}`} />
            </div>
            <p className={`mt-2 text-center text-[11px] font-semibold sm:text-xs ${i <= current ? 'text-ink' : 'text-muted'}`}>{label}</p>
          </div>
        );
      })}
    </div>
  );
}

function TerminalBanner({ status, paymentStatus }: { status: string; paymentStatus?: string }) {
  const label =
    status === 'cancelled' ? 'This order was cancelled'
      : status === 'refunded' ? 'This order was refunded'
      : paymentStatus === 'failed' ? 'Payment failed' : 'Order could not be processed';
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-[rgba(224,82,77,.3)] bg-[rgba(224,82,77,.08)] px-5 py-4">
      <svg className="h-5 w-5 flex-none text-[#e0524d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <p className="font-medium text-[#e0524d]">{label}</p>
    </div>
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
        await alert({ title: 'Payment gateway error', message: 'Failed to load payment gateway. Please check your internet connection.' });
        return;
      }
      const rzpOrderId = result.razorpayOrderId ?? result.orderId ?? '';
      const rzpKey = result.razorpayKeyId ?? result.keyId ?? '';
      const rzpAmount = result.amountInPaise ?? result.amount ?? 0;
      const rzpCurrency = result.currency ?? 'INR';
      openRazorpay({
        key: rzpKey, orderId: rzpOrderId, amount: rzpAmount, currency: rzpCurrency, name: 'Supreme International',
        onSuccess: async (r) => {
          try { await verifyPayment.mutateAsync({ orderId, payment: r }); }
          catch { queryClient.invalidateQueries({ queryKey: ['employee', 'order', orderId] }); }
        },
        onDismiss: () => { queryClient.invalidateQueries({ queryKey: ['employee', 'order', orderId] }); },
      });
    } catch {
      await alert({ title: 'Retry failed', message: 'Could not initiate retry. Please try again.' });
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef0f8] font-display">
        <p className="animate-pulse text-slate">Loading order…</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef0f8] font-display">
        <p className="text-[#e0524d]">Could not load order details. Please try again.</p>
      </div>
    );
  }

  const showRetry = isRetriable(order.status, order.payment?.status);
  const isTerminal = ['cancelled', 'refunded'].includes(order.status) || order.payment?.status === 'failed';
  const isPending = order.status === 'pending';
  const saved = (order.billing?.couponDiscount ?? 0) + (order.walletApplied ?? 0);

  return (
    <div className={`min-h-screen bg-[#eef0f8] ${pageWrap}`}>
      <div className="mx-auto max-w-5xl">
        <Link href="/employee/orders" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate no-underline transition-colors hover:text-ink">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to orders
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Summary header */}
            <section className={`rounded-[22px] p-5 sm:p-6 ${glass}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className={`${eyebrow} mb-1`}>Order</p>
                  <p className="font-jbmono text-lg font-bold text-ink">{order.orderId}</p>
                  {order.createdAt && <p className="mt-1 text-xs text-muted">{fmtDate(order.createdAt)}</p>}
                </div>
                <div className="text-right">
                  <span className={statusPill(order.status)}>{order.status}</span>
                  <p className="mt-2 text-2xl font-extrabold tracking-[-.02em] text-ink">{fmt(order.billing?.total)}</p>
                  {saved > 0 && <p className="text-xs font-semibold text-[#1a8f5a]">You saved {fmt(saved)}</p>}
                </div>
              </div>
            </section>

            {/* Tracking / terminal */}
            {isTerminal ? (
              <TerminalBanner status={order.status} paymentStatus={order.payment?.status} />
            ) : (
              <section className={`rounded-[22px] p-6 sm:p-7 ${glass}`}>
                <h2 className="mb-6 text-base font-semibold text-ink">Order tracking</h2>
                <Tracker status={order.status} />
                {isPending && (
                  <div className="mt-6 flex items-center gap-3 rounded-[14px] border border-[rgba(224,163,59,.3)] bg-[rgba(224,163,59,.12)] px-4 py-3">
                    <svg className="h-5 w-5 flex-none animate-spin text-[#b5801e]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p className="text-sm font-medium text-[#b5801e]">Payment processing — confirming your order…</p>
                  </div>
                )}
              </section>
            )}

            {showRetry && (
              <button onClick={handleRetry} disabled={retry.isPending} className={`${primaryBtn} w-full py-3`}>
                {retry.isPending ? 'Opening payment…' : 'Retry payment'}
              </button>
            )}

            {/* Items */}
            <section className={`rounded-[22px] p-5 sm:p-6 ${glass}`}>
              <h2 className="mb-4 text-base font-semibold text-ink">Items ordered <span className="font-normal text-muted">({order.items?.length ?? 0})</span></h2>
              <ul className="divide-y divide-line/70">
                {(order.items ?? []).map((item, i) => (
                  <li key={i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.productName} className="h-16 w-16 flex-none rounded-[12px] border border-line object-cover" />
                    ) : (
                      <span className="h-16 w-16 flex-none rounded-[12px] border border-line bg-black/5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">{item.productName}</p>
                      {(item.attributeLabels?.length ?? 0) > 0 && (
                        <p className="mt-0.5 text-xs text-slate">{item.attributeLabels.join(' · ')}</p>
                      )}
                      {item.sku && <p className="mt-0.5 font-jbmono text-[11px] text-muted">{item.sku}</p>}
                      <p className="mt-1 text-xs text-slate">Qty: {item.qty}</p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-bold text-ink">{fmt((item.priceAtPurchase ?? 0) * (item.qty ?? 0))}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar: payment summary */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className={`rounded-[22px] p-5 sm:p-6 ${glass}`}>
              <h2 className="mb-4 text-base font-semibold text-ink">Payment details</h2>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm text-slate">
                  <span>Subtotal</span><span className="text-ink">{fmt(order.billing?.subtotal)}</span>
                </div>
                {!!order.billing?.couponDiscount && (
                  <div className="flex justify-between text-sm text-[#1a8f5a]">
                    <span>Coupon savings</span><span>−{fmt(order.billing.couponDiscount)}</span>
                  </div>
                )}
                {!!order.walletApplied && (
                  <div className="flex justify-between text-sm text-[#1a8f5a]">
                    <span>Wallet applied</span><span>−{fmt(order.walletApplied)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-slate">
                  <span>Delivery</span><span className="text-ink">{order.billing?.shippingCharge ? fmt(order.billing.shippingCharge) : 'Free'}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-line/70 pt-3 text-base font-extrabold text-ink">
                  <span>Total</span><span>{fmt(order.billing?.total)}</span>
                </div>
                {saved > 0 && (
                  <p className="rounded-lg bg-[rgba(31,170,107,.1)] px-3 py-2 text-center text-xs font-semibold text-[#1a8f5a]">
                    You saved {fmt(saved)} on this order
                  </p>
                )}
              </div>
            </section>

            {order.payment && (
              <section className={`rounded-[22px] p-5 sm:p-6 ${glass}`}>
                <h2 className="mb-3 text-base font-semibold text-ink">Payment method</h2>
                <div className="flex justify-between text-sm text-slate">
                  <span>Status</span><span className="font-medium capitalize text-ink">{order.payment.status ?? '—'}</span>
                </div>
                {order.payment.method && (
                  <div className="mt-1.5 flex justify-between text-sm text-slate">
                    <span>Method</span><span className="text-ink">{order.payment.method}</span>
                  </div>
                )}
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
