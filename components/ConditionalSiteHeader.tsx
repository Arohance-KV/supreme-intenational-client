'use client';
import { usePathname } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';

const HIDE = ['/admin', '/seller', '/employee', '/company'];
// Public marketing pages ship their own glass nav (DcNav) baked in.
const OWN_NAV = new Set(['/', '/clients', '/about', '/careers', '/contact']);

export default function ConditionalSiteHeader() {
  const p = usePathname();
  if (OWN_NAV.has(p)) return null;
  if (HIDE.some((h) => p === h || p.startsWith(h + '/'))) return null;
  return <SiteHeader />;
}
