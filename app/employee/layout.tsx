'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useEmployeeAuth } from '@/lib/employee/auth';
import EmployeeHeader from '@/components/employee/EmployeeHeader';
import EmployeeFooter from '@/components/employee/EmployeeFooter';

const PUBLIC = [
  '/employee/login',
  '/employee/activate',
  '/employee/forgot-password',
  '/employee/reset-password',
];

function EmployeeGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useEmployeeAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC.includes(pathname);

  // localStorage is unreadable during SSR/prerender, so the first client render
  // always sees isLoggedIn=false. Wait for client hydration before redirecting,
  // else a hard load / refresh of a protected page bounces a logged-in user to login.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && !isPublic && !isLoggedIn) router.replace('/employee/login');
  }, [hydrated, isPublic, isLoggedIn, router]);

  if (isPublic) return <>{children}</>;
  if (!hydrated || !isLoggedIn) return null;
  return <>{children}</>;
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC.includes(pathname);

  if (isPublic) {
    return <EmployeeGuard>{children}</EmployeeGuard>;
  }

  return (
    <EmployeeGuard>
      {/* Shared portal background so the area around the floating header isn't bare white. */}
      <div className="flex min-h-screen flex-col bg-[#eef0f8]">
        <EmployeeHeader />
        {children}
        <EmployeeFooter />
      </div>
    </EmployeeGuard>
  );
}
