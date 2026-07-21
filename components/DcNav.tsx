'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import CartBadge from './CartBadge';
import DcWordmark from './DcWordmark';
import NavProductsMenu from './NavProductsMenu';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';

// Single unified public-site nav — rendered once from the layout, so it looks
// identical on the home page, /products, and every other public page.
// 'Products' is rendered separately as a category mega-menu (NavProductsMenu).
const items = [
  { label: 'Clients', href: '/clients', key: 'clients' },
  { label: 'Blog', href: '/blog', key: 'blog' },
  { label: 'About', href: '/about', key: 'about' },
  { label: 'Careers', href: '/careers', key: 'careers' },
  { label: 'Contact', href: '/contact', key: 'contact' },
];

// Merchandise portal logins. Seller login lives in the footer — it's a partner
// flow, not something buyers need in the nav.
const portals = [
  {
    label: 'Company Login',
    href: '/company/login',
    blurb: 'For procurement teams — run your company store, budgets and employee orders.',
  },
  {
    label: 'Employee Login',
    href: '/employee/login',
    blurb: 'For employees — spend your allowance or points on your company store.',
  },
];

function MerchandisePortalMenu() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Grace period so moving the cursor trigger → panel doesn't close it.
  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onFocus={openMenu}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex cursor-pointer items-center gap-1 rounded-[10px] border-0 bg-transparent px-3 py-2 text-sm font-medium text-slate hover:bg-[rgba(42,43,106,.07)] hover:text-ink"
      >
        Merchandise Portal
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-full z-50 mt-2 origin-top-right transition-all duration-200 ease-out ${
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
        }`}
      >
        <div className="w-[330px] max-w-[86vw] overflow-hidden rounded-[18px] border border-white/80 bg-white/[.92] p-2 shadow-[0_20px_60px_rgba(34,36,90,.22)] backdrop-blur-[20px]">
          {portals.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              onClick={() => setOpen(false)}
              className="block rounded-[12px] px-3 py-2.5 no-underline transition-colors hover:bg-[rgba(42,43,106,.06)]"
            >
              <div className="text-sm font-semibold text-ink">{p.label}</div>
              <div className="mt-0.5 text-[12px] leading-[1.5] text-muted">{p.blurb}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DcNav({ active }: { active?: string }) {
  const { isLoggedIn, logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: cartData } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLogout = () => {
    logout();
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };
  const close = () => setMenuOpen(false);

  return (
    <header className="font-display sticky top-0 z-50 px-3 pt-3 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-[18px] border border-white/80 bg-white/[.62] px-3.5 py-2.5 shadow-[0_8px_30px_rgba(34,36,90,.1)] backdrop-blur-[20px] backdrop-saturate-[1.6] sm:px-[18px] sm:py-3">
        <Link href="/" className="no-underline" onClick={close}><DcWordmark /></Link>
        <div className="ml-2 hidden items-center gap-1 lg:flex">
          <NavProductsMenu active={active === 'products'} />
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
            <MerchandisePortalMenu />
          </div>
          <CartBadge count={cartData?.items.length ?? 0} href="/cart" />

          {/* Mobile / tablet: everything else collapses behind one button. */}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-transparent text-indigo lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
            </svg>
          </button>

          <div className="hidden items-center gap-2 lg:flex">
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

        {menuOpen && (
          <nav className="w-full border-t border-line/70 pb-2 pt-3 lg:hidden">
            <div className="flex flex-col">
              {[{ label: 'Products', href: '/products', key: 'products' }, ...items].map((it) => (
                <Link
                  key={it.key}
                  href={it.href}
                  onClick={close}
                  className={`rounded-[10px] px-3 py-2.5 text-[15px] no-underline ${active === it.key ? 'bg-[rgba(42,43,106,.07)] font-semibold text-ink' : 'font-medium text-slate'}`}
                >
                  {it.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 border-t border-line/70 pt-3">
              <div className="font-jbmono px-3 pb-1 text-[11px] uppercase tracking-[.12em] text-muted">Merchandise Portal</div>
              {portals.map((p) => (
                <Link key={p.href} href={p.href} onClick={close} className="block rounded-[10px] px-3 py-2 no-underline">
                  <div className="text-[15px] font-semibold text-ink">{p.label}</div>
                  <div className="text-[12px] leading-[1.5] text-muted">{p.blurb}</div>
                </Link>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line/70 pt-3">
              {isLoggedIn ? (
                <>
                  <Link href="/account" onClick={close} className="rounded-xl border border-line px-4 py-3 text-center text-[14px] font-semibold text-indigo no-underline">My Account</Link>
                  <button onClick={() => { handleLogout(); close(); }} className="cursor-pointer rounded-xl border border-line bg-transparent px-4 py-3 text-[14px] font-semibold text-indigo">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={close} className="rounded-xl border border-line px-4 py-3 text-center text-[14px] font-semibold text-indigo no-underline">Login</Link>
                  <Link href="/signup" onClick={close} className="rounded-xl border border-line px-4 py-3 text-center text-[14px] font-semibold text-indigo no-underline">Sign up</Link>
                </>
              )}
              <Link href="/quotation" onClick={close} className="col-span-2 rounded-xl bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-4 py-3 text-center text-[14px] font-semibold text-white no-underline">Request Quotation</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
