'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useForgotPassword } from '@/lib/employee/userAuth';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { mutate: forgot, isPending } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgot(
      { email },
      { onSettled: () => setSubmitted(true) },
    );
  };

  if (submitted) {
    return (
      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm text-center">
        If that email belongs to an active employee, a reset link has been sent.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {isPending ? 'Sending…' : 'Send reset link'}
      </button>

      <div className="text-center text-sm text-gray-600">
        <Link href="/employee/login" className="text-blue-600 hover:underline font-medium">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we&apos;ll send you a reset link if your account is active.
        </p>
        <Suspense>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
