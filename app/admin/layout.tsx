'use client';

import { usePathname } from 'next/navigation';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';

const PUBLIC = ['/admin/login'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC.includes(pathname);

  return (
    <AdminGuard>
      {isPublic ? children : <AdminShell>{children}</AdminShell>}
    </AdminGuard>
  );
}
