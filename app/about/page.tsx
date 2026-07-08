import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import DcFooter from '@/components/DcFooter';
import DcPhoto from '@/components/DcPhoto';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mono-jb' });

export const metadata: Metadata = {
  title: 'About · Supreme International',
  description: 'Three decades of trusted corporate gifting across South India — established 1996.',
};

const stats = [
  ['1996', 'Established'],
  ['25+', 'Strong team'],
  ['9', 'Product categories'],
  ['South India', '& expanding'],
];

const directors = [
  { initials: 'SJ', grad: 'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)]', name: 'Mr. Surendra B Jain', role: 'Founder & Managing Director', bio: 'Founded the company in 1996 and built it from SV Enterprises into a trusted corporate gifting house across South India.' },
  { initials: 'SI', grad: 'bg-[linear-gradient(135deg,#149b8e,#13b89f)]', name: 'Director Name', role: 'Director', bio: "Placeholder — share the second director's name, title and bio and I'll drop it in. Photo replaces the slot at left." },
];

const advantages = [
  { n: '01', t: 'Wide Distribution', d: 'A wide distribution network across India.' },
  { n: '02', t: 'Premium Quality', d: 'We manufacture and supply premium-quality products.' },
  { n: '03', t: 'Ethical Business', d: 'We adhere to ethical business practices.' },
  { n: '04', t: 'Delivery Punctuality', d: 'Punctual delivery — you can rest assured.' },
  { n: '05', t: 'One-Stop Shop', d: 'A single source for all your gifting needs.' },
  { n: '06', t: 'Decades of Experience', d: 'More than two decades of experience.' },
];

const advTags = ['Competitiveness', 'Service & Coordination', 'Commitment', 'Honesty & Politeness', 'Expert Team', 'Customisation', 'Wide Range of Products'];

const eyebrow = 'font-jbmono text-[11px] uppercase tracking-[.18em] text-accent mb-3';

