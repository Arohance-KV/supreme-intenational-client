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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-[18px] border border-[rgba(19,184,159,.28)] bg-[rgba(232,247,244,.72)] px-[18px] py-3 shadow-[0_8px_30px_rgba(20,155,142,.14)] backdrop-blur-[20px] backdrop-saturate-[1.6]">
        {/* Client company branding: logo if set, else the company name */}
        <Link href="/employee" className="flex items-center gap-3 no-underline">
          {company?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo} alt={company.name || 'Company'} className="h-8 max-h-8 w-auto object-contain" />
          ) : (
            <span className="text-lg font-extrabold tracking-[-.01em] text-ink">{company?.name || 'Merchandise Portal'}</span>
          )}
          <span className="hidden rounded-full bg-[rgba(19,184,159,.12)] px-2.5 py-1 font-jbmono text-[10px] uppercase tracking-[.12em] text-accent sm:inline-flex">
            Merchandise Portal
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-2">
          {isLoggedIn && (
            <>
              <Link href="/employee/products" className={navLink}>Products</Link>
              <Link href="/employee/orders" className={navLink}>Orders</Link>
              {walletData && (
                <Link
                  href="/employee/wallet"
                  className="rounded-full border border-[rgba(23,155,142,.25)] bg-[rgba(23,155,142,.12)] px-3 py-[7px] font-jbmono text-sm font-semibold text-accent no-underline transition-colors hover:bg-[rgba(23,155,142,.2)]"
                >
                  ₹{walletData.balance.toLocaleString('en-IN')}
                </Link>
              )}
              <CartBadge count={cartData?.items.length ?? 0} href="/employee/cart" />
              <button onClick={handleLogout} className={navLink}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
