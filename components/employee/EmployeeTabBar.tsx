'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Fixed bottom navigation for the portal on phones. Desktop keeps the pill header.
// Cart and the wallet balance stay in the header — they're glanceable, not destinations.
const TABS = [
  { href: '/employee', label: 'Home', exact: true, icon: 'M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9z' },
  { href: '/employee/products', label: 'Catalog', icon: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z' },
  { href: '/employee/orders', label: 'Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 11H6L5 9z' },
  { href: '/employee/wallet', label: 'Wallet', icon: 'M3 7h15a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 0V6a2 2 0 012-2h11M17 13h.01' },
  { href: '/employee/profile', label: 'Profile', icon: 'M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8' },
];

export default function EmployeeTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Portal sections"
      className="font-display fixed inset-x-0 bottom-0 z-50 grid h-14 grid-cols-5 border-t border-[rgba(19,184,159,.25)] bg-[rgba(240,251,249,.96)] pb-[env(safe-area-inset-bottom)] backdrop-blur-[14px] md:hidden"
    >
      {TABS.map((t) => {
        const on = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-semibold no-underline ${
              on ? 'text-accent' : 'text-slate'
            }`}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={on ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={t.icon} />
            </svg>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
