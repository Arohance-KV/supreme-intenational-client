'use client';

import Link from 'next/link';
import { useEmployeeAuth } from '@/lib/employee/auth';
import { useRecentlyViewed } from '@/lib/employee/catalog';
import ProductCard from '@/components/ProductCard';

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
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        {/* Greeting */}
        <section>
          <h1 className="text-2xl font-bold text-zinc-900">{greeting}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your employee portal — browse products and manage your wallet.
          </p>
        </section>

        {/* Quick links */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-lg">
          <Link
            href="/employee/products"
            className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-5 hover:shadow-md transition-shadow group"
          >
            <span className="text-2xl">🛍️</span>
            <div>
              <p className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                Browse Catalog
              </p>
              <p className="text-xs text-zinc-500">Explore curated products</p>
            </div>
          </Link>

          <Link
            href="/employee/wallet"
            className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-5 hover:shadow-md transition-shadow group"
          >
            <span className="text-2xl">💳</span>
            <div>
              <p className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                My Wallet
              </p>
              <p className="text-xs text-zinc-500">View balance &amp; transactions</p>
            </div>
          </Link>
        </section>

        {/* Recently Viewed */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-800 mb-4">Recently Viewed</h2>

          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse shrink-0 w-48 h-56 rounded-lg border border-zinc-200 bg-white"
                />
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white py-10 text-center">
              <p className="text-sm text-zinc-500">
                Browse the catalog to get started
              </p>
              <Link
                href="/employee/products"
                className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                Go to catalog →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {recentProducts.slice(0, 10).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  hrefBase="/employee/products"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
