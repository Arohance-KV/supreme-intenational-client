'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployeeCart } from '@/lib/employee/cart';
import { useWallet } from '@/lib/employee/wallet';
import { useEmployeeCheckout, type ShippingAddress } from '@/lib/employee/checkout';
import { useVerifyPayment } from '@/lib/employee/orders';
import { loadRazorpay, openRazorpay } from '@/lib/employee/razorpay';
import { ApiError } from '@/lib/api';
import { glass, primaryBtn, input, label, eyebrow, pageWrap, errorBanner } from '@/components/employee/ui';

const INITIAL_ADDRESS: ShippingAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export default function EmployeeCheckoutPage() {
  const router = useRouter();
  const { data: cart, isLoading: cartLoading } = useEmployeeCart();
  const { data: wallet } = useWallet();
  const checkout = useEmployeeCheckout();
  const verifyPayment = useVerifyPayment();

  const [address, setAddress] = useState<ShippingAddress>(INITIAL_ADDRESS);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  // When the company runs on coupons, an order below the coupon value forfeits the
  // remainder — hold that amount to confirm before placing the order.
  const [couponForfeit, setCouponForfeit] = useState<number | null>(null);
  // Set once the order is genuinely placed (wallet-paid or payment verified) — drives
  // the success confirmation dialog. Not set on a dismissed/incomplete payment.
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  // Redirect if cart is empty (after data loads)
  useEffect(() => {
    if (orderPlaced) return;
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      router.replace('/employee/products');
    }
  }, [cartLoading, cart, router, orderPlaced]);

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#eef0f8] flex items-center justify-center font-display">
        <p className="text-slate">Loading…</p>
      </div>
    );
  }

  function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Coupon mode: if the order is below the coupon value, warn about forfeiture first.
    const forfeit =
      wallet?.walletMode === 'coupon' && cart && wallet.balance > cart.total
        ? wallet.balance - cart.total
        : 0;
    if (forfeit > 0) {
      setCouponForfeit(forfeit);
      return;
    }
    void runCheckout();
  }

  async function runCheckout() {
    setError(null);
    setSubmitting(true);

    const shippingAddress: ShippingAddress = {
      ...address,
      line2: address.line2 || '',
      country: address.country || 'India',
    };

    try {
      const result = await checkout.mutateAsync({
        shippingAddress,
      });

      if (result.fullyPaidByWallet) {
        setOrderPlaced(true);
        setSubmitting(false);
        setSuccessOrderId(result.orderId);
        return;
      }

      // Razorpay flow
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError('Failed to load payment gateway. Please check your internet connection and try again.');
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      openRazorpay({
        key: result.razorpayKeyId,
        orderId: result.razorpayOrderId,
        amount: result.amountInPaise,
        currency: result.currency,
        name: 'Supreme International',
        onSuccess: async (r) => {
          setOrderPlaced(true);
          // Confirm immediately from the browser; the webhook is the backstop if this fails.
          try {
            await verifyPayment.mutateAsync({ orderId: result.orderId, payment: r });
          } catch {
            // ignore — the order page polls and the webhook will confirm
          }
          setSuccessOrderId(result.orderId);
        },
        onDismiss: () => {
          setOrderPlaced(true);
          router.push('/employee/orders/' + result.orderId);
        },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
      setSubmitting(false);
    }
  }

  const walletBalance = wallet?.balance ?? 0;

  return (
    <div className={`min-h-screen bg-[#eef0f8] ${pageWrap}`}>
      <div className="max-w-4xl mx-auto">
        <p className={eyebrow}>CHECKOUT</p>
        <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink mb-6">Checkout</h1>
      </div>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">

        {/* Left: Address Form */}
        <div className={`${glass} rounded-[22px] p-5 sm:p-6`}>
          <h2 className="text-lg font-semibold text-ink mb-5 sm:text-xl sm:mb-6">Shipping Address</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Full Name"
              name="fullName"
              value={address.fullName}
              onChange={handleAddressChange}
              required
              placeholder="John Doe"
            />
            <Field
              label="Phone"
              name="phone"
              value={address.phone}
              onChange={handleAddressChange}
              required
              placeholder="+91 98765 43210"
              type="tel"
            />
            <Field
              label="Address Line 1"
              name="line1"
              value={address.line1}
              onChange={handleAddressChange}
              required
              placeholder="House/Flat No., Street"
            />
            <Field
              label="Address Line 2 (optional)"
              name="line2"
              value={address.line2 ?? ''}
              onChange={handleAddressChange}
              placeholder="Landmark, Area"
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Field
                label="City"
                name="city"
                value={address.city}
                onChange={handleAddressChange}
                required
                placeholder="Mumbai"
              />
              <Field
                label="State"
                name="state"
                value={address.state}
                onChange={handleAddressChange}
                required
                placeholder="Maharashtra"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Field
                label="Pincode"
                name="pincode"
                value={address.pincode}
                onChange={handleAddressChange}
                required
                placeholder="400001"
                inputMode="numeric"
              />
              <Field
                label="Country"
                name="country"
                value={address.country ?? 'India'}
                onChange={handleAddressChange}
                placeholder="India"
              />
            </div>

            {error && (
              <div className={errorBanner}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`${primaryBtn} w-full py-3`}
            >
              {submitting ? 'Processing…' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-4">
          {/* Wallet Balance */}
          <div className={`${glass} rounded-[20px] p-5 sm:p-6`}>
            <h2 className="text-lg font-semibold text-ink mb-2">Wallet Balance</h2>
            <span className="inline-block bg-[rgba(23,155,142,.12)] text-accent border border-[rgba(23,155,142,.25)] rounded-full px-3 py-1 font-jbmono text-sm">
              ₹{walletBalance.toFixed(2)}
            </span>
            {walletBalance > 0 && (
              <p className="text-xs text-slate mt-2">
                Your wallet balance will be applied automatically at checkout.
              </p>
            )}
          </div>

          {/* Cart Summary */}
          <div className={`${glass} rounded-[20px] p-5 sm:p-6`}>
            <h2 className="text-lg font-semibold text-ink mb-4">Order Summary</h2>
            <ul className="divide-y divide-line">
              {cart?.items.map((item) => (
                <li key={item.variantId} className="py-3 flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-ink truncate">{item.productName}</p>
                    {item.attributeLabels.length > 0 && (
                      <p className="text-xs text-slate">{item.attributeLabels.join(', ')}</p>
                    )}
                    <p className="text-xs text-slate">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-medium text-ink whitespace-nowrap">
                    ₹{(item.priceSnapshot * item.qty).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-t border-line mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-slate">
                <span>Subtotal</span>
                <span>₹{cart?.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-ink pt-1">
                <span>Total</span>
                <span>₹{cart?.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order success confirmation */}
      {successOrderId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-success-title"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[rgba(16,17,40,.55)] backdrop-blur-md animate-[dc-overlay-in_.2s_ease-out]"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_40px_120px_rgba(16,17,40,.42)] animate-[dc-dialog-in_.3s_cubic-bezier(.2,.85,.25,1)]">
            {/* Celebratory gradient header with animated check */}
            <div className="relative flex items-center justify-center bg-[linear-gradient(135deg,#0f766e_0%,#149b8e_55%,#13b89f_120%)] px-8 pb-12 pt-11">
              <div className="pointer-events-none absolute -left-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative grid place-items-center">
                <span className="absolute h-[76px] w-[76px] rounded-full bg-white/25 motion-safe:animate-[sov-ring-pulse_2s_ease-out_infinite]" aria-hidden />
                <span className="absolute h-[76px] w-[76px] rounded-full bg-white/20 motion-safe:animate-[sov-ring-pulse_2s_.7s_ease-out_infinite]" aria-hidden />
                <span className="relative grid h-[72px] w-[72px] place-items-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,.18)]">
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#149b8e" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20 6L9 17l-5-5" strokeDasharray={30} strokeDashoffset={30} className="motion-safe:animate-[sov-check-draw_.5s_.2s_ease-out_forwards] motion-reduce:[stroke-dashoffset:0]" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-7 pb-7 pt-7 text-center sm:px-9">
              <h2 id="order-success-title" className="text-[26px] font-extrabold tracking-[-.02em] text-ink">Order received!</h2>
              <p className="mx-auto mt-2.5 max-w-xs text-[15px] leading-relaxed text-slate">
                Thank you — your order has been placed. We&apos;ll get it packed and on its way to you as soon as possible.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-[#f6f7fb] px-4 py-2">
                <span className="font-jbmono text-[10px] uppercase tracking-[.12em] text-muted">Order</span>
                <span className="font-jbmono text-sm font-bold text-ink">{successOrderId}</span>
              </div>
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.push('/employee/orders/' + successOrderId)}
                  className={`${primaryBtn} flex-1 py-3`}
                >
                  View order
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/employee/products')}
                  className="flex-1 rounded-[13px] border border-line px-4 py-3 text-sm font-semibold text-slate transition-colors hover:bg-[#f6f7fb]"
                >
                  Continue shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupon forfeiture warning */}
      {couponForfeit !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,23,58,.42)] p-4 backdrop-blur-sm">
          <div className={`${glass} w-full max-w-md rounded-[22px] p-5 sm:p-6`}>
            <h2 className="text-lg font-extrabold tracking-[-.01em] text-ink">Use your full coupon?</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              Your allocation is a <strong>coupon</strong> worth ₹{(wallet?.balance ?? 0).toLocaleString('en-IN')}.
              This order is ₹{(cart?.total ?? 0).toLocaleString('en-IN')}, so the remaining{' '}
              <strong className="text-[#e0524d]">₹{couponForfeit.toLocaleString('en-IN')}</strong> will be
              forfeited — it cannot be reused on a later order.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCouponForfeit(null)}
                className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-slate hover:bg-white/60"
              >
                Keep shopping
              </button>
              <button
                type="button"
                onClick={() => { setCouponForfeit(null); void runCheckout(); }}
                className="rounded-xl bg-gradient-to-br from-indigo to-indigo2 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Place order anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  inputMode?: 'text' | 'search' | 'none' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal';
}

function Field({ label: fieldLabel, name, value, onChange, required, placeholder, type = 'text', inputMode }: FieldProps) {
  return (
    <div>
      <label className={label}>
        {fieldLabel}
        {required && <span className="text-[#e0524d] ml-1">*</span>}
      </label>
      <input
        type={type}
        inputMode={inputMode}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={input}
      />
    </div>
  );
}
