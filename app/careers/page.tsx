'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import DcFooter from '@/components/DcFooter';
import DcPhoto from '@/components/DcPhoto';
import { useJobs } from '@/lib/careers';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mono-jb' });

const heroPills = ['📍 Hybrid · Bangalore', '❤ Health cover', '📚 Learning budget'];

const benefits = [
  { icon: '❤', t: 'Health & wellness', d: 'Family medical cover and wellness days.' },
  { icon: '🕘', t: 'Flexible & hybrid', d: 'Outcome-first; hybrid weeks from Bangalore.' },
  { icon: '📚', t: 'Learning budget', d: 'Annual budget for courses & conferences.' },
  { icon: '🚀', t: 'Real ownership', d: 'Lead projects end-to-end from day one.' },
];

const steps = [
  ['01', 'Apply', 'Send your CV — a real person reads it.'],
  ['02', 'Conversation', 'A chat about your work and ours.'],
  ['03', 'Practical', 'A short, paid, real-world exercise.'],
  ['04', 'Offer', 'Decision within a week. No ghosting.'],
];

export default function CareersPage() {
  const [dept, setDept] = useState('All');
  const { data: openings, isLoading } = useJobs();

  const jobs = openings ?? [];
  const depts = ['All', ...Array.from(new Set(jobs.map((j) => j.department)))];
  const list = dept === 'All' ? jobs : jobs.filter((j) => j.department === dept);

  return (
    <main className={`${jakarta.variable} ${mono.variable} font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink selection:bg-[rgba(23,155,142,0.22)]`}>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_0%_0%,rgba(58,60,152,.16),transparent_60%),radial-gradient(50%_45%_at_100%_6%,rgba(20,155,142,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />
      <div className="pointer-events-none fixed -bottom-[160px] -left-[120px] z-0 h-[500px] w-[500px] animate-blob1 rounded-full bg-[radial-gradient(circle,rgba(58,60,152,.16),transparent_70%)] blur-[20px]" />

      <div className="relative z-[1] mx-auto max-w-[1180px] px-6">

        {/* HERO */}
        <section className="grid grid-cols-1 items-center gap-9 pb-[30px] pt-11 md:grid-cols-2">
          <div>
            <div className="font-jbmono mb-4 text-[11px] uppercase tracking-[.22em] text-accent">Careers</div>
            <h1 className="mb-4 text-[32px] font-extrabold leading-[1.08] tracking-[-.03em] sm:text-[48px] sm:leading-[1.04]">Build the future of gifting.</h1>
            <p className="mb-[22px] text-base leading-[1.6] text-slate">We&apos;re a profitable, founder-led company shipping real software for a real business. Small teams, big ownership, and customers who use what you build the day it goes live.</p>
            <div className="flex flex-wrap gap-2.5">
              {heroPills.map((p) => (
                <span key={p} className="rounded-[10px] border border-[rgba(42,43,106,.12)] bg-[rgba(42,43,106,.07)] px-[13px] py-2 text-xs font-semibold text-indigo">{p}</span>
              ))}
            </div>
          </div>
          <DcPhoto seed="team-culture" className="aspect-[4/3] rounded-[22px] border border-white/70 shadow-[0_14px_40px_rgba(34,36,90,.1)]" />
        </section>

        {/* BENEFITS */}
        <section className="pb-[26px] pt-2">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.t} className="rounded-[18px] border border-white/80 bg-white/55 p-[22px] shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[14px]">
                <div className="mb-2.5 text-[22px]">{b.icon}</div>
                <div className="mb-[5px] text-sm font-bold">{b.t}</div>
                <div className="text-[12.5px] leading-[1.5] text-slate">{b.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* OPENINGS */}
        <section className="pb-4 pt-2">
          <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
            <h2 className="m-0 text-[30px] font-extrabold tracking-[-.02em]">Open positions</h2>
            <div className="flex flex-wrap gap-2">
              {depts.map((d) => {
                const on = dept === d;
                return (
                  <button key={d} onClick={() => setDept(d)} className={`cursor-pointer rounded-full px-[13px] py-[7px] text-xs font-semibold ${on ? 'bg-indigo text-white' : 'border border-line bg-white/70 text-slate'}`}>{d}</button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {isLoading && Array.from({ length: 4 }).map((_, i) => (
              <div key={`sk-${i}`} className="h-[72px] animate-pulse rounded-2xl border border-white/80 bg-white/55" />
            ))}
            {!isLoading && list.length === 0 && (
              <div className="rounded-2xl border border-white/80 bg-white/55 px-[22px] py-8 text-center text-sm text-slate backdrop-blur-[14px]">
                No open positions right now. Check back soon — or say hello via <Link href="/contact" className="font-semibold text-indigo">contact</Link>.
              </div>
            )}
            {!isLoading && list.map((j) => (
              <Link key={j._id} href={`/careers/${j._id}`} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/80 bg-white/55 px-[22px] py-[18px] shadow-[0_8px_24px_rgba(34,36,90,.06)] backdrop-blur-[14px] no-underline transition-shadow hover:shadow-[0_12px_32px_rgba(34,36,90,.12)]">
                <div className="flex-1">
                  <div className="mb-1 text-base font-bold text-ink">{j.title}</div>
                  <div className="text-xs text-slate">{j.department} · {j.location}</div>
                </div>
                <span className="font-jbmono rounded-full bg-[rgba(23,155,142,.12)] px-[11px] py-[5px] text-[11px] font-semibold text-accent">{j.employmentType}</span>
                <span className="rounded-[11px] border border-[rgba(42,43,106,.12)] bg-[rgba(42,43,106,.07)] px-[18px] py-2.5 text-[13px] font-semibold text-indigo">View &amp; apply →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* APPLICATION FLOW */}
        <section className="pb-11 pt-6">
          <div className="rounded-3xl bg-[linear-gradient(135deg,#1c1d44,#23254f)] p-[38px] shadow-[0_24px_60px_rgba(42,43,106,.25)]">
            <div className="font-jbmono mb-2 text-[11px] uppercase tracking-[.14em] text-[#9fe7dc]">How hiring works</div>
            <h3 className="mb-[26px] text-[26px] font-extrabold tracking-[-.02em] text-white">Four honest steps</h3>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {steps.map(([n, t, d]) => (
                <div key={n} className="rounded-2xl border border-white/20 bg-white/10 p-5">
                  <div className="font-jbmono mb-3 text-[13px] text-[#9fe7dc]">{n}</div>
                  <div className="mb-1.5 text-sm font-bold text-white">{t}</div>
                  <div className="text-[12.5px] leading-[1.5] text-white/70">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <DcFooter />
    </main>
  );
}
