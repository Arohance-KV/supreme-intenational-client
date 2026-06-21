'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { useSellerLogin } from '@/lib/seller/userAuth';
import { useSellerAuth } from '@/lib/seller/auth';

const STATUS_MSG: Record<string, string> = {
  SELLER_PENDING: 'Your application is still under review. You will be able to sign in once approved.',
  SELLER_REJECTED: 'Your seller application was rejected. Contact support for details.',
  SELLER_SUSPENDED: 'Your seller account is suspended. Contact support.',
};

export default function SellerLoginPage() {
  const router = useRouter();
  const { login } = useSellerAuth();
  const loginMut = useSellerLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { accessToken } = await loginMut.mutateAsync({ email, password });
      login(accessToken);
      router.replace('/seller');
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? (STATUS_MSG[err.message] ?? 'Invalid email or password.')
          : 'Login failed.';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Seller Login</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loginMut.isPending}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loginMut.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/seller/apply" className="text-blue-600 hover:underline font-medium">
            Apply to sell
          </Link>
          <Link href="/seller/forgot-password" className="text-blue-600 hover:underline font-medium">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
