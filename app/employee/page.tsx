'use client';

import Link from 'next/link';
import { useEmployeeAuth } from '@/lib/employee/auth';
import { useRecentlyViewed } from '@/lib/employee/catalog';
import ProductCard from '@/components/ProductCard';
import { EMPLOYEE_CART } from '@/components/AddToCartMini';
import { glass, eyebrow, pageWrap } from '@/components/employee/ui';

export default function EmployeeDashboard() {
  const { token } = useEmployeeAuth();
  const { data, isLoading } = useRecentlyViewed();
  const recentProducts = data?.products ?? [];

  // Decode a rough display name from the JWT payload (sub claim) if available
  let greeting = 'Welcome back';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.name) greeting = `Welcome back, ${payload.name}`;
      else if (payload.email) greeting = `Welcome back, ${payload.email.split('@')[0]}`;
    } catch {
      // ignore — fallback greeting is fine
    }
  }

  return (
    <div className="min-h-screen bg-[#eef0f8]">
      <div className={`${pageWrap} space-y-7 sm:space-y-10`}>
        {/* Greeting hero */}
        <section className={`${glass} rounded-[24px] p-5 sm:p-8`}>
          <p className={`${eyebrow} mb-2`}>EMPLOYEE PORTAL</p>
          <h1 className="text-2xl font-extrabold sm:text-3xl tracking-[-.02em] text-ink">{greeting}</h1>
          <p className="mt-2 text-[15px] text-slate">
            Browse curated products and manage your wallet.
          </p>
        </section>

        {/* Quick links */}
        <section className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { href: '/employee/products', icon: '🛍️', title: 'Browse Catalog', sub: 'Explore curated products' },
            { href: '/employee/wallet', icon: '💳', title: 'My Wallet', sub: 'View balance & transactions' },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`group flex items-center gap-4 rounded-[20px] p-5 no-underline transition-shadow hover:shadow-[0_16px_44px_rgba(34,36,90,.16)] ${glass}`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-[rgba(23,155,142,.12)] text-2xl">
                {c.icon}
              </span>
              <div>
                <p className="font-semibold text-ink transition-colors group-hover:text-indigo">{c.title}</p>
                <p className="text-xs text-muted">{c.sub}</p>
              </div>
            </Link>
          ))}
        </section>

        {/* Recently Viewed */}
        <section>
          <p className={`${eyebrow} mb-1`}>PICK UP WHERE YOU LEFT OFF</p>
          <h2 className="mb-4 text-xl font-extrabold tracking-[-.02em] text-ink">Recently Viewed</h2>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`h-56 animate-pulse rounded-[20px] ${glass}`} />
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className={`rounded-[20px] border-dashed py-10 text-center ${glass}`}>
              <p className="text-sm text-slate">Browse the catalog to get started</p>
              <Link
                href="/employee/products"
                className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
              >
                Go to catalog →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {recentProducts.slice(0, 10).map((product) => (
                <ProductCard key={product._id} product={product} hrefBase="/employee/products" cartTarget={EMPLOYEE_CART} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
