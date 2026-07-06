'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useForgotPassword } from '@/lib/employee/userAuth';
import { glass, primaryBtn, input, label, eyebrow } from '@/components/employee/ui';

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
      <div className="p-3 rounded-[13px] bg-white/60 border border-white/85 text-slate text-sm text-center">
        If that email belongs to an active employee, a reset link has been sent.
      </div>
    );
  }

  return (
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

      <button
        type="submit"
        disabled={isPending}
        className={`${primaryBtn} w-full py-2.5`}
      >
        {isPending ? 'Sending…' : 'Send reset link'}
      </button>

      <div className="text-center text-sm text-slate">
        <Link href="/employee/login" className="text-accent hover:underline font-medium">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}

export default function ForgotPasswordPage() {
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
      <div className={`w-full max-w-md rounded-[24px] p-8 ${glass}`}>
        <p className={eyebrow}>EMPLOYEE PORTAL</p>
        <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink mb-2 mt-1">Forgot password</h1>
        <p className="text-sm text-slate mb-6">
          Enter your email and we&apos;ll send you a reset link if your account is active.
        </p>
        <Suspense>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
