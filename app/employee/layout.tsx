'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useEmployeeAuth } from '@/lib/employee/auth';
import EmployeeHeader from '@/components/employee/EmployeeHeader';

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

  useEffect(() => {
    if (!isPublic && !isLoggedIn) router.replace('/employee/login');
  }, [isPublic, isLoggedIn, router]);

  if (!isPublic && !isLoggedIn) return null;
  return <>{children}</>;
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC.includes(pathname);

  return (
    <EmployeeGuard>
      {!isPublic && <EmployeeHeader />}
      {children}
    </EmployeeGuard>
  );
}
