'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { useSellerApply } from '@/lib/seller/userAuth';
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
  'p-3 rounded-[13px] bg-[rgba(224,82,77,.1)] border border-[rgba(224,82,77,.3)] text-[#e0524d] text-sm';
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
