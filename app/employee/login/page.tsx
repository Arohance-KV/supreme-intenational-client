'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useEmployeeLogin } from '@/lib/employee/userAuth';
import { ApiError } from '@/lib/api';
import { glass, primaryBtn, input, label, eyebrow, errorBanner } from '@/components/employee/ui';
import DcWordmark from '@/components/DcWordmark';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: login, isPending, error } = useEmployeeLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <>
      {error && (
        <div className={`mb-4 ${errorBanner}`}>
          {error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className={label}>
            Email
          </label>
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
          <label htmlFor="password" className={label}>
            Password
          </label>
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

        <button
          type="submit"
          disabled={isPending}
          className={`${primaryBtn} w-full py-2.5`}
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-slate">
        <Link href="/employee/forgot-password" className="text-accent hover:underline font-medium">
          Forgot password?
        </Link>
      </div>
    </>
  );
}

export default function EmployeeLoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 font-display"
      style={{
        background:
          'radial-gradient(60% 50% at 12% 8%, rgba(74,76,201,.20), transparent 60%),' +
          'radial-gradient(52% 46% at 92% 12%, rgba(19,184,159,.18), transparent 60%),' +
          'radial-gradient(46% 42% at 78% 92%, rgba(124,77,210,.14), transparent 62%),' +
          'linear-gradient(180deg,#eceefb,#f4f1f8,#e9f1f3)',
      }}
    >
      <div className={`w-full max-w-md rounded-[24px] p-6 sm:p-8 ${glass}`}>
        <Link href="/" className="mb-6 inline-block no-underline"><DcWordmark /></Link>
        <p className={eyebrow}>EMPLOYEE PORTAL</p>
        <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink mb-2 mt-1">Employee Sign in</h1>
        <p className="text-sm text-slate mb-6">
          Enter your credentials to access the employee portal.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
