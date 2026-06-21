'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { useSellerApply } from '@/lib/seller/userAuth';

export default function SellerApplyPage() {
  const apply = useSellerApply();
  const [form, setForm] = useState({
    businessName: '',
    email: '',
    password: '',
    contactEmail: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apply.mutateAsync({
        businessName: form.businessName,
        email: form.email,
        password: form.password,
        description: form.description || undefined,
        contact: form.contactEmail ? { email: form.contactEmail } : undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Application failed. Try again.');
    }
  };

  if (apply.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Application received</h1>
          <p className="text-sm text-gray-600 mb-4">
            We&apos;re reviewing your application. You&apos;ll be able to sign in once approved.
          </p>
          <Link href="/seller/login" className="text-blue-600 hover:underline text-sm font-medium">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Apply to sell</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
              Business name
            </label>
            <input
              id="businessName"
              required
              placeholder="Acme Supplies"
              value={form.businessName}
              onChange={set('businessName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Login email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-gray-400 font-normal">(min 8 characters)</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Contact email <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="contactEmail"
              type="email"
              placeholder="contact@example.com"
              value={form.contactEmail}
              onChange={set('contactEmail')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              About your business <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              placeholder="Tell us about your business…"
              value={form.description}
              onChange={set('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={apply.isPending}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {apply.isPending ? 'Submitting…' : 'Submit application'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Already approved?{' '}
          <Link href="/seller/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
