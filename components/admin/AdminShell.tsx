'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin/auth';
import { useAdminProfile } from '@/lib/admin/userAuth';
import { canAccess, ROLE_LABEL, type Role } from '@/lib/admin/roles';

type NavItem = { label: string; href: string };
type NavGroup = { group: string; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

const NAV: NavEntry[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Analytics', href: '/admin/analytics' },
      { label: 'Orders', href: '/admin/orders' },
    ],
  },
  {
    group: 'Sales & Leads',
    items: [
      { label: 'Quotations', href: '/admin/quotations' },
      { label: 'Leads', href: '/admin/leads' },
      { label: 'Enquiries', href: '/admin/enquiries' },
      { label: 'Q&E Assignments', href: '/admin/assignments' },
      { label: 'Customers', href: '/admin/customers' },
    ],
  },
  {
    group: 'Companies',
    items: [
      { label: 'Companies', href: '/admin/companies' },
      { label: 'Points Requests', href: '/admin/points-proposals' },
    ],
  },
  {
    group: 'Sellers',
    items: [
      { label: 'Submissions', href: '/admin/submissions' },
      { label: 'Sellers', href: '/admin/sellers' },
      // ponytail: payouts hidden — uncomment to restore
      // { label: 'Payouts', href: '/admin/payouts' },
      { label: 'Support', href: '/admin/support' },
    ],
  },
  {
    group: 'Catalogue',
    items: [
      { label: 'Products', href: '/admin/catalog/products' },
      { label: 'Categories', href: '/admin/catalog/categories' },
      { label: 'Attributes', href: '/admin/catalog/attributes' },
      { label: 'Generate Docs', href: '/admin/generate' },
      { label: 'Coupons', href: '/admin/coupons' },
      { label: 'Reviews', href: '/admin/reviews' },
    ],
  },
  {
    group: 'Website Content',
    items: [
      { label: 'Clients & Logos', href: '/admin/clients' },
      { label: 'Case Studies', href: '/admin/case-studies' },
      { label: 'Blogs', href: '/admin/blogs' },
      { label: 'Marketing', href: '/admin/marketing' },
      { label: 'Careers', href: '/admin/careers' },
    ],
  },
  {
    group: 'Settings',
    items: [
      { label: 'Settings', href: '/admin/settings' },
      { label: 'User Management', href: '/admin/users' },
    ],
  },
];

// Drop nav entries the role can't reach; drop groups that end up empty.
function navFor(role: Role | undefined): NavEntry[] {
  return NAV
    .map((entry): NavEntry | null => {
      if ('href' in entry) return canAccess(role, entry.href) ? entry : null;
      const items = entry.items.filter((i) => canAccess(role, i.href));
      return items.length ? { ...entry, items } : null;
    })
    .filter((e): e is NavEntry => e !== null);
}

// Presentational icon per destination (matches the design-system mockup look).
const ICON: Record<string, string> = {
  '/admin': '🏠',
  '/admin/analytics': '📊',
  '/admin/orders': '🧾',
  '/admin/catalog/products': '📦',
  '/admin/catalog/categories': '🗂️',
  '/admin/catalog/attributes': '🔧',
  '/admin/generate': '🧾',
  '/admin/coupons': '🎟️',
  '/admin/reviews': '⭐',
  '/admin/clients': '🤝',
  '/admin/case-studies': '🏆',
  '/admin/blogs': '📝',
  '/admin/marketing': '📣',
  '/admin/companies': '🏢',
  '/admin/points-proposals': '🪙',
  '/admin/assignments': '🧑‍💼',
  '/admin/customers': '👥',
  '/admin/sellers': '🏷️',
  '/admin/submissions': '📥',
  '/admin/payouts': '💸',
  '/admin/quotations': '📄',
  '/admin/leads': '📨',
  '/admin/enquiries': '💬',
  '/admin/careers': '💼',
  '/admin/users': '🔑',
  '/admin/settings': '⚙️',
};

function isNavItem(entry: NavEntry): entry is NavItem {
  return 'href' in entry;
}

function NavLink({ href, label, collapsed }: NavItem & { collapsed: boolean }) {
  const pathname = usePathname();
  const active = href === '/admin'
    ? pathname === '/admin'
    : pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`group/nav relative flex items-center rounded-[11px] py-2 text-[13px] transition-colors ${
        collapsed ? 'justify-center gap-0 px-0' : 'gap-3 px-3'
      } ${
        active
          ? 'bg-white/[.12] text-white font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]'
          : 'text-white/60 hover:bg-white/[.07] hover:text-white font-medium'
      }`}
    >
      {active && (
        <span className="absolute left-[1px] top-1/2 -translate-y-1/2 h-[18px] w-[3px] rounded-sm bg-accent" />
      )}
      <span className="w-5 shrink-0 text-center text-[13px]">{ICON[href] ?? '•'}</span>
      <span className={`overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-200 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'}`}>
        {label}
      </span>
    </Link>
  );
}

