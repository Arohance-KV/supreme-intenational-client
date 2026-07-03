'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCompanyAuth } from '@/lib/company/auth';

const NAV = [
  { href: '/company', label: 'Overview', exact: true },
  { href: '/company/orders', label: 'Orders & Purchases' },
  { href: '/company/employees', label: 'Employees & Points' },
  { href: '/company/products', label: 'Store Products' },
  { href: '/company/quotations', label: 'Quotations & Enquiries' },
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
    <aside
      className="sticky top-0 flex h-screen w-[242px] flex-none flex-col gap-4 max-[900px]:h-auto max-[900px]:w-full max-[900px]:flex-row max-[900px]:items-center max-[900px]:gap-3 max-[900px]:overflow-x-auto"
      style={{
        background: 'linear-gradient(180deg,#1c1d44,#23254f)',
        padding: '20px 16px',
      }}
    >
      <div className="flex items-center gap-2.5 max-[900px]:flex-none">
        <span className="text-[17px] font-extrabold tracking-[-.02em] text-white">Supreme</span>
        <span
          className="rounded-[5px] border px-1.5 py-0.5 font-jbmono text-[9px] tracking-[.1em] uppercase"
          style={{ color: '#9fb0e7', borderColor: 'rgba(159,176,231,.4)' }}
        >
          Company
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 max-[900px]:flex-none max-[900px]:flex-row max-[900px]:gap-1.5">
        {NAV.map((n) => {
          const active = isActive(n.href, n.exact);
          return (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-[11px] rounded-[11px] px-3 py-[11px] text-[13.5px] whitespace-nowrap no-underline transition-colors"
              style={
                active
                  ? { fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,.14)' }
                  : { fontWeight: 500, color: 'rgba(255,255,255,.65)', background: 'transparent' }
              }
            >
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div
        className="mt-auto flex items-center gap-2.5 rounded-xl max-[900px]:mt-0 max-[900px]:flex-none"
        style={{ padding: 10, background: 'rgba(255,255,255,.08)' }}
      >
        <div
          className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] text-[12px] font-extrabold text-white"
          style={{ background: 'linear-gradient(135deg,#3a3c98,#149b8e)' }}
        >
          CO
        </div>
        <div className="min-w-0 flex-1 max-[900px]:hidden">
          <div className="truncate text-[12.5px] font-bold text-white">Company</div>
          <div className="text-[10px]" style={{ color: 'rgba(255,255,255,.5)' }}>
            Company Admin
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex-none rounded-lg px-2 py-1 text-left text-[11px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
