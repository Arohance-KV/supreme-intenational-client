'use client';

import { useState } from 'react';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import DcFooter from '@/components/DcFooter';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mono-jb' });

const field = 'w-full rounded-xl border border-line bg-white/80 px-3.5 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:bg-white';
const label = 'mb-1.5 text-xs font-semibold text-slate';
const cities = ['Ahmedabad', 'Chennai', 'Hyderabad', 'Mumbai', 'Pune'];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  // ponytail: visual stub — mirrors the mockup's local feedback. Wire to a real
  // contact endpoint when one exists; no backend is defined for this form yet.
  const submit = () => {
    setSent(true);
    setTimeout(() => setSent(false), 2200);
  };

  return (
    <main className={`${jakarta.variable} ${mono.variable} font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink selection:bg-[rgba(23,155,142,0.22)]`}>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(20,155,142,.16),transparent_60%),radial-gradient(50%_45%_at_0%_6%,rgba(58,60,152,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />
      <div className="pointer-events-none fixed -right-[120px] -top-[160px] z-0 h-[500px] w-[500px] animate-blob1 rounded-full bg-[radial-gradient(circle,rgba(20,155,142,.16),transparent_70%)] blur-[20px]" />

      <div className="relative z-[1] mx-auto max-w-[1180px] px-6">

        {/* HEADER */}
        <section className="pb-[26px] pt-11">
          <div className="font-jbmono mb-4 text-[11px] uppercase tracking-[.22em] text-accent">Contact</div>
          <h1 className="mb-3 text-[32px] font-extrabold leading-[1.08] tracking-[-.03em] sm:text-[48px] sm:leading-[1.04]">Let&apos;s talk gifting.</h1>
          <p className="m-0 max-w-[56ch] text-[17px] text-slate">Send a quick brief or a sample product — our team replies within a day.</p>
        </section>

        <div className="grid grid-cols-1 items-start gap-5 pb-5 md:grid-cols-[1.2fr_1fr]">
          {/* quick quote form */}
          <div className="rounded-[22px] border border-white/80 bg-white/55 p-7 shadow-[0_14px_44px_rgba(34,36,90,.1)] backdrop-blur-[16px]">
            <div className="mb-[18px] text-[17px] font-extrabold">Quick quote request</div>
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><div className={label}>Name</div><input className={`${field} h-11`} placeholder="Your name" /></div>
              <div><div className={label}>Company</div><input className={`${field} h-11`} placeholder="Company name" /></div>
              <div><div className={label}>Work email</div><input className={`${field} h-11`} placeholder="you@company.com" /></div>
              <div><div className={label}>Phone</div><input className={`${field} h-11`} placeholder="+91" /></div>
            </div>
            <div className="mb-3">
              <div className={label}>What do you need?</div>
              <textarea className={`${field} h-[88px] resize-none py-3`} placeholder="Quantities, deadline, branding, budget…" />
            </div>
            <label className="mb-[18px] flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-white/40 p-3.5">
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[rgba(23,155,142,.12)] text-base text-accent">⬆</span>
              <div>
                <div className="text-[13px] font-semibold">Upload a sample product image</div>
                <div className="text-[11px] text-muted">PNG / JPG — we&apos;ll source a match</div>
              </div>
              <input type="file" accept="image/png,image/jpeg" className="hidden" />
            </label>
            <button
              onClick={submit}
              className={`w-full cursor-pointer rounded-[13px] p-[15px] text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(42,43,106,.3)] transition-colors ${sent ? 'bg-[linear-gradient(135deg,#176054,#179b8e)]' : 'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)]'}`}
            >
              {sent ? "✓ Request sent — we'll reply within a day" : 'Send request'}
            </button>
          </div>

          {/* offices + map */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] border border-white/70 bg-[linear-gradient(rgba(42,43,106,.04),rgba(42,43,106,.04)),repeating-linear-gradient(0deg,rgba(91,93,122,.12)_0_1px,transparent_1px_38px),repeating-linear-gradient(90deg,rgba(91,93,122,.12)_0_1px,transparent_1px_38px),linear-gradient(135deg,#e8ebf4,#dfe3ef)] shadow-[0_12px_34px_rgba(34,36,90,.1)]">
              <div className="absolute left-[42%] top-[46%] h-[18px] w-[18px] -rotate-45 rounded-[50%_50%_50%_0] bg-accent shadow-[0_4px_10px_rgba(23,155,142,.4)]" />
              <span className="font-jbmono absolute bottom-2.5 right-3 rounded-md bg-white/80 px-[7px] py-[3px] text-[9px] text-slate">map · Mysore Road, Bangalore</span>
            </div>
            <div className="rounded-[18px] border border-white/80 bg-white/55 p-[22px] shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[14px]">
              <div className="mb-4 flex items-start gap-3">
                <span className="text-base">📍</span>
                <div>
                  <div className="text-[13px] font-bold">Head Office</div>
                  <div className="text-[13px] leading-[1.5] text-slate">Vriddhi Square, No 1/4, 3rd &amp; 4th Floor, 5th Cross, Mysore Road, Bangalore 560026, Karnataka</div>
                </div>
              </div>
              <div className="mb-4 flex items-start gap-3">
                <span className="text-base">✉</span>
                <div>
                  <div className="text-[13px] font-bold">Email</div>
                  <a href="mailto:sales@supreme.example" className="text-[13px] text-slate no-underline hover:text-accent">sales@supreme.example</a>
                </div>
              </div>
              <div className="mb-4 flex items-start gap-3">
                <span className="text-base">📞</span>
                <div>
                  <div className="text-[13px] font-bold">Phone</div>
                  <div className="text-[13px] text-slate">+91 80 2952 0501</div>
                </div>
              </div>
              <a href="https://api.whatsapp.com/send?phone=919743500501" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#1fa463] p-3 text-[13px] font-semibold text-white no-underline shadow-[0_8px_20px_rgba(31,164,99,.28)]">💬 Chat on WhatsApp</a>
            </div>
          </div>
        </div>

        {/* expansion strip */}
        <section className="pb-11 pt-3">
          <div className="flex flex-wrap items-center gap-[18px] rounded-[18px] border border-white/75 bg-white/50 px-6 py-5 backdrop-blur-[12px]">
            <span className="font-jbmono whitespace-nowrap text-[11px] uppercase tracking-[.1em] text-muted">Launching soon</span>
            <div className="flex flex-wrap items-center gap-2.5">
              {cities.map((c, i) => (
                <span key={c} className="flex items-center gap-2.5">
                  <span className="text-[13px] font-semibold text-indigo">{c}</span>
                  {i < cities.length - 1 && <span className="text-muted">·</span>}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      <DcFooter />
    </main>
  );
}
