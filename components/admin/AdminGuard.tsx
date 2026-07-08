'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { useAdminAuth } from '@/lib/admin/auth';
import { useAdminProfile } from '@/lib/admin/userAuth';
import { canAccess, homeFor } from '@/lib/admin/roles';

const PUBLIC = ['/admin/login'];

// false during SSR/prerender, true once mounted on the client — without a setState-in-effect.
const noopSubscribe = () => () => {};

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC.includes(pathname);
  const { data: profile } = useAdminProfile({ enabled: isLoggedIn && !isPublic });

  // The token lives in localStorage, which is unreadable during SSR/prerender, so
  // the first client render always sees isLoggedIn=false. Wait until the client has
  // hydrated (and useSyncExternalStore has read the real token) before redirecting —
  // otherwise a hard load / refresh of a protected page bounces a logged-in user to login.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    if (hydrated && !isPublic && !isLoggedIn) router.replace('/admin/login');
  }, [hydrated, isPublic, isLoggedIn, router]);

  // Role-based section guard: once we know the role, bounce out of any section this
  // role can't reach (e.g. sales opening /admin/orders) to their home page. The server
  // enforces access on the API; this just keeps the UI honest.
  useEffect(() => {
    if (hydrated && !isPublic && profile && !canAccess(profile.role, pathname)) {
      router.replace(homeFor(profile.role));
    }
  }, [hydrated, isPublic, profile, pathname, router]);

  if (isPublic) return <>{children}</>;
  if (!hydrated || !isLoggedIn) return null;
  // Hold render until the role is known and the current path is allowed, so a
  // disallowed page never flashes before the redirect above fires.
  if (!profile) return null;
  if (!canAccess(profile.role, pathname)) return null;
  return <>{children}</>;
}
