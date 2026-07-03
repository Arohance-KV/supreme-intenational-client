'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import DcNav from '@/components/DcNav';
import DcFooter from '@/components/DcFooter';
import DcPhoto from '@/components/DcPhoto';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mono-jb' });

// Shared class fragments
const gradClip = 'bg-clip-text text-transparent';
const sectionWrap = 'mx-auto max-w-[1280px] px-[18px] sm:px-10';
const eyebrow = 'font-jbmono text-[11px] uppercase tracking-[.14em] text-accent mb-2';

const categories = [
  { name: 'Drinkware', count: '1,240' },
  { name: 'Bags & Backpacks', count: '980' },
  { name: 'Writing & Office', count: '2,110' },
  { name: 'Tech & Gadgets', count: '760' },
  { name: 'Apparel', count: '1,520' },
  { name: 'Home & Living', count: '1,340' },
];

const featured = [
  { cat: 'Bags', name: 'Canvas Laptop Backpack', price: '₹ 1,250', moq: 'MOQ 100', rec: true },
  { cat: 'Drinkware', name: 'Insulated Steel Bottle', price: '₹ 540', moq: 'MOQ 50' },
  { cat: 'Writing', name: 'Premium Roller Pen Set', price: '₹ 320', moq: 'MOQ 200' },
  { cat: 'Tech', name: 'Wireless Charging Pad', price: '₹ 890', moq: 'MOQ 100' },
];

// Hero float cluster cycles through these every 3s (matches the mockup)
const floats = [
  { cat: 'Drinkware', count: '1,240 products', name: 'Insulated Steel Bottle', moq: 'MOQ 50', price: '₹ 540' },
  { cat: 'Bags & Backpacks', count: '980 products', name: 'Canvas Laptop Backpack', moq: 'MOQ 100', price: '₹ 1,250' },
  { cat: 'Tech & Gadgets', count: '760 products', name: 'Wireless Charging Pad', moq: 'MOQ 100', price: '₹ 890' },
];

function AddButton({ variant }: { variant: 'solid' | 'soft' }) {
  const [added, setAdded] = useState(false);
  const base = 'w-full cursor-pointer rounded-xl py-[11px] text-[13px] font-semibold transition-colors';
  const rest = added
    ? 'bg-accent text-white'
    : variant === 'solid'
      ? 'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] text-white'
      : 'bg-[rgba(42,43,106,0.07)] text-indigo border border-[rgba(42,43,106,0.12)]';
  return (
    <button
      className={`${base} ${rest}`}
      onClick={() => {
        setAdded(true);
        setTimeout(() => setAdded(false), 1100);
      }}
    >
      {added ? 'Added ✓' : 'Add to cart'}
    </button>
  );
}

