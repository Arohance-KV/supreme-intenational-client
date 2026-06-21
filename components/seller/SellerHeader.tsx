'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useSellerAuth } from '@/lib/seller/auth';
import { useSellerMe } from '@/lib/seller/me';

export default function SellerHeader() {
  const { isLoggedIn, logout } = useSellerAuth();
  const { data: me } = useSellerMe(isLoggedIn);
  const router = useRouter();
  const qc = useQueryClient();

  const onLogout = () => {
    logout();
    qc.removeQueries({ queryKey: ['seller'] });
    router.replace('/seller/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/seller" className="font-bold text-zinc-900">Seller Portal</Link>
        <nav className="flex items-center gap-2 text-sm">
          {isLoggedIn ? (
            <>
              <Link href="/seller/submissions" className="px-3 py-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100">Submissions</Link>
              <Link href="/seller/products" className="px-3 py-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100">Products</Link>
              <Link href="/seller/payouts" className="px-3 py-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100">Payouts</Link>
              {me && <span className="px-2 text-zinc-500">{me.businessName}</span>}
              <button onClick={onLogout} className="px-3 py-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100">Logout</button>
            </>
          ) : (
            <Link href="/seller/login" className="px-3 py-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100">Seller Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
