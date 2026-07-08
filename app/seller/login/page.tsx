'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { useSellerLogin } from '@/lib/seller/userAuth';
import { useSellerAuth } from '@/lib/seller/auth';
import DcWordmark from '@/components/DcWordmark';

// Design-system auth styles (see DESIGN_SYSTEM.md).
const mesh =
  'bg-[radial-gradient(60%_50%_at_12%_8%,rgba(74,76,201,.20),transparent_60%),radial-gradient(52%_46%_at_92%_12%,rgba(19,184,159,.18),transparent_60%),radial-gradient(46%_42%_at_78%_92%,rgba(124,77,210,.14),transparent_62%),linear-gradient(180deg,#eceefb,#f4f1f8,#e9f1f3)]';
const card =
  'w-full max-w-md rounded-[24px] p-8 bg-white/60 border border-white/85 backdrop-blur-[14px] backdrop-saturate-150 shadow-[0_12px_44px_rgba(34,36,90,.08)]';
const input =
  'w-full bg-white/65 border border-line rounded-[13px] px-3.5 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-indigo transition-colors';
const label = 'block text-sm font-medium text-slate mb-1.5';
const primaryBtn =
  'w-full rounded-[13px] py-3 bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] text-white text-sm font-semibold shadow-[0_8px_22px_rgba(42,43,106,.3)] transition-shadow hover:shadow-[0_10px_28px_rgba(42,43,106,.4)] disabled:opacity-50 disabled:cursor-not-allowed';
const errorBanner =
  'p-3 rounded-[13px] bg-[rgba(224,82,77,.1)] border border-[rgba(224,82,77,.3)] text-[#e0524d] text-sm';

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
