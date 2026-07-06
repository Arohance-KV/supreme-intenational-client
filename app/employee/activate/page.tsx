'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVerifyInvite, useActivate } from '@/lib/employee/userAuth';
import { ApiError } from '@/lib/api';
import { glass, primaryBtn, input, label, eyebrow, errorBanner } from '@/components/employee/ui';

function ActivateForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [matchError, setMatchError] = useState('');

  const { isLoading, isError } = useVerifyInvite(token);
  const { mutate: activate, isPending, error, isSuccess } = useActivate();

  if (isLoading) {
    return (
      <p className="text-sm text-slate text-center">Verifying invite…</p>
    );
  }

  if (!token || isError) {
    return (
      <div className={`${errorBanner} text-center`}>
        This invite is invalid or has expired.
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="p-3 rounded-[13px] bg-[rgba(31,170,107,.1)] border border-[rgba(31,170,107,.3)] text-[#1a8f5a] text-sm text-center">
        Account activated! Redirecting…
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMatchError('Passwords do not match.');
      return;
    }
    setMatchError('');
    activate({ token, password });
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

        <div>
          <label htmlFor="confirm" className={label}>
            Confirm Password
          </label>
          <input
            id="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={input}
            placeholder="••••••••"
          />
        </div>

        {matchError && (
          <p className="text-sm text-[#e0524d]">{matchError}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={`${primaryBtn} w-full py-2.5`}
        >
          {isPending ? 'Activating…' : 'Activate account'}
        </button>
      </form>
    </>
  );
}

export default function ActivatePage() {
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
        <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink mb-2 mt-1">Activate your account</h1>
        <p className="text-sm text-slate mb-6">
          Set a password to complete your account setup.
        </p>
        <Suspense fallback={<p className="text-sm text-slate text-center">Verifying invite…</p>}>
          <ActivateForm />
        </Suspense>
      </div>
    </div>
  );
}
