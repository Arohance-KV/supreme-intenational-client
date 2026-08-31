'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { useAdminLogin } from '@/lib/admin/userAuth';
import { useAdminAuth } from '@/lib/admin/auth';
import DcWordmark from '@/components/DcWordmark';

// Design-system auth styles (see DESIGN_SYSTEM.md).
import { mesh, card, input, label, primaryBtn, errorBanner } from '@/lib/authStyles';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const loginMut = useAdminLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { accessToken } = await loginMut.mutateAsync({ email, password });
      login(accessToken);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed.');
    }
  };

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 py-10 font-display ${mesh}`}>
      <div className={card}>
        <Link href="/" className="mb-6 inline-block no-underline"><DcWordmark /></Link>
        <p className="font-jbmono text-[11px] uppercase tracking-[.14em] text-accent">Admin Portal</p>
        <h1 className="mb-2 mt-1 text-2xl font-extrabold tracking-[-.02em] text-ink">Admin Sign in</h1>
        <p className="mb-6 text-sm text-slate">Manage the catalogue, orders and operations.</p>

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
      </div>
    </div>
  );
}
