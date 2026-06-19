'use client';

import Link from 'next/link';
import CartBadge from './CartBadge';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors">
          Supreme International
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Products
          </Link>
          <CartBadge />
        </nav>
      </div>
    </header>
  );
}
