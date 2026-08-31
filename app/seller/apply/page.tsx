'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { useSellerApply } from '@/lib/seller/userAuth';
import DcWordmark from '@/components/DcWordmark';

// Design-system auth styles (see DESIGN_SYSTEM.md).
import { mesh, card, input, label, primaryBtn, errorBanner } from '@/lib/authStyles';
const optional = 'font-normal text-muted';

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
      <div className={`flex min-h-screen items-center justify-center px-4 py-10 font-display ${mesh}`}>
        <div className={`${card} text-center`}>
          <Link href="/" className="mb-6 inline-block no-underline"><DcWordmark /></Link>
          <h1 className="mb-2 text-2xl font-extrabold tracking-[-.02em] text-ink">Application received</h1>
          <p className="mb-6 text-sm text-slate">
            We&apos;re reviewing your application. You&apos;ll be able to sign in once approved.
          </p>
          <Link href="/seller/login" className="text-sm font-medium text-accent hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 py-10 font-display ${mesh}`}>
      <div className={card}>
        <Link href="/" className="mb-6 inline-block no-underline"><DcWordmark /></Link>
        <p className="font-jbmono text-[11px] uppercase tracking-[.14em] text-accent">Seller Portal</p>
        <h1 className="mb-2 mt-1 text-2xl font-extrabold tracking-[-.02em] text-ink">Apply to sell</h1>
        <p className="mb-6 text-sm text-slate">Tell us about your business to join the marketplace.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="businessName" className={label}>Business name</label>
            <input id="businessName" required placeholder="Acme Supplies" value={form.businessName} onChange={set('businessName')} className={input} />
          </div>
          <div>
            <label htmlFor="email" className={label}>Login email</label>
            <input id="email" type="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} className={input} />
          </div>
          <div>
            <label htmlFor="password" className={label}>Password <span className={optional}>(min 8 characters)</span></label>
            <input id="password" type="password" required minLength={8} placeholder="••••••••" value={form.password} onChange={set('password')} className={input} />
          </div>
          <div>
            <label htmlFor="contactEmail" className={label}>Contact email <span className={optional}>(optional)</span></label>
            <input id="contactEmail" type="email" placeholder="contact@example.com" value={form.contactEmail} onChange={set('contactEmail')} className={input} />
          </div>
          <div>
            <label htmlFor="description" className={label}>About your business <span className={optional}>(optional)</span></label>
            <textarea id="description" placeholder="Tell us about your business…" value={form.description} onChange={set('description')} rows={3} className={`${input} resize-none`} />
          </div>
          {error && <div className={errorBanner}>{error}</div>}
          <button type="submit" disabled={apply.isPending} className={primaryBtn}>
            {apply.isPending ? 'Submitting…' : 'Submit application'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate">
          Already approved?{' '}
          <Link href="/seller/login" className="font-medium text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
