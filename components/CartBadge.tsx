'use client';

import Link from 'next/link';

interface CartBadgeProps {
  count: number;
  href: string;
}

export default function CartBadge({ count, href }: CartBadgeProps) {
  return (
    <Link
      href={href}
      className="relative inline-flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-[9px] text-sm sm:px-3 font-medium text-slate no-underline transition-colors hover:bg-[rgba(42,43,106,.07)] hover:text-ink"
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
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full bg-accent text-white text-xs font-bold px-1 shadow-[0_2px_6px_rgba(0,0,0,.2)]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
