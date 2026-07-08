'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useWishlist } from '@/lib/wishlist';
import ProductCard from '@/components/ProductCard';
import DcFooter from '@/components/DcFooter';

export default function WishlistPage() {
  const { isLoggedIn } = useAuth();
  const { data, isLoading } = useWishlist(isLoggedIn);

  if (!isLoggedIn) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#eef0f8] px-4 text-ink">
        <h1 className="text-2xl font-extrabold tracking-[-.02em]">Saved items</h1>
        <p className="max-w-md text-center text-slate">Log in to view the products you&apos;ve saved.</p>
        <Link
          href="/login"
          className="rounded-xl bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-6 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_8px_22px_rgba(42,43,106,.3)]"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const products = data?.products ?? [];

  return (
    <main className="font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(20,155,142,.14),transparent_60%),radial-gradient(50%_45%_at_0%_6%,rgba(58,60,152,.14),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />

      <div className="relative z-[1] mx-auto max-w-[1280px] px-[18px] py-10 sm:px-10">
        <div className="mb-6">
          <div className="font-jbmono mb-2 text-[11px] uppercase tracking-[.22em] text-accent">My Account</div>
          <h1 className="text-[32px] font-extrabold tracking-[-.02em]">Saved items</h1>
          {products.length > 0 && (
            <p className="mt-1 text-sm text-slate">
              {products.length} saved product{products.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-[20px] bg-white/55" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-line bg-white/55 py-16 text-center backdrop-blur-[14px]">
            <p className="text-lg font-bold text-ink">No saved items yet</p>
            <p className="mt-1 text-sm text-muted">Tap the ♡ on any product to save it here.</p>
            <Link
              href="/products"
              className="mt-4 rounded-xl border border-line bg-white/60 px-4 py-2 text-sm font-semibold text-slate no-underline hover:bg-white"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>

      <DcFooter />
    </main>
  );
}
