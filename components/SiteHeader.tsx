'use client';

import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import CartBadge from './CartBadge';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';

export default function SiteHeader() {
  const { isLoggedIn, logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: cartData } = useCart();
  const handleLogout = () => {
    logout();
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors">
          Supreme International
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Products
          </Link>
          <Link
            href="/employee/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Employee Login
          </Link>
          <CartBadge count={cartData?.itemCount ?? 0} href="/cart" />
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
