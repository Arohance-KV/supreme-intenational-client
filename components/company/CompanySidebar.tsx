'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCompanyAuth } from '@/lib/company/auth';

const NAV = [
  { href: '/company', label: 'Overview', exact: true },
  { href: '/company/orders', label: 'Orders' },
  { href: '/company/employees', label: 'Employees' },
  { href: '/company/products', label: 'Products' },
  { href: '/company/quotations', label: 'Quotations' },
];

export default function CompanySidebar() {
  const pathname = usePathname();
  const { logout } = useCompanyAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const onLogout = () => {
    logout();
    qc.removeQueries({ queryKey: ['company'] });
    router.replace('/company/login');
  };

  return (
    <aside className="flex w-[236px] flex-none flex-col gap-3 border-r border-line bg-white p-4 md:sticky md:top-0 md:h-screen">
      <div className="flex items-center gap-2.5 px-2 pb-4 pt-1.5">
        <span className="text-[17px] font-extrabold tracking-[-.02em] text-ink">Supreme</span>
        <span className="rounded-[5px] border border-line px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[.1em] text-muted">
          Company
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((n) => {
          const active = isActive(n.href, n.exact);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-[11px] px-3 py-[11px] text-[13.5px] no-underline transition-colors ${
                active
                  ? 'bg-indigo font-semibold text-white'
                  : 'font-medium text-slate hover:bg-[#eef0f8] hover:text-ink'
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={onLogout}
        className="rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-slate transition-colors hover:bg-[#eef0f8] hover:text-ink"
      >
        Logout
      </button>
    </aside>
  );
}
