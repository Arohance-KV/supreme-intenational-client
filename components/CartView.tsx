'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Cart } from '@/lib/cart';
import type { useCartMutations } from '@/lib/cart';
import { ApiError } from '@/lib/api';
import { glass, primaryBtn, secondaryBtn, input } from '@/components/employee/ui';

function formatPrice(value: number): string {
  return `₹${value.toFixed(2)}`;
}

interface CartViewProps {
  cart: Cart;
  mutations: ReturnType<typeof useCartMutations>;
  checkoutHref: string;
  checkoutLabel?: string;
  productHrefBase?: string;
  // Employees are not bound by MOQ; pass false to allow any qty >= 1.
  enforceMoq?: boolean;
}

export default function CartView({ cart, mutations, checkoutHref, checkoutLabel = 'Request Quotation', productHrefBase = '/products', enforceMoq = true }: CartViewProps) {
  const { setQty, remove, clear, applyCoupon, removeCoupon } = mutations;
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    setCouponError(null);
    try {
      await applyCoupon.mutateAsync({ code: couponCode.trim() });
      setCouponCode('');
    } catch (err) {
      if (err instanceof ApiError) {
        setCouponError(err.message);
      } else {
        setCouponError('Failed to apply coupon');
      }
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponError(null);
    try {
      await removeCoupon.mutateAsync();
    } catch (err) {
      setCouponError(err instanceof ApiError ? err.message : 'Failed to remove coupon');
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 font-display">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Shopping Cart</h1>
        <button
          onClick={() => clear.mutate()}
          disabled={clear.isPending}
          className="text-sm text-slate hover:text-[#e0524d] disabled:opacity-50"
        >
          Clear cart
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items list */}
        <div className="flex-1 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.variantId}
              className={`flex gap-4 ${glass} rounded-[16px] p-4`}
            >
              {/* Image */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white/40">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                    No image
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`${productHrefBase}/${item.productSlug}`}
                  className="font-semibold text-ink hover:text-indigo truncate block"
                >
                  {item.productName}
                </Link>
                <p className="text-muted font-jbmono text-[11px] mt-0.5">SKU: {item.sku}</p>
                {item.attributeLabels.length > 0 && (
                  <p className="text-muted font-jbmono text-[11px]">{item.attributeLabels.join(' / ')}</p>
                )}
                <p className="text-sm font-medium text-ink mt-1">
                  Unit price: {formatPrice(item.priceSnapshot)}
                </p>
                {item.priceChanged && (
                  <p className="text-xs text-amber-600 mt-0.5">
                    Price changed — current: {formatPrice(item.currentPrice)}
                  </p>
                )}
              </div>

              {/* Qty + total + remove */}
              <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                <p className="font-extrabold text-ink">{formatPrice(item.priceSnapshot * item.qty)}</p>

                {/* Qty stepper */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const floor = enforceMoq ? item.moq : 1;
                      const next = item.qty - 1;
                      if (next >= floor) {
                        setQty.mutate({ variantId: item.variantId, qty: next });
                      }
                    }}
                    disabled={item.qty <= (enforceMoq ? item.moq : 1) || setQty.isPending}
                    className={`${secondaryBtn} h-8 w-8 flex items-center justify-center`}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-ink">{item.qty}</span>
                  <button
                    onClick={() => setQty.mutate({ variantId: item.variantId, qty: item.qty + 1 })}
                    disabled={setQty.isPending}
                    className={`${secondaryBtn} h-8 w-8 flex items-center justify-center`}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {enforceMoq && item.moq > 1 && (
                  <p className="text-xs text-muted">Min. qty: {item.moq}</p>
                )}

                <button
                  onClick={() => remove.mutate({ variantId: item.variantId })}
                  disabled={remove.isPending}
                  className="text-xs text-slate hover:text-[#e0524d] disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          {/* Coupon */}
          <div className={`${glass} rounded-[20px] p-4`}>
            <h2 className="font-semibold text-ink mb-3">Coupon</h2>

            {cart.coupon ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-jbmono bg-white/50 border border-line px-2 py-1 rounded text-ink">
                    {cart.coupon.code}
                  </span>
                  <button
                    onClick={handleRemoveCoupon}
                    disabled={removeCoupon.isPending}
                    className="text-xs text-slate hover:text-[#e0524d] disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-sm text-[#1a8f5a]">
                  Discount: −{formatPrice(cart.coupon.discountAmount)}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError(null);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(); }}
                    placeholder="Coupon code"
                    className={`${input} flex-1`}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || applyCoupon.isPending}
                    className={`${secondaryBtn} px-4 py-2 text-sm`}
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[#e0524d] text-sm">{couponError}</p>
                )}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className={`${glass} rounded-[20px] p-6 space-y-3`}>
            <h2 className="font-semibold text-ink">Order Summary</h2>
            <div className="flex justify-between text-sm text-slate">
              <span>Subtotal ({cart.itemCount} items)</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            {cart.coupon && (
              <div className="flex justify-between text-sm text-[#1a8f5a]">
                <span>Discount</span>
                <span>−{formatPrice(cart.coupon.discountAmount)}</span>
              </div>
            )}
            <div className="border-t border-line pt-3 flex justify-between font-extrabold text-ink">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </div>

          {enforceMoq && cart.hasMoqViolations && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Some items are below their minimum order quantity. Please adjust quantities.
            </p>
          )}

          <Link
            href={checkoutHref}
            className={`${primaryBtn} block w-full text-center py-3`}
          >
            {checkoutLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
