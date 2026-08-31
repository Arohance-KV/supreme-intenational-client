'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { useSellerLogin } from '@/lib/seller/userAuth';
import { useSellerAuth } from '@/lib/seller/auth';
import DcWordmark from '@/components/DcWordmark';

// Design-system auth styles (see DESIGN_SYSTEM.md).
import { mesh, card, input, label, primaryBtn, errorBanner } from '@/lib/authStyles';

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
    <div className={`flex min-h-screen items-center justify-center px-4 py-10 font-display ${mesh}`}>
      <div className={card}>
        <Link href="/" className="mb-6 inline-block no-underline"><DcWordmark /></Link>
        <p className="font-jbmono text-[11px] uppercase tracking-[.14em] text-accent">Seller Portal</p>
        <h1 className="mb-2 mt-1 text-2xl font-extrabold tracking-[-.02em] text-ink">Seller Sign in</h1>
        <p className="mb-6 text-sm text-slate">Access your storefront, products and payouts.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={label}>Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="password" className={label}>Password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />
          </div>
          {error && <div className={errorBanner}>{error}</div>}
          <button type="submit" disabled={loginMut.isPending} className={primaryBtn}>
            {loginMut.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-5 flex justify-between text-sm">
          <Link href="/seller/apply" className="font-medium text-accent hover:underline">Apply to sell</Link>
          <Link href="/seller/forgot-password" className="font-medium text-accent hover:underline">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