export default function HomePage() {
  const [fi, setFi] = useState(0);
  const [fade, setFade] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setFade(false);
      setTimeout(() => { setFi((i) => (i + 1) % floats.length); setFade(true); }, 420);
    }, 3000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const f = floats[fi];
  const fadeCls = `transition-opacity duration-[450ms] ${fade ? 'opacity-100' : 'opacity-0'}`;

  return (
    <main className={`${jakarta.variable} ${mono.variable} font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink selection:bg-[rgba(23,155,142,0.22)]`}>
      {/* ambient mesh */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(60%_50%_at_12%_8%,rgba(74,76,201,.32),transparent_60%),radial-gradient(52%_46%_at_92%_12%,rgba(19,184,159,.30),transparent_60%),radial-gradient(50%_48%_at_78%_90%,rgba(124,77,210,.22),transparent_62%),radial-gradient(46%_42%_at_6%_88%,rgba(20,155,142,.22),transparent_62%),radial-gradient(42%_40%_at_50%_48%,rgba(224,163,59,.12),transparent_60%),linear-gradient(180deg,#eceefb_0%,#f4f1f8_50%,#e9f1f3_100%)]" />
      <div className="pointer-events-none fixed -left-[120px] -top-[160px] z-0 h-[520px] w-[520px] animate-blob1 rounded-full bg-[radial-gradient(circle,rgba(86,68,210,.40),transparent_70%)] blur-[20px]" />
      <div className="pointer-events-none fixed -right-[160px] top-10 z-0 h-[560px] w-[560px] animate-blob2 rounded-full bg-[radial-gradient(circle,rgba(19,184,159,.36),transparent_70%)] blur-[20px]" />
      <div className="pointer-events-none fixed -bottom-[200px] left-[38%] z-0 h-[480px] w-[480px] animate-blob3 rounded-full bg-[radial-gradient(circle,rgba(124,77,210,.26),transparent_70%)] blur-[24px]" />

      <div className="relative z-[1]">
        {/* NAV — unified across all public pages */}
        <div className="mx-auto max-w-[1280px] px-[18px] sm:px-10"><DcNav /></div>

        {/* HERO */}
        <div className={`grid grid-cols-1 items-center gap-8 pb-14 pt-10 lg:grid-cols-[1.05fr_0.95fr] ${sectionWrap}`}>
          <div>
            <div className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-white/70 bg-[linear-gradient(120deg,rgba(86,68,210,.14),rgba(19,184,159,.16))] py-[7px] pl-2 pr-3.5 backdrop-blur-[8px]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5644d2,#13b89f)] text-[11px] text-white">✦</span>
              <span className={`font-jbmono text-[11px] font-semibold uppercase tracking-[.1em] bg-[linear-gradient(110deg,#4a3cc0,#0f8d80)] ${gradClip}`}>Self-serve B2B gifting platform</span>
            </div>
            <h1 className={`mb-5 text-[36px] font-extrabold leading-[1.07] tracking-[-.03em] lg:text-[60px] lg:leading-[1.02] bg-[linear-gradient(120deg,#2a2b6a_0%,#4143b0_38%,#149b8e_100%)] ${gradClip}`}>Corporate gifting,<br />simplified.</h1>
            <p className="mb-[30px] max-w-[46ch] text-[18px] leading-[1.6] text-slate">Browse a curated catalogue, shortlist in a click, and generate branded quotations &amp; catalogues yourself — no back-and-forth, no waiting on sales.</p>
            <div className="mb-[34px] flex gap-3">
              <Link href="/products" className="rounded-[14px] bg-[linear-gradient(120deg,#2a2b6a_0%,#5644d2_50%,#13b89f_100%)] px-[26px] py-[15px] text-[15px] font-semibold text-white no-underline shadow-[0_12px_30px_rgba(86,68,210,.34)]">Browse Products</Link>
              <Link href="/quotation" className="rounded-[14px] border border-white/[.78] bg-white/60 px-[26px] py-[15px] text-[15px] font-semibold text-indigo no-underline backdrop-blur-[8px]">Request Quotation</Link>
            </div>
            <div className="flex gap-[30px]">
              {([['500+', 'Enterprise clients', 'bg-[linear-gradient(125deg,#3a3c98,#5644d2)]'], ['12,000+', 'Products', 'bg-[linear-gradient(125deg,#4a3cc0,#13b89f)]'], ['24/7', 'Self-serve', 'bg-[linear-gradient(125deg,#149b8e,#13b89f)]']] as const).map(([n, l, g]) => (
                <div key={l}>
                  <div className={`text-[26px] font-extrabold tracking-[-.02em] ${g} ${gradClip}`}>{n}</div>
                  <div className="font-jbmono text-xs uppercase tracking-[.08em] text-muted">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* floating cycling cluster */}
          <div className="relative hidden h-[440px] lg:block">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(86,68,210,.22),rgba(19,184,159,.16)_55%,transparent_72%)] blur-[20px]" />
            <div className="absolute right-0 top-3.5 w-[300px] animate-floaty rounded-3xl border border-white/85 bg-white/[.58] p-[18px] shadow-[0_24px_60px_rgba(34,36,90,.2)] backdrop-blur-[20px] backdrop-saturate-[1.6]">
              <div className={fadeCls}>
                <DcPhoto seed={f.name} className="mb-3.5 aspect-[4/3] rounded-2xl" />
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[15px] font-bold">{f.name}</div>
                  <span className="font-jbmono rounded-full bg-[rgba(23,155,142,.12)] px-2 py-[3px] text-[10px] text-accent">{f.moq}</span>
                </div>
                <div className="mb-3.5 flex items-end justify-between">
                  <div className="leading-[1.1]">
                    <span className="text-[18px] font-extrabold text-ink">{f.price}</span>
                    <div className="font-jbmono mt-0.5 text-[10px] text-muted">tentative price</div>
                  </div>
                </div>
                <AddButton variant="solid" />
              </div>
            </div>
            <div className="absolute bottom-[34px] left-0 w-[212px] animate-floaty2 rounded-[20px] border border-white/85 bg-white/[.58] p-4 shadow-[0_20px_50px_rgba(34,36,90,.18)] backdrop-blur-[20px] backdrop-saturate-[1.6]">
              <div className={fadeCls}>
                <div className="mb-3 flex items-center gap-[11px]">
                  <DcPhoto seed={f.cat} className="h-[46px] w-[46px] flex-none rounded-[13px]" />
                  <div>
                    <div className="font-jbmono mb-[3px] text-[9px] uppercase tracking-[.12em] text-muted">Category</div>
                    <div className="text-[15px] font-bold leading-[1.1] tracking-[-.01em] text-ink">{f.cat}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate">{f.count}</span>
                  <span className="text-[13px] font-semibold text-accent">Explore →</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* client strip */}
        <div className={`mb-2 flex items-center gap-7 rounded-[18px] border border-white/70 bg-white/[.42] px-6 py-[18px] backdrop-blur-[10px] ${sectionWrap}`}>
          <span className="font-jbmono whitespace-nowrap text-[11px] uppercase tracking-[.1em] text-muted">Trusted by</span>
          <div className="flex flex-1 items-center justify-between gap-[34px] opacity-55">
            {['L&T', 'Reliance', 'Tata', 'INFOSYS', 'HDFC', 'Wipro'].map((c) => (
              <span key={c} className="text-base font-bold text-indigo">{c}</span>
            ))}
          </div>
        </div>

        {/* SHOP BY CATEGORY */}
        <div className={`pb-2 pt-12 ${sectionWrap}`}>
          <div className="mb-[22px] flex items-end justify-between">
            <div>
              <div className={eyebrow}>Explore</div>
              <h3 className="m-0 text-[30px] font-extrabold tracking-[-.02em] text-ink">Shop by category</h3>
            </div>
            <Link href="/products" className="text-sm font-semibold text-indigo no-underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <Link key={c.name} href="/products" className="rounded-[18px] border border-white/80 bg-white/55 p-3.5 no-underline shadow-[0_8px_26px_rgba(34,36,90,.08)] backdrop-blur-[12px]">
                <DcPhoto seed={c.name} className="mb-3 aspect-square rounded-[13px]" />
                <div className="text-[13px] font-bold leading-[1.25] text-ink">{c.name}</div>
                <div className="font-jbmono text-[10px] text-muted">{c.count}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* FEATURED PRODUCTS */}
        <div className={`pb-2 pt-12 ${sectionWrap}`}>
          <div className="mb-[22px] flex items-end justify-between">
            <div>
              <div className={eyebrow}>Curated</div>
              <h3 className="m-0 text-[30px] font-extrabold tracking-[-.02em] text-ink">Featured &amp; recommended</h3>
            </div>
            <Link href="/products" className="text-sm font-semibold text-indigo no-underline">Full catalogue →</Link>
          </div>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <div key={p.name} className="rounded-[20px] border border-white/85 bg-white/60 p-3.5 shadow-[0_12px_34px_rgba(34,36,90,.1)] backdrop-blur-[14px]">
                <DcPhoto seed={p.name} className="mb-3.5 aspect-square rounded-[14px]">
                  {p.rec && <span className="font-jbmono absolute left-2.5 top-2.5 rounded-full bg-white/80 px-2 py-[3px] text-[10px] text-indigo">Recommended</span>}
                  <span className="absolute right-2.5 top-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/80 text-[13px] text-slate">♡</span>
                </DcPhoto>
                <div className="font-jbmono mb-[5px] text-[10px] uppercase tracking-[.08em] text-accent">{p.cat}</div>
                <div className="mb-2 text-[15px] font-bold leading-[1.25]">{p.name}</div>
                <div className="mb-3.5 flex items-end justify-between">
                  <div className="leading-[1.1]">
                    <span className="text-base font-extrabold text-ink">{p.price}</span>
                    <div className="font-jbmono mt-0.5 text-[10px] text-muted">tentative price</div>
                  </div>
                  <span className="font-jbmono rounded-full bg-[rgba(23,155,142,.12)] px-2 py-[3px] text-[10px] text-accent">{p.moq}</span>
                </div>
                <AddButton variant="soft" />
              </div>
            ))}
          </div>
        </div>

        {/* ENTERPRISE SOLUTIONS */}
        <div className={`pb-2 pt-14 ${sectionWrap}`}>
          <div className="mb-7 text-center">
            <div className={`${eyebrow} text-center`}>Built for procurement</div>
            <h3 className="m-0 text-[32px] font-extrabold tracking-[-.02em] text-ink">Enterprise gifting solutions</h3>
          </div>
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
            {[
              { icon: '⌁', g: 'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)]', sh: 'shadow-[0_8px_20px_rgba(42,43,106,.28)]', t: 'Quotation engine', d: 'Turn any cart into a priced, branded quotation PDF in one click — delivered by WhatsApp, email or download.' },
              { icon: '▦', g: 'bg-[linear-gradient(135deg,#179b8e,#13b89f)]', sh: 'shadow-[0_8px_20px_rgba(23,155,142,.28)]', t: 'Catalogue generator', d: 'Apply filters and compile every matching product into a branded, no-pricing catalogue to circulate internally.' },
              { icon: '◎', g: 'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)]', sh: 'shadow-[0_8px_20px_rgba(42,43,106,.28)]', t: 'Merchandise portals', d: 'Branded employee stores with points & coupon wallets, real-time balances and self-paid overage.' },
            ].map((s) => (
              <div key={s.t} className="rounded-[22px] border border-white/[.82] bg-white/55 p-[26px] shadow-[0_14px_40px_rgba(34,36,90,.1)] backdrop-blur-[16px]">
                <div className={`mb-[18px] flex h-[46px] w-[46px] items-center justify-center rounded-[14px] text-xl text-white ${s.g} ${s.sh}`}>{s.icon}</div>
                <div className="mb-2 text-[18px] font-bold">{s.t}</div>
                <div className="mb-4 text-sm leading-[1.55] text-slate">{s.d}</div>
                <span className="text-[13px] font-semibold text-indigo">Learn more →</span>
              </div>
            ))}
          </div>
        </div>

        {/* PROCESS */}
        <div className={`pb-2 pt-14 ${sectionWrap}`}>
          <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,rgba(42,43,106,.95),rgba(58,60,152,.92))] p-[38px] shadow-[0_24px_60px_rgba(42,43,106,.3)]">
            <div className="absolute -right-10 -top-[60px] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(20,155,142,.5),transparent_70%)] blur-[10px]" />
            <div className="relative">
              <div className="font-jbmono mb-2 text-[11px] uppercase tracking-[.14em] text-[#9fe7dc]">How it works</div>
              <h3 className="mb-7 text-[28px] font-extrabold tracking-[-.02em] text-white">From browse to lead in four steps</h3>
              <div className="grid grid-cols-2 gap-[18px] lg:grid-cols-4">
                {[
                  ['01', 'Browse & filter', 'No login wall — explore the full catalogue freely.'],
                  ['02', 'Shortlist to cart', 'Add items with MOQ & branding captured per line.'],
                  ['03', 'Generate output', 'Quotation PDF or no-pricing catalogue — OTP at this step.'],
                  ['04', 'Delivered', "WhatsApp routes the lead straight to Supreme's team."],
                ].map(([n, t, d]) => (
                  <div key={n} className="rounded-2xl border border-white/20 bg-white/10 p-5">
                    <div className="font-jbmono mb-3 text-[13px] text-[#9fe7dc]">{n}</div>
                    <div className="mb-1.5 text-[15px] font-bold text-white">{t}</div>
                    <div className="text-[13px] leading-[1.5] text-white/70">{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STATS + TESTIMONIAL */}
        <div className={`grid grid-cols-1 gap-[18px] pb-2 pt-14 lg:grid-cols-[1.1fr_1fr] ${sectionWrap}`}>
          <div className="grid grid-cols-2 gap-3.5">
            {([['18', ' yrs', 'Of corporate gifting'], ['500', '+', 'Enterprise clients'], ['12k', '+', 'Products in catalogue'], ['40', '%', 'Less quotation effort']] as const).map(([n, u, l]) => (
              <div key={l} className="rounded-[20px] border border-white/[.82] bg-white/55 p-6 shadow-[0_12px_34px_rgba(34,36,90,.08)] backdrop-blur-[14px]">
                <div className="text-[38px] font-extrabold tracking-[-.03em] text-ink">{n}<span className="text-[22px] text-accent">{u}</span></div>
                <div className="mt-1 text-[13px] text-slate">{l}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col rounded-[22px] border border-white/85 bg-white/60 p-[30px] shadow-[0_14px_40px_rgba(34,36,90,.1)] backdrop-blur-[16px]">
            <div className="mb-[18px] text-[40px] leading-[0.5] text-accent">&ldquo;</div>
            <div className="mb-auto text-[19px] font-medium leading-[1.5] tracking-[-.01em] text-ink">We used to wait days for a gifting quote. Now our team self-generates a branded catalogue and quotation before lunch.</div>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-[42px] w-[42px] rounded-full bg-[linear-gradient(135deg,#2a2b6a,#179b8e)]" />
              <div>
                <div className="text-sm font-bold">Procurement Lead</div>
                <div className="text-xs text-muted">Fortune 500 manufacturer</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className={`pb-12 pt-14 ${sectionWrap}`}>
          <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/50 p-12 text-center shadow-[0_24px_60px_rgba(34,36,90,.14)] backdrop-blur-[20px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(23,155,142,.18),transparent_60%)]" />
            <div className="relative">
              <h3 className="mb-3.5 text-[38px] font-extrabold tracking-[-.025em] text-ink">Ready to simplify your gifting?</h3>
              <p className="mx-auto mb-7 max-w-[52ch] text-[17px] text-slate">Browse the catalogue or send us a quick brief — we&apos;ll respond with a tailored quotation.</p>
              <div className="flex justify-center gap-3">
                <Link href="/products" className="rounded-[14px] bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-7 py-[15px] text-[15px] font-semibold text-white no-underline shadow-[0_12px_30px_rgba(42,43,106,.32)]">Browse Products</Link>
                <Link href="/quotation" className="rounded-[14px] border border-white/[.78] bg-white/70 px-7 py-[15px] text-[15px] font-semibold text-indigo no-underline">Request Quotation</Link>
              </div>
            </div>
          </div>
        </div>

        <DcFooter />
      </div>
    </main>
  );
}
