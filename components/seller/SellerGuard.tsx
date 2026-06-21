'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSellerAuth } from '@/lib/seller/auth';

const PUBLIC = ['/seller/apply', '/seller/login', '/seller/forgot-password', '/seller/reset-password'];

export default function SellerGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useSellerAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC.includes(pathname);

  useEffect(() => {
    if (!isLoggedIn && !isPublic) router.replace('/seller/login');
  }, [isLoggedIn, isPublic, router]);

  if (!isLoggedIn && !isPublic) return null;
  return <>{children}</>;
}
