'use client';

import Link from 'next/link';
import type { Cart } from '@/lib/cart';
import type { useCartMutations } from '@/lib/cart';
import { glass, primaryBtn } from '@/components/employee/ui';
import CartItemRow from '@/components/CartItemRow';

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
  const { setQty, remove, clear } = mutations;

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
            <CartItemRow
              key={item.variantId}
              item={item}
              setQty={setQty}
              remove={remove}
              enforceMoq={enforceMoq}
              productHrefBase={productHrefBase}
            />
          ))}
        </div>

        {/* Order summary */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          {/* Totals */}
          <div className={`${glass} rounded-[20px] p-5 space-y-3 sm:p-6`}>
            <h2 className="font-semibold text-ink">Order Summary</h2>
            <div className="flex justify-between text-sm text-slate">
              <span>Subtotal ({cart.itemCount} items)</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
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
