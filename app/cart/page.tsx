'use client';

import Link from 'next/link';
import { useCart, useCartMutations } from '@/lib/cart';
import QuotationCartView from '@/components/QuotationCartView';

export default function CartPage() {
  const { data: cart, isLoading, error } = useCart();
  const mutations = useCartMutations();

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

  return <QuotationCartView cart={cart} mutations={mutations} />;
}
