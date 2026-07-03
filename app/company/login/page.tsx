'use client';

import { Suspense, useState } from 'react';
import { useCompanyLogin } from '@/lib/company/userAuth';
import { ApiError } from '@/lib/api';

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
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo focus:border-transparent"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-indigo hover:bg-indigo2 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </>
  );
}

export default function CompanyLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef0f8] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_26px_rgba(34,36,90,.08)] border border-line p-8">
        <h1 className="text-2xl font-bold text-ink mb-2">Company Sign in</h1>
        <p className="text-sm text-muted mb-6">
          Enter your credentials to access the company portal.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
