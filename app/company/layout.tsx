'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCompanyAuth } from '@/lib/company/auth';
import CompanySidebar from '@/components/company/CompanySidebar';

const PUBLIC = ['/company/login'];

function CompanyGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useCompanyAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC.includes(pathname);

  // localStorage/cookies are unreadable during SSR/prerender, so the first client
  // render always sees isLoggedIn=false. Wait for client hydration before redirecting,
  // else a hard load / refresh of a protected page bounces a logged-in user to login.
  const [hydrated, setHydrated] = useState(false);
  // Same pre-existing hydration-gate pattern used by EmployeeGuard/AdminGuard/SellerGuard.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && !isPublic && !isLoggedIn) router.replace('/company/login');
  }, [hydrated, isPublic, isLoggedIn, router]);

  if (isPublic) return <>{children}</>;
  if (!hydrated || !isLoggedIn) return null;
  return <>{children}</>;
}

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC.includes(pathname);

  return (
    <CompanyGuard>
      {isPublic ? (
        children
      ) : (
        <div className="flex min-h-screen w-full bg-[#eef0f8]">
          <CompanySidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      )}
    </CompanyGuard>
  );
}
