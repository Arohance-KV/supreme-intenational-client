'use client';
import { usePathname } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';

const HIDE = ['/admin', '/seller', '/employee'];

export default function ConditionalSiteHeader() {
  const p = usePathname();
  if (HIDE.some((h) => p === h || p.startsWith(h + '/'))) return null;
  return <SiteHeader />;
}
