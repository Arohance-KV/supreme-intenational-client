'use client';

import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import CartBadge from './CartBadge';
import DcWordmark from './DcWordmark';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';

// Single unified public-site nav — rendered once from the layout, so it looks
// identical on the home page, /products, and every other public page.
const items = [
  { label: 'Products', href: '/products', key: 'products' },
  { label: 'Clients', href: '/clients', key: 'clients' },
  { label: 'About', href: '/about', key: 'about' },
  { label: 'Careers', href: '/careers', key: 'careers' },
  { label: 'Contact', href: '/contact', key: 'contact' },
];

// Portal logins (B2B company flow is already the default catalogue/quotation path).
const portals = [
  { label: 'Seller Login', href: '/seller/login' },
  { label: 'Company Login', href: '/company/login' },
  { label: 'Employee Login', href: '/employee/login' },
];

export default function DcNav({ active }: { active?: string }) {
  const { isLoggedIn, logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: cartData } = useCart();
  const handleLogout = () => {
    logout();
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  return (
    <header className="font-display sticky top-0 z-50 px-4 pt-3 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-[18px] border border-white/80 bg-white/[.62] px-[18px] py-3 shadow-[0_8px_30px_rgba(34,36,90,.1)] backdrop-blur-[20px] backdrop-saturate-[1.6]">
        <Link href="/" className="no-underline"><DcWordmark /></Link>
        <div className="ml-2 hidden gap-1 md:flex">
          {items.map((it) => (
            <Link
              key={it.key}
              href={it.href}
              className={`rounded-[10px] px-3 py-2 text-sm no-underline ${active === it.key ? 'bg-[rgba(42,43,106,.07)] font-semibold text-ink' : 'font-medium text-slate'}`}
            >
              {it.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1 lg:flex">
            {portals.map((pl) => (
              <Link key={pl.href} href={pl.href} className="rounded-[10px] px-3 py-2 text-sm font-medium text-slate no-underline hover:bg-[rgba(42,43,106,.07)] hover:text-ink">
                {pl.label}
              </Link>
            ))}
          </div>
          <CartBadge count={cartData?.items.length ?? 0} href="/cart" />
          {isLoggedIn ? (
            <>
              <Link href="/account" className="rounded-xl border border-line bg-transparent px-4 py-[11px] text-[13px] font-semibold text-indigo no-underline">My Account</Link>
              <button onClick={handleLogout} className="cursor-pointer rounded-xl border border-line bg-transparent px-4 py-[11px] text-[13px] font-semibold text-indigo transition-colors hover:bg-[rgba(42,43,106,.07)]">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-xl border border-line bg-transparent px-4 py-[11px] text-[13px] font-semibold text-indigo no-underline">Login</Link>
              <Link href="/signup" className="hidden rounded-xl border border-line bg-transparent px-4 py-[11px] text-[13px] font-semibold text-indigo no-underline sm:inline-flex">Sign up</Link>
            </>
          )}
          <Link href="/quotation" className="rounded-xl bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-[18px] py-[11px] text-[13px] font-semibold text-white no-underline shadow-[0_8px_22px_rgba(42,43,106,.3)]">Request Quotation</Link>
        </div>
      </div>
    </header>
  );
}
