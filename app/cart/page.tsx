'use client';

import Link from 'next/link';
import { useCart, useCartMutations } from '@/lib/cart';
import QuotationCartView from '@/components/QuotationCartView';

export default function CartPage() {
  const { data: cart, isLoading, error } = useCart();
  const mutations = useCartMutations();

  if (isLoading) {
    return (
      <CartShell>
        <p className="font-jbmono text-sm uppercase tracking-[.18em] text-muted">Loading cart…</p>
      </CartShell>
    );
  }

  if (error) {
    return (
      <CartShell>
        <p className="text-[15px] font-semibold text-[#d8524d]">Failed to load cart. Please try again.</p>
      </CartShell>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <CartShell>
        <EmptyCart />
      </CartShell>
    );
  }

  return <QuotationCartView cart={cart} mutations={mutations} />;
}

// Shared ambient page wrapper so the cart's empty / loading / error states match
// the rest of the design system instead of the bare default styling.
function CartShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="font-display relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-[#eef0f8] px-5 text-center text-ink selection:bg-[rgba(23,155,142,0.22)]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(20,155,142,.16),transparent_60%),radial-gradient(50%_45%_at_0%_6%,rgba(58,60,152,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />
      <div className="pointer-events-none fixed -right-[120px] -top-[160px] z-0 h-[500px] w-[500px] animate-blob1 rounded-full bg-[radial-gradient(circle,rgba(20,155,142,.16),transparent_70%)] blur-[20px]" />
      <div className="pointer-events-none fixed -bottom-[160px] -left-[120px] z-0 h-[460px] w-[460px] animate-blob2 rounded-full bg-[radial-gradient(circle,rgba(58,60,152,.14),transparent_70%)] blur-[20px]" />
      <div className="relative z-[1] flex flex-col items-center">{children}</div>
    </main>
  );
}

function EmptyCart() {
  return (
    <>
      {/* Animated illustration: a floating cart with items drifting above it, waiting to be added. */}
      <div className="relative mb-7 h-[180px] w-[220px] sm:mb-9 sm:h-[220px] sm:w-[260px]">
        {/* soft glow disc */}
        <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(42,43,106,.12),transparent_70%)] blur-[6px]" />

        {/* drifting "items" waiting to drop in */}
        <div className="animate-floaty absolute left-[38px] top-[6px] flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/80 bg-white/70 shadow-[0_8px_20px_rgba(34,36,90,.12)] backdrop-blur">
          <span className="h-3.5 w-3.5 rounded-full bg-[linear-gradient(135deg,#179b8e,#13b89f)]" />
        </div>
        <div className="animate-floaty2 absolute right-[34px] top-[22px] flex h-8 w-8 items-center justify-center rounded-[9px] border border-white/80 bg-white/70 shadow-[0_8px_20px_rgba(34,36,90,.12)] backdrop-blur [animation-delay:.6s]">
          <span className="h-3 w-3 rounded-[4px] bg-[linear-gradient(135deg,#3a3c98,#5644d2)]" />
        </div>
        <div className="animate-floaty absolute right-[74px] top-[-4px] h-2.5 w-2.5 rounded-full bg-accent/70 [animation-delay:1.1s]" />
        <div className="animate-floaty2 absolute left-[74px] top-[40px] h-2 w-2 rounded-full bg-indigo/50 [animation-delay:.3s]" />

        {/* the cart */}
        <div className="animate-floaty absolute bottom-0 left-1/2 -translate-x-1/2">
          <svg width="150" height="150" viewBox="0 0 120 120" fill="none" aria-hidden>
            <defs>
              <linearGradient id="cartg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2a2b6a" />
                <stop offset="1" stopColor="#3a3c98" />
              </linearGradient>
            </defs>
            {/* handle + basket */}
            <path d="M20 30h10l10 44h44l11-33H41" stroke="url(#cartg)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {/* basket grid */}
            <path d="M48 46v20M62 46v20M76 46v18" stroke="#149b8e" strokeWidth="3.4" strokeLinecap="round" opacity=".7" />
            <path d="M42 56h48" stroke="#149b8e" strokeWidth="3.4" strokeLinecap="round" opacity=".7" />
            {/* wheels */}
            <circle cx="48" cy="90" r="7" fill="#fff" stroke="url(#cartg)" strokeWidth="5" />
            <circle cx="80" cy="90" r="7" fill="#fff" stroke="url(#cartg)" strokeWidth="5" />
          </svg>
        </div>
      </div>

      <div className="font-jbmono mb-3 text-[11px] uppercase tracking-[.22em] text-accent">Your cart</div>
      <h1 className="mb-3 text-[28px] font-extrabold leading-[1.05] tracking-[-.03em] sm:text-[42px]">Nothing here yet.</h1>
      <p className="mb-7 max-w-[44ch] text-[15px] sm:text-[16px] leading-[1.6] text-slate">Your cart is empty, browse the catalogue to shortlist products, then build a branded quotation in a click.</p>

      <div className="flex w-full flex-wrap items-center justify-center gap-2.5 sm:w-auto sm:gap-3">
        <Link href="/products" className="flex-1 whitespace-nowrap rounded-[14px] bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-5 py-[14px] text-center text-[14px] sm:flex-none sm:px-7 sm:text-[15px] font-semibold text-white no-underline shadow-[0_12px_30px_rgba(42,43,106,.32)] transition-transform hover:-translate-y-0.5">Browse Products</Link>
        <Link href="/quotation" className="flex-1 whitespace-nowrap rounded-[14px] border border-white/[.78] bg-white/70 px-5 py-[14px] text-center text-[14px] sm:flex-none sm:px-7 sm:text-[15px] font-semibold text-indigo no-underline backdrop-blur-[8px] transition-colors hover:bg-white">Request a Quotation</Link>
      </div>
    </>
  );
}
