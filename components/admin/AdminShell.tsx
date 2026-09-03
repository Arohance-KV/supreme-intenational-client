'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
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
      { label: 'Approvals', href: '/admin/approvals' },
    ],
  },
  {
    group: 'Sellers',
    items: [
      { label: 'Submissions', href: '/admin/submissions' },
      { label: 'Sellers', href: '/admin/sellers' },
      // ponytail: payouts hidden, uncomment to restore
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
  '/admin/reviews': '⭐',
  '/admin/clients': '🤝',
  '/admin/case-studies': '🏆',
  '/admin/blogs': '📝',
  '/admin/marketing': '📣',
  '/admin/companies': '🏢',
  '/admin/points-proposals': '🪙',
  '/admin/approvals': '✅',
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

// `collapsed` styles the DESKTOP rail only: on mobile the drawer is always full-width
// and expanded, so every collapsed style is gated behind md:.
function NavLink({ href, label, collapsed, onNavigate }: NavItem & { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = href === '/admin'
    ? pathname === '/admin'
    : pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={`group/nav relative flex items-center gap-3 rounded-[11px] px-3 py-2 text-[13px] transition-colors ${
        collapsed ? 'md:justify-center md:gap-0 md:px-0' : ''
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
      <span className={`overflow-hidden whitespace-nowrap max-w-[160px] opacity-100 transition-[opacity,max-width] duration-200 ${collapsed ? 'md:max-w-0 md:opacity-0' : ''}`}>
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

  // Mobile-only: the sidebar is an off-canvas drawer. Each nav link closes it via
  // onNavigate, so no route-change effect is needed.
  const [mobileOpen, setMobileOpen] = useState(false);

  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Administrator';
  const initials = (fullName.match(/\b\w/g) ?? ['S', 'A']).slice(0, 2).join('').toUpperCase();
  const roleLabel = profile?.role ? ROLE_LABEL[profile.role] : 'Signed in';

  const handleLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-[#eef0f8] text-ink font-display">
      {/* Backdrop: mobile drawer only */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        />
      )}

      {/* Sidebar: off-canvas drawer on mobile, restored to the exact in-flow rail at md+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[248px] flex flex-col bg-gradient-to-b from-[#1c1d44] to-[#23254f] shadow-[inset_-1px_0_0_rgba(255,255,255,.05)] transition-transform duration-300 ease-in-out md:sticky md:top-0 md:z-20 md:h-screen md:shrink-0 md:translate-x-0 md:transition-[width] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:w-[76px]' : 'md:w-[248px]'}`}
      >
        {/* Edge toggle: desktop-only open/close control */}
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-7 z-30 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-[#23254f] text-white/70 shadow-[0_4px_14px_rgba(0,0,0,.35)] transition hover:scale-110 hover:border-[#9fe7dc]/50 hover:text-[#9fe7dc]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Close button: mobile drawer only */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="md:hidden absolute right-3 top-4 z-30 flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className="h-5 w-5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className={`flex items-center gap-2.5 px-4 pt-5 pb-4 mb-3 border-b border-white/[.08] ${collapsed ? 'md:justify-center md:gap-0 md:px-2' : ''}`}>
          {/* Compact mark: desktop collapsed rail only (the wordmark can't fit 76px) */}
          <div className={`h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#179b8e] to-[#13b89f] font-extrabold text-white shadow-[0_6px_16px_rgba(23,155,142,.4)] hidden ${collapsed ? 'md:flex' : ''}`}>
            S
          </div>
          {/* Full logo: expanded (mobile always; desktop when not collapsed). brightness-0 invert paints the navy mark white for the dark rail. */}
          <div className={`flex items-center gap-2 overflow-hidden ${collapsed ? 'md:hidden' : ''}`}>
            <Image src="/supreme-logo.png" alt="Supreme International" width={300} height={87} priority className="h-6 w-auto brightness-0 invert" />
            <span className="font-jbmono text-[9px] tracking-[.1em] text-[#9fe7dc] border border-[#9fe7dc]/40 px-1.5 py-0.5 rounded-[5px] whitespace-nowrap">
              ADMIN
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-1 space-y-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nav.map((entry, i) => {
            if (isNavItem(entry)) {
              return <NavLink key={entry.href} {...entry} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />;
            }
            return (
              <div key={i}>
                {/* Group label: shown on mobile always; on desktop only when expanded */}
                <p className={`px-3 pt-3.5 pb-1.5 font-jbmono text-[8.5px] tracking-[.13em] uppercase text-[#9fb0e7]/55 whitespace-nowrap ${collapsed ? 'md:hidden' : ''}`}>
                  {entry.group}
                </p>
                {/* Collapsed divider: desktop-only stand-in for the group label */}
                {i > 0 && <div className={`mx-auto my-2 h-px w-6 bg-white/10 hidden ${collapsed ? 'md:block' : ''}`} />}
                <div className="space-y-0.5">
                  {entry.items.map((item) => (
                    <NavLink key={item.href} {...item} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto px-3 py-4 space-y-2">
          <div className={`flex items-center gap-2.5 rounded-xl bg-white/[.06] border border-white/[.06] p-2.5 ${collapsed ? 'md:justify-center md:gap-0 md:p-2' : ''}`}>
            <div className="w-[34px] h-[34px] rounded-[10px] shrink-0 bg-gradient-to-br from-[#179b8e] to-[#13b89f] flex items-center justify-center text-white font-extrabold text-xs">
              {initials}
            </div>
            <div className={`flex-1 min-w-0 overflow-hidden max-w-[160px] opacity-100 transition-[opacity,max-width] duration-200 ${collapsed ? 'md:max-w-0 md:opacity-0' : ''}`}>
              <div className="text-[12.5px] font-bold text-white truncate">{fullName}</div>
              <div className="text-[10px] text-white/50">{roleLabel}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign out' : undefined}
            className={`w-full py-2 rounded-[11px] text-[13px] text-left px-3 text-white/60 hover:bg-white/[.07] hover:text-white transition-colors ${collapsed ? 'md:text-center md:px-0' : ''}`}
          >
            <span className={collapsed ? 'md:hidden' : ''}>Sign out</span>
            <span className={`hidden ${collapsed ? 'md:inline' : ''}`}>⏻</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="relative flex-1 overflow-auto">
        {/* Mobile top bar: the only way to reach the drawer on small screens */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className="h-5 w-5">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <Image src="/supreme-logo.png" alt="Supreme International" width={300} height={87} priority className="h-6 w-auto" />
            <span className="font-jbmono text-[9px] tracking-[.1em] text-[#179b8e] border border-[#179b8e]/40 px-1.5 py-0.5 rounded-[5px]">
              ADMIN
            </span>
          </div>
          <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#179b8e] to-[#13b89f] text-xs font-extrabold text-white">
            {initials}
          </div>
        </div>

        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              'radial-gradient(42% 42% at 100% 0%, rgba(20,155,142,.12), transparent 60%),' +
              'radial-gradient(42% 42% at 18% 100%, rgba(58,60,152,.10), transparent 60%),' +
              'linear-gradient(180deg,#eceefb,#f1f1f7)',
          }}
        />
        <div className="relative z-[1] max-w-[1600px] mx-auto px-4 py-6 md:px-6 md:py-8 2xl:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
