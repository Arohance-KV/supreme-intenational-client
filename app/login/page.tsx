'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLogin } from '@/lib/userAuth';
import { ApiError } from '@/lib/api';
import DcWordmark from '@/components/DcWordmark';

// Design-system auth styles (see DESIGN_SYSTEM.md).
import { mesh, card, input, label, primaryBtn, errorBanner } from '@/lib/authStyles';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <>
      {message === 'verify-email' && (
        <div className="mb-4 p-3 rounded-[13px] bg-[rgba(42,43,106,.08)] border border-[rgba(42,43,106,.2)] text-indigo text-sm">
          Account created! Please check your email to verify your address, then log in.
        </div>
      )}

      {error && (
        <div className={`mb-4 ${errorBanner}`}>
          {error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className={label}>Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={isPending} className={primaryBtn}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className={`flex min-h-screen items-center justify-center px-4 py-10 font-display ${mesh}`}>
      <div className={card}>
        <Link href="/" className="mb-6 inline-block no-underline"><DcWordmark /></Link>
        <p className="font-jbmono text-[11px] uppercase tracking-[.14em] text-accent">B2B Account</p>
        <h1 className="mb-2 mt-1 text-2xl font-extrabold tracking-[-.02em] text-ink">Sign in</h1>
        <p className="mb-6 text-sm text-slate">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-accent hover:underline">Sign up</Link>
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
