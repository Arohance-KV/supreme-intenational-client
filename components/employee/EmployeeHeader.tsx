'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useEmployeeAuth } from '@/lib/employee/auth';
import { useEmployeeCart } from '@/lib/employee/cart';
import { useEmployeeCompany } from '@/lib/employee/catalog';
import { useWallet } from '@/lib/employee/wallet';
import CartBadge from '@/components/CartBadge';

const navLink =
  'rounded-xl px-3 py-[9px] text-sm font-medium text-slate no-underline transition-colors hover:bg-[rgba(19,184,159,.12)] hover:text-accent';

export default function EmployeeHeader() {
  const { isLoggedIn, logout } = useEmployeeAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: cartData } = useEmployeeCart();
  const { data: walletData } = useWallet();
  const { data: company } = useEmployeeCompany();

  const handleLogout = () => {
    logout();
    queryClient.invalidateQueries({ queryKey: ['employee'] });
    router.push('/employee/login');
  };

  return (
    // Same floating-pill layout as the public DcNav, kept in the teal portal palette.
    <header className="font-display sticky top-0 z-50 px-4 pt-3 sm:px-6 lg:px-8">
      <div className="flex items-center gap-x-2 rounded-[18px] sm:gap-x-4 border border-[rgba(19,184,159,.28)] bg-[rgba(232,247,244,.72)] px-3.5 py-2.5 shadow-[0_8px_30px_rgba(20,155,142,.14)] sm:px-[18px] sm:py-3 backdrop-blur-[20px] backdrop-saturate-[1.6]">
        {/* Client company branding: logo if set, else the company name */}
        <Link href="/employee" className="flex min-w-0 shrink items-center gap-3 no-underline">
          {company?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo} alt={company.name || 'Company'} className="h-7 max-h-7 w-auto max-w-[44vw] object-contain sm:h-8 sm:max-h-8 sm:max-w-none" />
          ) : (
            <span className="max-w-[46vw] truncate text-base font-extrabold tracking-[-.01em] text-ink sm:max-w-none sm:text-lg">{company?.name || 'Merchandise Portal'}</span>
          )}
          {/* <span className="hidden rounded-full bg-[rgba(19,184,159,.12)] px-2.5 py-1 font-jbmono text-[10px] uppercase tracking-[.12em] text-accent sm:inline-flex">
            Merchandise Portal
          </span> */}
        </Link>

        <nav className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {isLoggedIn && (
            <>
              <Link href="/employee/products" className={`${navLink} hidden md:inline-flex`}>Products</Link>
              <Link href="/employee/orders" className={`${navLink} hidden md:inline-flex`}>Orders</Link>
              {walletData && (
                <Link
                  href="/employee/wallet"
                  className="shrink-0 rounded-full border border-[rgba(23,155,142,.25)] bg-[rgba(23,155,142,.12)] px-2.5 py-1.5 font-jbmono text-[13px] font-semibold text-accent no-underline transition-colors hover:bg-[rgba(23,155,142,.2)] sm:px-3 sm:py-[7px] sm:text-sm"
                >
                  ₹{walletData.balance.toLocaleString('en-IN')}
                </Link>
              )}
              <CartBadge count={cartData?.items.length ?? 0} href="/employee/cart" />
              <button onClick={handleLogout} className={`${navLink} hidden md:inline-flex`}>Logout</button>
              {/* Nav lives in the bottom tab bar on mobile; logout has no tab, so it stays here. */}
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(19,184,159,.28)] bg-transparent text-accent md:hidden"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            </>
          )}
        </nav>

      </div>
    </header>
  );
}
