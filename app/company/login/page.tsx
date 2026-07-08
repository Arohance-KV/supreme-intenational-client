'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useCompanyLogin } from '@/lib/company/userAuth';
import { ApiError } from '@/lib/api';
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
  'mb-4 p-3 rounded-[13px] bg-[rgba(224,82,77,.1)] border border-[rgba(224,82,77,.3)] text-[#e0524d] text-sm';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: login, isPending, error } = useCompanyLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <>
      {error && (
        <div className={errorBanner}>
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
            placeholder="you@company.com"
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

export default function CompanyLoginPage() {
  return (
    <div className={`flex min-h-screen items-center justify-center px-4 py-10 font-display ${mesh}`}>
      <div className={card}>
        <Link href="/" className="mb-6 inline-block no-underline"><DcWordmark /></Link>
        <p className="font-jbmono text-[11px] uppercase tracking-[.14em] text-accent">Company Portal</p>
        <h1 className="mb-2 mt-1 text-2xl font-extrabold tracking-[-.02em] text-ink">Company Sign in</h1>
        <p className="mb-6 text-sm text-slate">Manage employees, orders and quotations for your organization.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
