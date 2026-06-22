'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/admin/auth';

const PUBLIC = ['/admin/login'];

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC.includes(pathname);

  // The token lives in localStorage, which is unreadable during SSR/prerender, so
  // the first client render always sees isLoggedIn=false. Wait until the client has
  // hydrated (and useSyncExternalStore has read the real token) before redirecting —
  // otherwise a hard load / refresh of a protected page bounces a logged-in user to login.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && !isPublic && !isLoggedIn) router.replace('/admin/login');
  }, [hydrated, isPublic, isLoggedIn, router]);

  if (isPublic) return <>{children}</>;
  if (!hydrated || !isLoggedIn) return null;
  return <>{children}</>;
}
