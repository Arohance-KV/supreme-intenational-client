'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';

export default function CartBadge() {
  const { data: cart } = useCart();
  const count = cart?.itemCount ?? 0;

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      aria-label={`Cart${count > 0 ? ` — ${count} items` : ''}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8h13.2M7 13L5.4 5M10 21a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
        />
      </svg>
      <span>Cart</span>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
