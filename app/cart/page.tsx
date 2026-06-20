'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart, useCartMutations } from '@/lib/cart';
import { ApiError } from '@/lib/api';

function formatPrice(value: number): string {
  return `₹${value.toFixed(2)}`;
}

export default function CartPage() {
  const { data: cart, isLoading, error } = useCart();
  const { setQty, remove, clear, applyCoupon, removeCoupon } = useCartMutations();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading cart…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load cart. Please try again.</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Your cart is empty</h1>
        <p className="text-gray-500">Browse our catalog to add items.</p>
        <Link
          href="/products"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={() => clear.mutate()}
          disabled={clear.isPending}
          className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
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
              className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
            >
              {/* Image */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    No image
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productSlug}`}
                  className="font-semibold text-gray-900 hover:text-blue-600 truncate block"
                >
                  {item.productName}
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">SKU: {item.sku}</p>
                {item.attributeLabels.length > 0 && (
                  <p className="text-sm text-gray-500">{item.attributeLabels.join(' / ')}</p>
                )}
                <p className="text-sm font-medium text-gray-700 mt-1">
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
                <p className="font-bold text-gray-900">{formatPrice(item.priceSnapshot * item.qty)}</p>

                {/* Qty stepper */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const next = item.qty - 1;
                      if (next >= item.moq) {
                        setQty.mutate({ variantId: item.variantId, qty: next });
                      }
                    }}
                    disabled={item.qty <= item.moq || setQty.isPending}
                    className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-medium">{item.qty}</span>
                  <button
                    onClick={() => setQty.mutate({ variantId: item.variantId, qty: item.qty + 1 })}
                    disabled={setQty.isPending}
                    className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {item.moq > 1 && (
                  <p className="text-xs text-gray-400">Min. qty: {item.moq}</p>
                )}

                <button
                  onClick={() => remove.mutate({ variantId: item.variantId })}
                  disabled={remove.isPending}
                  className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
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
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-3">Coupon</h2>

            {cart.coupon ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {cart.coupon.code}
                  </span>
                  <button
                    onClick={handleRemoveCoupon}
                    disabled={removeCoupon.isPending}
                    className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-sm text-green-600">
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
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || applyCoupon.isPending}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-500">{couponError}</p>
                )}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-800">Order Summary</h2>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal ({cart.itemCount} items)</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            {cart.coupon && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>−{formatPrice(cart.coupon.discountAmount)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </div>

          {cart.hasMoqViolations && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Some items are below their minimum order quantity. Please adjust quantities.
            </p>
          )}

          <Link
            href="/quotation"
            className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Request Quotation
          </Link>
        </div>
      </div>
    </main>
  );
}
