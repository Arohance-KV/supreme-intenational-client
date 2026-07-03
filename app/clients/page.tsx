'use client';

import { useState } from 'react';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import DcNav from '@/components/DcNav';
import DcFooter from '@/components/DcFooter';
import DcPhoto from '@/components/DcPhoto';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mono-jb' });

const industries = ['All', 'IT & Software', 'Manufacturing', 'Banking & Finance', 'Retail', 'Pharma'];

const logos = [
  { name: 'L&T', cls: 'text-[18px] font-extrabold' },
  { name: 'Reliance', cls: 'text-[15px] font-bold' },
  { name: 'Tata', cls: 'text-base font-extrabold italic' },
  { name: 'INFOSYS', cls: 'text-sm font-semibold tracking-[.1em]' },
  { name: 'HDFC', cls: 'text-base font-bold' },
  { name: 'Wipro', cls: 'text-base font-extrabold' },
  { name: 'Bosch', cls: 'text-[15px] font-bold' },
  { name: 'TVS', cls: 'text-[15px] font-extrabold' },
  { name: 'ITC', cls: 'text-[15px] font-bold tracking-[.05em]' },
  { name: 'Biocon', cls: 'text-sm font-bold' },
  { name: 'Mahindra', cls: 'text-[15px] font-extrabold' },
  { name: 'Wells Fargo', cls: 'text-[15px] font-bold' },
];

const cases = [
  { ind: 'IT & Software', t: '10,000 onboarding kits in 3 weeks', d: 'Self-served the catalogue, branded every item, and shipped pan-India ahead of a major hiring drive.', img: 'case-it' },
  { ind: 'Manufacturing', t: 'Annual safety-week merchandise', d: 'A recurring branded catalogue of co-branded safety gear across 12 plant locations.', img: 'case-mfg' },
  { ind: 'Banking', t: 'Branch-wide festival hampers', d: 'A points-based merchandise portal serving 400 branches with managed budgets.', img: 'case-bank' },
  { ind: 'Retail', t: 'Store-launch gifting program', d: 'Just-in-time gifting kits delivered to every new store opening for a national retailer.', img: 'case-retail' },
  { ind: 'Pharma', t: 'Conference & sampling kits', d: 'Compliant, premium kits produced at scale for a year of medical conferences.', img: 'case-pharma' },
  { ind: 'IT & Software', t: 'Global team appreciation', d: 'Milestone gifts for distributed teams, fulfilled across 6 cities in one programme.', img: 'case-it2' },
];

export default function ClientsPage() {
  const [active, setActive] = useState('All');
  const list = active === 'All' ? cases : cases.filter((c) => c.ind.startsWith(active.split(' ')[0]));

  return (
    <main className={`${jakarta.variable} ${mono.variable} font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink selection:bg-[rgba(23,155,142,0.22)]`}>
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(20,155,142,.16),transparent_60%),radial-gradient(50%_45%_at_0%_6%,rgba(58,60,152,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />
      <div className="pointer-events-none fixed -right-[120px] -top-[160px] z-0 h-[500px] w-[500px] animate-blob1 rounded-full bg-[radial-gradient(circle,rgba(20,155,142,.16),transparent_70%)] blur-[20px]" />

      <div className="relative z-[1] mx-auto max-w-[1180px] px-6">
        <DcNav active="clients" />

        {/* HEADER */}
        <section className="pb-[26px] pt-12">
          <div className="font-jbmono mb-4 text-[11px] uppercase tracking-[.22em] text-accent">Clients &amp; Case Studies</div>
          <h1 className="mb-3.5 max-w-[18ch] text-[36px] font-extrabold leading-[1.07] tracking-[-.03em] sm:text-[48px] sm:leading-[1.04]">Trusted across industries.</h1>
          <p className="m-0 max-w-[60ch] text-[17px] text-slate">From IT and manufacturing to banking and retail — 500+ teams run their corporate gifting on Supreme.</p>
        </section>

        {/* industry filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {industries.map((n) => {
            const on = active === n;
            return (
              <button
                key={n}
                onClick={() => setActive(n)}
                className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-semibold ${on ? 'bg-indigo text-white' : 'border border-line bg-white/70 text-slate'}`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {/* logo wall */}
        <div className="mb-9 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {logos.map((l) => (
            <div key={l.name} className={`flex h-20 items-center justify-center rounded-[14px] border border-line bg-white/60 text-indigo ${l.cls}`}>{l.name}</div>
          ))}
        </div>

        {/* case studies */}
        <section className="pb-5">
          <h2 className="mb-5 text-[30px] font-extrabold tracking-[-.02em]">Success stories</h2>
          {list.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-line bg-white/55 p-10 text-center text-sm text-muted">No case studies in this industry yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <div key={c.t} className="overflow-hidden rounded-[18px] border border-white/80 bg-white/55 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[14px]">
                  <DcPhoto seed={c.img} className="aspect-video" />
                  <div className="p-[18px]">
                    <div className="font-jbmono mb-[7px] text-[10px] uppercase tracking-[.06em] text-accent">{c.ind}</div>
                    <div className="mb-1.5 text-[15px] font-bold leading-[1.3]">{c.t}</div>
                    <div className="text-[13px] leading-[1.5] text-slate">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* testimonial */}
        <section className="pb-10 pt-6">
          <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#1c1d44,#23254f)] p-10 shadow-[0_24px_60px_rgba(42,43,106,.25)]">
            <div className="absolute -right-10 -top-[60px] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(20,155,142,.5),transparent_70%)] blur-[10px]" />
            <div className="relative max-w-[60ch]">
              <div className="mb-[18px] text-[46px] leading-[0.5] text-[#9fe7dc]">&ldquo;</div>
              <div className="mb-6 text-[22px] font-medium leading-[1.5] tracking-[-.01em] text-white">Supreme has been our gifting partner for nearly a decade. The new platform lets our teams self-serve catalogues and quotations — what used to take days now takes an afternoon.</div>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-[linear-gradient(135deg,#179b8e,#13b89f)]" />
                <div>
                  <div className="text-sm font-bold text-white">Head of Admin &amp; Procurement</div>
                  <div className="text-xs text-white/60">Leading IT services firm, Bangalore</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <DcFooter />
    </main>
  );
}
