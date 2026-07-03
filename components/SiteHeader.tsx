'use client';

import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import CartBadge from './CartBadge';
import DcWordmark from './DcWordmark';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';

const navLink =
  'rounded-[10px] px-3 py-2 text-sm font-medium text-slate no-underline transition-colors hover:bg-[rgba(42,43,106,.07)] hover:text-ink';

export default function SiteHeader() {
  const { isLoggedIn, logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: cartData } = useCart();
  const handleLogout = () => {
    logout();
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  return (
    <header className="font-display sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-4 rounded-[18px] border border-white/80 bg-white/70 px-[18px] py-2.5 shadow-[0_8px_30px_rgba(34,36,90,.1)] backdrop-blur-[20px] backdrop-saturate-[1.6]">
          <Link href="/" className="no-underline"><DcWordmark /></Link>
          <nav className="flex items-center gap-1.5">
            <Link href="/products" className={navLink}>Products</Link>
            <Link href="/employee/login" className={`hidden sm:inline-flex ${navLink}`}>Employee Login</Link>
            <Link href="/seller/login" className={`hidden sm:inline-flex ${navLink}`}>Sell with us</Link>
            <CartBadge count={cartData?.itemCount ?? 0} href="/cart" />
            {isLoggedIn ? (
              <button onClick={handleLogout} className="cursor-pointer rounded-xl border border-line bg-transparent px-4 py-[9px] text-[13px] font-semibold text-indigo transition-colors hover:bg-[rgba(42,43,106,.07)]">
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="rounded-xl border border-line bg-transparent px-4 py-[9px] text-[13px] font-semibold text-indigo no-underline">Login</Link>
                <Link href="/signup" className="rounded-xl bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-4 py-[9px] text-[13px] font-semibold text-white no-underline shadow-[0_8px_22px_rgba(42,43,106,.3)]">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