const SIDEBAR_KEY = 'admin:sidebar-collapsed';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAdminAuth();
  const router = useRouter();
  const { data: profile } = useAdminProfile();
  const nav = navFor(profile?.role);

  // Persist open/close across reloads. Starts expanded on the server, then syncs
  // to the saved choice after mount (a brief expand→collapse is fine, it animates).
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    setCollapsed(localStorage.getItem(SIDEBAR_KEY) === '1');
  }, []);
  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem(SIDEBAR_KEY, c ? '0' : '1');
      return !c;
    });
  };

  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Administrator';
  const initials = (fullName.match(/\b\w/g) ?? ['S', 'A']).slice(0, 2).join('').toUpperCase();
  const roleLabel = profile?.role ? ROLE_LABEL[profile.role] : 'Signed in';

  const handleLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-[#eef0f8] text-ink font-display">
      {/* Sidebar */}
      <aside
        className={`relative z-20 shrink-0 sticky top-0 h-screen flex flex-col bg-gradient-to-b from-[#1c1d44] to-[#23254f] shadow-[inset_-1px_0_0_rgba(255,255,255,.05)] transition-[width] duration-300 ease-in-out ${
          collapsed ? 'w-[76px]' : 'w-[248px]'
        }`}
      >
        {/* Edge toggle — the open/close control */}
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-7 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-[#23254f] text-white/70 shadow-[0_4px_14px_rgba(0,0,0,.35)] transition hover:scale-110 hover:border-[#9fe7dc]/50 hover:text-[#9fe7dc]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className={`flex items-center pt-5 pb-4 mb-3 border-b border-white/[.08] ${collapsed ? 'justify-center gap-0 px-2' : 'gap-2.5 px-4'}`}>
          {/* Logo mark — always visible, anchors the collapsed rail */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#179b8e] to-[#13b89f] font-extrabold text-white shadow-[0_6px_16px_rgba(23,155,142,.4)]">
            S
          </div>
          <div className={`overflow-hidden transition-[opacity,max-width] duration-200 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'}`}>
            <div className="flex items-center gap-2">
              <div className="leading-none">
                <div className="text-white font-extrabold text-[15px] tracking-tight">Supreme</div>
                <div className="mt-0.5 font-jbmono text-[7px] tracking-[.3em] text-white/50">INTERNATIONAL</div>
              </div>
              <span className="font-jbmono text-[9px] tracking-[.1em] text-[#9fe7dc] border border-[#9fe7dc]/40 px-1.5 py-0.5 rounded-[5px] whitespace-nowrap">
                ADMIN
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-1 space-y-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nav.map((entry, i) => {
            if (isNavItem(entry)) {
              return <NavLink key={entry.href} {...entry} collapsed={collapsed} />;
            }
            return (
              <div key={i}>
                {collapsed ? (
                  // Collapsed: a thin divider stands in for the group label.
                  i > 0 && <div className="mx-auto my-2 h-px w-6 bg-white/10" />
                ) : (
                  <p className="px-3 pt-3.5 pb-1.5 font-jbmono text-[8.5px] tracking-[.13em] uppercase text-[#9fb0e7]/55 whitespace-nowrap">
                    {entry.group}
                  </p>
                )}
                <div className="space-y-0.5">
                  {entry.items.map((item) => (
                    <NavLink key={item.href} {...item} collapsed={collapsed} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto px-3 py-4 space-y-2">
          <div className={`flex items-center rounded-xl bg-white/[.06] border border-white/[.06] ${collapsed ? 'justify-center gap-0 p-2' : 'gap-2.5 p-2.5'}`}>
            <div className="w-[34px] h-[34px] rounded-[10px] shrink-0 bg-gradient-to-br from-[#179b8e] to-[#13b89f] flex items-center justify-center text-white font-extrabold text-xs">
              {initials}
            </div>
            <div className={`flex-1 min-w-0 overflow-hidden transition-[opacity,max-width] duration-200 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'}`}>
              <div className="text-[12.5px] font-bold text-white truncate">{fullName}</div>
              <div className="text-[10px] text-white/50">{roleLabel}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign out' : undefined}
            className={`w-full py-2 rounded-[11px] text-[13px] text-white/60 hover:bg-white/[.07] hover:text-white transition-colors ${collapsed ? 'text-center px-0' : 'text-left px-3'}`}
          >
            {collapsed ? '⏻' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="relative flex-1 overflow-auto">
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              'radial-gradient(42% 42% at 100% 0%, rgba(20,155,142,.12), transparent 60%),' +
              'radial-gradient(42% 42% at 18% 100%, rgba(58,60,152,.10), transparent 60%),' +
              'linear-gradient(180deg,#eceefb,#f1f1f7)',
          }}
        />
        <div className="relative z-[1] max-w-[1600px] mx-auto px-6 py-8 2xl:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
