'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useEmployeeAuth } from '@/lib/employee/auth';
import { useEmployeeCart } from '@/lib/employee/cart';
import { useWallet } from '@/lib/employee/wallet';
import CartBadge from '@/components/CartBadge';
import { glass } from '@/components/employee/ui';

export default function EmployeeHeader() {
  const { isLoggedIn, logout } = useEmployeeAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: cartData } = useEmployeeCart();
  const { data: walletData } = useWallet();

  const handleLogout = () => {
    logout();
    queryClient.invalidateQueries({ queryKey: ['employee'] });
    router.push('/employee/login');
  };

  return (
    <header className={`sticky top-0 z-50 border-b border-line ${glass} font-display`}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href="/employee"
          className="text-lg font-extrabold tracking-[-.01em] text-ink no-underline transition-colors hover:text-indigo"
        >
          Supreme International <span className="text-muted font-semibold">— Employee Portal</span>
        </Link>
        <nav className="flex items-center gap-2">
          {isLoggedIn && (
            <>
              <Link
                href="/employee/products"
                className="rounded-xl px-3 py-[9px] text-sm font-medium text-slate no-underline transition-colors hover:bg-[rgba(42,43,106,.07)] hover:text-ink"
              >
                Products
              </Link>
              <Link
                href="/employee/orders"
                className="rounded-xl px-3 py-[9px] text-sm font-medium text-slate no-underline transition-colors hover:bg-[rgba(42,43,106,.07)] hover:text-ink"
              >
                Orders
              </Link>
              {walletData && (
                <Link
                  href="/employee/wallet"
                  className="rounded-full border border-[rgba(23,155,142,.25)] bg-[rgba(23,155,142,.12)] px-3 py-[7px] font-jbmono text-sm font-semibold text-accent no-underline transition-colors hover:bg-[rgba(23,155,142,.2)]"
                >
                  ₹{walletData.balance.toLocaleString('en-IN')}
                </Link>
              )}
              <CartBadge count={cartData?.items.length ?? 0} href="/employee/cart" />
              <button
                onClick={handleLogout}
                className="rounded-xl px-3 py-[9px] text-sm font-medium text-slate transition-colors hover:bg-[rgba(42,43,106,.07)] hover:text-ink"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
