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
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  // When the company runs on coupons, an order below the coupon value forfeits the
  // remainder — hold that amount to confirm before placing the order.
  const [couponForfeit, setCouponForfeit] = useState<number | null>(null);

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
        couponCode: couponCode.trim() || undefined,
      });

      if (result.fullyPaidByWallet) {
        setOrderPlaced(true);
        setSubmitting(false);
        router.push('/employee/orders/' + result.orderId);
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
          router.push('/employee/orders/' + result.orderId);
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
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left: Address Form */}
        <div className={`${glass} rounded-[22px] p-6`}>
          <h2 className="text-xl font-semibold text-ink mb-6">Shipping Address</h2>
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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

            <div className="pt-2">
              <label className={label}>
                Coupon Code (optional)
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className={input}
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
          <div className={`${glass} rounded-[20px] p-6`}>
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
          <div className={`${glass} rounded-[20px] p-6`}>
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
              {cart?.coupon && (
                <div className="flex justify-between text-sm text-accent">
                  <span>Coupon ({cart.coupon.code})</span>
                  <span>-₹{cart.coupon.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-ink pt-1">
                <span>Total</span>
                <span>₹{cart?.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon forfeiture warning */}
      {couponForfeit !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,23,58,.42)] p-4 backdrop-blur-sm">
          <div className={`${glass} w-full max-w-md rounded-[22px] p-6`}>
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
