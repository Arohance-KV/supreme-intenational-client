'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useEmployeeAuth } from '@/lib/employee/auth';
import { useEmployeeCart } from '@/lib/employee/cart';
import CartBadge from '@/components/CartBadge';

export default function EmployeeHeader() {
  const { isLoggedIn, logout } = useEmployeeAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: cartData } = useEmployeeCart();

  const handleLogout = () => {
    logout();
    queryClient.invalidateQueries({ queryKey: ['employee'] });
    router.push('/employee/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/employee" className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors">
          Supreme International — Employee Portal
        </Link>
        <nav className="flex items-center gap-2">
          {isLoggedIn && (
            <>
              <Link
                href="/employee/products"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Products
              </Link>
              <Link
                href="/employee/wallet"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Wallet
              </Link>
              <CartBadge count={cartData?.itemCount ?? 0} href="/employee/cart" />
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
