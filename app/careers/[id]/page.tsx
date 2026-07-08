'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import DcFooter from '@/components/DcFooter';
import { useJob, useApplyToJob } from '@/lib/careers';
import { ApiError } from '@/lib/api';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mono-jb' });

const inputCls = 'w-full rounded-[11px] border border-line bg-white/80 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';

export default function CareerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, isError } = useJob(id);
  const apply = useApplyToJob();

  const [form, setForm] = useState({ fullName: '', email: '', isdCode: '', phoneNumber: '', coverLetter: '' });
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.fullName.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    if (!resume) { setError('Please attach your resume (PDF).'); return; }
    try {
      await apply.mutateAsync({
        fullName: form.fullName, email: form.email,
        isdCode: form.isdCode || undefined, phoneNumber: form.phoneNumber || undefined,
        coverLetter: form.coverLetter || undefined,
        position: job?.title ?? '', openingId: id, resume,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <main className={`${jakarta.variable} ${mono.variable} font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink selection:bg-[rgba(23,155,142,0.22)]`}>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_0%_0%,rgba(58,60,152,.16),transparent_60%),radial-gradient(50%_45%_at_100%_6%,rgba(20,155,142,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />

      <div className="relative z-[1] mx-auto max-w-[900px] px-6">

        <div className="pt-8">
          <Link href="/careers" className="font-jbmono text-[11px] uppercase tracking-[.18em] text-accent no-underline">← All positions</Link>
        </div>

        {isLoading && <div className="mt-6 h-40 animate-pulse rounded-3xl border border-white/80 bg-white/55" />}
        {isError && (
          <div className="mt-6 rounded-3xl border border-white/80 bg-white/55 p-10 text-center">
            <p className="text-sm text-slate">This position isn&apos;t available anymore.</p>
            <Link href="/careers" className="mt-3 inline-block text-sm font-semibold text-indigo">See open roles →</Link>
          </div>
        )}

        {job && (
          <>
            {/* Header */}
            <section className="pt-6 pb-4">
              <h1 className="mb-2 text-[30px] font-extrabold leading-[1.1] tracking-[-.02em] sm:text-[40px]">{job.title}</h1>
              <div className="flex flex-wrap gap-2.5">
                <span className="rounded-[10px] border border-[rgba(42,43,106,.12)] bg-[rgba(42,43,106,.07)] px-[13px] py-2 text-xs font-semibold text-indigo">{job.department}</span>
                <span className="rounded-[10px] border border-[rgba(42,43,106,.12)] bg-[rgba(42,43,106,.07)] px-[13px] py-2 text-xs font-semibold text-indigo">{job.location}</span>
                <span className="font-jbmono rounded-[10px] bg-[rgba(23,155,142,.12)] px-[13px] py-2 text-xs font-semibold text-accent">{job.employmentType}</span>
              </div>
            </section>

            {/* Description */}
            <section className="pb-6">
              <div className="rounded-[22px] border border-white/80 bg-white/55 p-[26px] shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[14px]">
                <div className="font-jbmono mb-2 text-[11px] uppercase tracking-[.14em] text-slate">About the role</div>
                <p className="whitespace-pre-line text-[15px] leading-[1.7] text-ink">{job.description}</p>
              </div>
            </section>

            {/* Apply form */}
            <section className="pb-12">
              <div className="rounded-[22px] border border-white/80 bg-white/55 p-[26px] shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[14px]">
                <h2 className="mb-4 text-[22px] font-extrabold tracking-[-.02em]">Apply for this role</h2>

                {done ? (
                  <div className="rounded-2xl border border-[rgba(23,155,142,.25)] bg-[rgba(23,155,142,.08)] p-6 text-center">
                    <div className="mb-1 text-2xl">✅</div>
                    <p className="text-sm font-semibold text-ink">Application received!</p>
                    <p className="mt-1 text-[13px] text-slate">Thanks for applying to {job.title}. We&apos;ll be in touch.</p>
                    <Link href="/careers" className="mt-3 inline-block text-sm font-semibold text-indigo">Back to careers →</Link>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-4">
                    {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate">Full name *</span><input className={inputCls} value={form.fullName} onChange={set('fullName')} /></label>
                      <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate">Email *</span><input className={inputCls} type="email" value={form.email} onChange={set('email')} /></label>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[120px_1fr]">
                      <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate">ISD</span><input className={inputCls} value={form.isdCode} onChange={set('isdCode')} placeholder="+91" /></label>
                      <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate">Phone</span><input className={inputCls} value={form.phoneNumber} onChange={set('phoneNumber')} /></label>
                    </div>
                    <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate">Cover letter</span><textarea className={inputCls} rows={4} value={form.coverLetter} onChange={set('coverLetter')} placeholder="Tell us why you're a great fit…" /></label>
                    <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate">Resume (PDF) *</span><input className={inputCls} type="file" accept="application/pdf" onChange={(e) => setResume(e.target.files?.[0] ?? null)} /></label>
                    <button type="submit" disabled={apply.isPending} className="rounded-[11px] bg-gradient-to-br from-indigo to-indigo2 px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(42,43,106,.28)] disabled:opacity-50">
                      {apply.isPending ? 'Submitting…' : 'Submit application'}
                    </button>
                  </form>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <DcFooter />
    </main>
  );
}
