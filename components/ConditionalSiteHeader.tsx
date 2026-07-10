'use client';
import { usePathname } from 'next/navigation';
import DcNav from '@/components/DcNav';

// Dashboards ship their own headers — no public nav there.
const HIDE = ['/admin', '/seller', '/employee', '/company'];

// Highlight the matching top-level section for the current path.
function activeKey(p: string): string | undefined {
  for (const key of ['products', 'clients', 'blog', 'about', 'careers', 'contact']) {
    if (p === '/' + key || p.startsWith('/' + key + '/')) return key;
  }
  return undefined;
}

export default function ConditionalSiteHeader() {
  const p = usePathname();
  if (HIDE.some((h) => p === h || p.startsWith(h + '/'))) return null;
  return <DcNav active={activeKey(p)} />;
}