export default function AboutPage() {
  return (
    <main className={`${jakarta.variable} ${mono.variable} font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink selection:bg-[rgba(23,155,142,0.22)]`}>
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_0%_0%,rgba(58,60,152,.18),transparent_60%),radial-gradient(50%_45%_at_100%_6%,rgba(20,155,142,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />
      <div className="pointer-events-none fixed -left-[120px] -top-[160px] z-0 h-[500px] w-[500px] animate-blob1 rounded-full bg-[radial-gradient(circle,rgba(58,60,152,.2),transparent_70%)] blur-[20px]" />

      <div className="relative z-[1] mx-auto max-w-[1180px] px-6">

        {/* HERO */}
        <section className="pb-6 pt-12">
          <div className={eyebrow}>Company Profile · Since 1996</div>
          <h1 className="mb-5 max-w-[20ch] text-[32px] font-extrabold leading-[1.08] tracking-[-.03em] sm:text-[52px] sm:leading-[1.03]">Three decades of trusted corporate gifting.</h1>
          <p className="m-0 max-w-[70ch] text-[18px] leading-[1.65] text-slate">Established in 1996 by Mr. Surendra B Jain — and formerly known as SV Enterprises — Supreme International is one of the most trusted associates for the corporate gifting requirements of leading business entities across South India.</p>
        </section>

        {/* STORY + IMAGE */}
        <section className="grid grid-cols-1 items-stretch gap-8 pb-7 pt-3 md:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[22px] border border-white/80 bg-white/55 p-[30px] shadow-[0_12px_40px_rgba(34,36,90,.08)] backdrop-blur-[16px]">
            <p className="mb-4 text-[15px] leading-[1.7] text-slate">We carry a diverse range of products to meet any gifting requirement and constantly thrive to introduce new, innovative products — giving you a basket of options to choose from. The assortment starts at pens, key chains and bags, and goes all the way up to home appliances, suitcases and much more.</p>
            <p className="mb-4 text-[15px] leading-[1.7] text-slate">Our expertise is to customize and personalize any product to your design. With a team of 25 people, we commit to professional, expert service that caters to your requirements within the time frame assured.</p>
            <p className="m-0 text-[15px] leading-[1.7] text-slate">We believe in following ethical business practices and the utmost quality to strengthen our relationships with clients — addressing the growing needs of varied clients with experience, expertise, excellence and diligence.</p>
            <div className="mt-[22px] inline-flex items-center gap-2.5 rounded-full border border-[rgba(23,155,142,.22)] bg-[rgba(23,155,142,.1)] px-3.5 py-[9px] text-[13px] font-semibold text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />Launching soon in Ahmedabad, Chennai, Hyderabad, Mumbai &amp; Pune
            </div>
          </div>
          <DcPhoto seed="about-facility" className="min-h-[340px] rounded-[22px] border border-white/70 shadow-[0_14px_40px_rgba(34,36,90,.1)]" />
        </section>

        {/* STATS */}
        <section className="mb-9 grid grid-cols-2 gap-y-6 rounded-[22px] bg-[linear-gradient(135deg,#1c1d44,#23254f)] p-[30px] shadow-[0_20px_50px_rgba(42,43,106,.25)] md:grid-cols-4 md:gap-y-0">
          {stats.map(([n, l], i) => (
            <div key={l} className={`text-center ${i < stats.length - 1 ? 'md:border-r md:border-white/[.12]' : ''}`}>
              <div className="text-[34px] font-extrabold tracking-[-.02em] text-white">{n}</div>
              <div className="mt-1 text-xs text-white/60">{l}</div>
            </div>
          ))}
        </section>

        {/* DIRECTORS */}
        <section className="pb-7 pt-2">
          <div className={eyebrow}>Leadership</div>
          <h2 className="mb-[22px] text-[34px] font-extrabold tracking-[-.02em]">Our Directors</h2>
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
            {directors.map((d) => (
              <div key={d.name} className="flex gap-[18px] rounded-[20px] border border-white/80 bg-white/55 p-[22px] shadow-[0_12px_34px_rgba(34,36,90,.08)] backdrop-blur-[14px]">
                <div className={`flex h-24 w-24 flex-none items-center justify-center rounded-2xl text-[30px] font-extrabold tracking-[-.02em] text-white ${d.grad}`}>{d.initials}</div>
                <div>
                  <div className="text-[18px] font-extrabold tracking-[-.01em]">{d.name}</div>
                  <div className="font-jbmono my-[5px] mb-2.5 text-[11px] uppercase tracking-[.06em] text-accent">{d.role}</div>
                  <div className="text-[13px] leading-[1.55] text-slate">{d.bio}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WHY US */}
        <section className="pb-7 pt-2">
          <div className={eyebrow}>Why Supreme</div>
          <h2 className="mb-[22px] text-[34px] font-extrabold tracking-[-.02em]">Our competitive advantage</h2>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {advantages.map((a) => (
              <div key={a.n} className="rounded-[18px] border border-white/80 bg-white/55 p-[22px] shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[14px]">
                <div className="font-jbmono mb-3 text-[13px] text-accent">{a.n}</div>
                <div className="mb-1.5 text-base font-bold">{a.t}</div>
                <div className="text-[13px] leading-[1.55] text-slate">{a.d}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {advTags.map((t) => (
              <span key={t} className="rounded-full border border-[rgba(42,43,106,.12)] bg-[rgba(42,43,106,.07)] px-[13px] py-2 text-xs font-semibold text-indigo">{t}</span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-12 pt-2">
          <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/50 p-10 text-center shadow-[0_24px_60px_rgba(34,36,90,.14)] backdrop-blur-[20px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(23,155,142,.18),transparent_60%)]" />
            <div className="relative">
              <h3 className="mb-3 text-[32px] font-extrabold tracking-[-.025em]">Let&apos;s plan your next gift programme</h3>
              <p className="mx-auto mb-6 max-w-[50ch] text-base text-slate">Browse the catalogue or send a quick brief — our team replies within a day.</p>
              <div className="flex justify-center gap-3">
                <Link href="/products" className="rounded-[14px] bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-7 py-[15px] text-[15px] font-semibold text-white no-underline shadow-[0_12px_30px_rgba(42,43,106,.32)]">Browse Products</Link>
                <Link href="/contact" className="rounded-[14px] border border-white/[.78] bg-white/70 px-7 py-[15px] text-[15px] font-semibold text-indigo no-underline">Contact Us</Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <DcFooter />
    </main>
  );
}
