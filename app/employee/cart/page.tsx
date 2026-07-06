'use client';

import Link from 'next/link';
import { useEmployeeCart, useEmployeeCartMutations } from '@/lib/employee/cart';
import CartView from '@/components/CartView';
import { primaryBtn } from '@/components/employee/ui';

export default function EmployeeCartPage() {
  const { data: cart, isLoading, error } = useEmployeeCart();
  const mutations = useEmployeeCartMutations();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef0f8]">
        <p className="font-display text-slate">Loading cart…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef0f8]">
        <p className="font-display text-[#e0524d]">Failed to load cart. Please try again.</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#eef0f8] font-display">
        <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink">Your cart is empty</h1>
        <p className="text-slate">Browse our catalog to add items.</p>
        <Link href="/employee/products" className={`${primaryBtn} px-6 py-2.5`}>
          Browse Products
        </Link>
      </div>
    );
  }

  return <CartView cart={cart} mutations={mutations} checkoutHref="/employee/checkout" checkoutLabel="Proceed to Checkout" productHrefBase="/employee/products" enforceMoq={false} />;
}
