'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin/auth';

type NavItem = { label: string; href: string };
type NavGroup = { group: string; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

const NAV: NavEntry[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Orders', href: '/admin/orders' },
  {
    group: 'Catalog',
    items: [
      { label: 'Products', href: '/admin/catalog/products' },
      { label: 'Categories', href: '/admin/catalog/categories' },
      { label: 'Attributes', href: '/admin/catalog/attributes' },
    ],
  },
  { label: 'Coupons', href: '/admin/coupons' },
  { label: 'Reviews', href: '/admin/reviews' },
  { label: 'Blogs', href: '/admin/blogs' },
  { label: 'Companies', href: '/admin/companies' },
  { label: 'Sellers', href: '/admin/sellers' },
  { label: 'Submissions', href: '/admin/submissions' },
  { label: 'Payouts', href: '/admin/payouts' },
  { label: 'Quotations', href: '/admin/quotations' },
  { label: 'Leads', href: '/admin/leads' },
  { label: 'Settings', href: '/admin/settings' },
];

function isNavItem(entry: NavEntry): entry is NavItem {
  return 'href' in entry;
}

function NavLink({ href, label }: NavItem) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? 'bg-zinc-700 text-white font-medium'
          : 'text-zinc-300 hover:bg-zinc-700/60 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAdminAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-zinc-900 flex flex-col">
        <div className="px-4 py-5 border-b border-zinc-700">
          <span className="text-white font-semibold text-sm tracking-wide">Admin Portal</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {NAV.map((entry, i) => {
            if (isNavItem(entry)) {
              return <NavLink key={entry.href} {...entry} />;
            }
            return (
              <div key={i} className="pt-2">
                <p className="px-3 pb-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {entry.group}
                </p>
                <div className="space-y-0.5">
                  {entry.items.map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="px-2 py-4 border-t border-zinc-700">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-1.5 rounded-md text-sm text-zinc-300 hover:bg-zinc-700/60 hover:text-white text-left transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-zinc-50 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
