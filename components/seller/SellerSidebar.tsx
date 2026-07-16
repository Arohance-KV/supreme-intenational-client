'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useSellerAuth } from '@/lib/seller/auth';
import { useSellerMe } from '@/lib/seller/me';

// Kept in sync with SellerGuard — auth pages don't get the dashboard chrome.
const PUBLIC = ['/seller/apply', '/seller/login', '/seller/forgot-password', '/seller/reset-password'];

const NAV = [
  { href: '/seller', label: 'Dashboard', icon: '▦', exact: true },
  { href: '/seller/products', label: 'My Products', icon: '▤' },
  { href: '/seller/submissions', label: 'Approval Status', icon: '◷' },
  { href: '/seller/performance', label: 'Performance', icon: '◭' },
  { href: '/seller/payouts', label: 'Payouts', icon: '₹' },
];

export default function SellerSidebar() {
  const pathname = usePathname();
  const { isLoggedIn, logout } = useSellerAuth();
  const { data: me } = useSellerMe(isLoggedIn);
  const router = useRouter();
  const qc = useQueryClient();

  if (PUBLIC.includes(pathname)) return null;

  const onLogout = () => {
    logout();
    qc.removeQueries({ queryKey: ['seller'] });
    router.replace('/seller/login');
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      data-app-side
      className="font-display z-10 flex w-full flex-none flex-col gap-3 bg-[linear-gradient(180deg,#13483f,#176054)] p-4 text-white md:sticky md:top-0 md:h-screen md:w-[236px]"
    >
      <div className="flex items-center gap-2.5 px-2 pb-4 pt-1.5">
        <Image src="/supreme-logo.png" alt="Supreme International" width={300} height={87} className="h-6 w-auto brightness-0 invert" priority />
        <span className="font-jbmono rounded-[5px] border border-[rgba(169,236,223,.4)] px-1.5 py-0.5 text-[9px] tracking-[.1em] text-[#a9ecdf]">SELLER</span>
      </div>

      <nav data-nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
        {NAV.map((n) => {
          const on = isActive(n.href, n.exact);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 whitespace-nowrap rounded-[11px] px-3 py-[11px] text-[13.5px] no-underline transition-colors ${
                on ? 'bg-white/[.14] font-semibold text-white' : 'font-medium text-white/65 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="w-4 text-center">{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden items-center gap-2.5 rounded-xl bg-white/[.08] p-2.5 md:flex">
        <div className="h-[34px] w-[34px] flex-none rounded-[10px] bg-[linear-gradient(135deg,#e0a33b,#d2902b)]" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-bold text-white">{me?.businessName ?? 'Seller'}</div>
          <div className="text-[10px] capitalize text-white/50">{me?.status ?? 'Account'}</div>
        </div>
        <button
          onClick={onLogout}
          className="rounded-lg px-2 py-1 text-[11px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
