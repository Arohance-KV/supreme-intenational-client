'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVerifyInvite, useActivate } from '@/lib/employee/userAuth';
import { ApiError } from '@/lib/api';

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
      <p className="text-sm text-gray-500 text-center">Verifying invite…</p>
    );
  }

  if (!token || isError) {
    return (
      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
        This invite is invalid or has expired.
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center">
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
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        {matchError && (
          <p className="text-sm text-red-600">{matchError}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {isPending ? 'Activating…' : 'Activate account'}
        </button>
      </form>
    </>
  );
}

export default function ActivatePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Activate your account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Set a password to complete your account setup.
        </p>
        <Suspense fallback={<p className="text-sm text-gray-500 text-center">Verifying invite…</p>}>
          <ActivateForm />
        </Suspense>
      </div>
    </div>
  );
}
