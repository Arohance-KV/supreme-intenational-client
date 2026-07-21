import Link from 'next/link';
import Image from 'next/image';
import DcFooter from '@/components/DcFooter';
import DcPhoto from '@/components/DcPhoto';
import ProductCard from '@/components/ProductCard';
import HomeHeroFloats from '@/components/HomeHeroFloats';
import TrustedBy from '@/components/TrustedBy';
import { getCategories, getFeatured, type Category, type Product } from '@/lib/catalog';
import { getClientLogos } from '@/lib/content';

// Shared class fragments
const gradClip = 'bg-clip-text text-transparent';
const sectionWrap = 'mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10';
// Section heading — fluid so it never overflows a 320px screen.
const h3 = 'm-0 text-[24px] font-extrabold tracking-[-.02em] text-ink sm:text-[30px]';
const eyebrow = 'font-jbmono text-[11px] uppercase tracking-[.14em] text-accent mb-2';

export default async function HomePage() {
  // Dynamic catalogue data — degrade gracefully if the API is unreachable.
  let categories: Category[] = [];
  let featured: Product[] = [];
  try { [categories, featured] = await Promise.all([getCategories(), getFeatured()]); }
  catch { /* leave empty; sections render their headers only */ }
  const logos = await getClientLogos(); // safe(): [] if API unreachable → TrustedBy falls back

  return (
    <main className="font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink selection:bg-[rgba(23,155,142,0.22)]">
      {/* ambient mesh */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(60%_50%_at_12%_8%,rgba(74,76,201,.32),transparent_60%),radial-gradient(52%_46%_at_92%_12%,rgba(19,184,159,.30),transparent_60%),radial-gradient(50%_48%_at_78%_90%,rgba(124,77,210,.22),transparent_62%),radial-gradient(46%_42%_at_6%_88%,rgba(20,155,142,.22),transparent_62%),radial-gradient(42%_40%_at_50%_48%,rgba(224,163,59,.12),transparent_60%),linear-gradient(180deg,#eceefb_0%,#f4f1f8_50%,#e9f1f3_100%)]" />
      <div className="pointer-events-none fixed -left-[120px] -top-[160px] z-0 h-[520px] w-[520px] animate-blob1 rounded-full bg-[radial-gradient(circle,rgba(86,68,210,.40),transparent_70%)] blur-[20px]" />
      <div className="pointer-events-none fixed -right-[160px] top-10 z-0 h-[560px] w-[560px] animate-blob2 rounded-full bg-[radial-gradient(circle,rgba(19,184,159,.36),transparent_70%)] blur-[20px]" />
      <div className="pointer-events-none fixed -bottom-[200px] left-[38%] z-0 h-[480px] w-[480px] animate-blob3 rounded-full bg-[radial-gradient(circle,rgba(124,77,210,.26),transparent_70%)] blur-[24px]" />

      <div className="relative z-[1]">
        {/* HERO */}
        <section className={`pb-10 pt-6 sm:pb-14 sm:pt-10 ${sectionWrap}`}>
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className={`mb-4 text-[32px] font-extrabold leading-[1.07] tracking-[-.03em] sm:mb-5 sm:text-[44px] lg:text-[60px] lg:leading-[1.02] bg-[linear-gradient(120deg,#2a2b6a_0%,#4143b0_38%,#149b8e_100%)] ${gradClip}`}>Corporate gifting,<br />simplified.</h1>
            <p className="mb-7 max-w-[46ch] text-[16px] leading-[1.6] text-slate sm:mb-[30px] sm:text-[18px]">Browse a curated catalogue, shortlist in a click, and generate branded quotations &amp; catalogues yourself — no back-and-forth, no waiting on sales.</p>
            <div className="mb-8 flex gap-2.5 sm:mb-[34px] sm:gap-3">
              <Link href="/products" className="flex-1 rounded-[14px] bg-[linear-gradient(120deg,#2a2b6a_0%,#5644d2_50%,#13b89f_100%)] px-4 py-[15px] text-center text-[14px] font-semibold text-white no-underline shadow-[0_12px_30px_rgba(86,68,210,.34)] sm:flex-none sm:px-[26px] sm:text-[15px]">Browse Products</Link>
              <Link href="/quotation" className="flex-1 rounded-[14px] border border-white/[.78] bg-white/60 px-4 py-[15px] text-center text-[14px] font-semibold text-indigo no-underline backdrop-blur-[8px] sm:flex-none sm:px-[26px] sm:text-[15px]">Request Quotation</Link>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4 sm:gap-x-[30px]">
              {([['500+', 'Enterprise clients', 'bg-[linear-gradient(125deg,#3a3c98,#5644d2)]'], ['12,000+', 'Products', 'bg-[linear-gradient(125deg,#4a3cc0,#13b89f)]'], ['24/7', 'Self-serve', 'bg-[linear-gradient(125deg,#149b8e,#13b89f)]']] as const).map(([n, l, g]) => (
                <div key={l}>
                  <div className={`text-[22px] font-extrabold tracking-[-.02em] sm:text-[26px] ${g} ${gradClip}`}>{n}</div>
                  <div className="font-jbmono text-xs uppercase tracking-[.08em] text-muted">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <HomeHeroFloats />
        </div>

        {/* trusted-by — live logos, infinite marquee, part of the hero */}
        <div className="mt-10"><TrustedBy logos={logos.map((l) => ({ name: l.name, logoUrl: l.logoUrl }))} /></div>
        </section>

        {/* SHOP BY CATEGORY */}
        <div className={`pb-2 pt-9 sm:pt-12 ${sectionWrap}`}>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-1.5 sm:mb-[22px]">
            <div>
              <div className={eyebrow}>Explore</div>
              <h3 className={h3}>Shop by category</h3>
            </div>
            <Link href="/products" className="text-sm font-semibold text-indigo no-underline">View all →</Link>
          </div>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
              {categories.slice(0, 6).map((c) => (
                <Link key={c._id} href={`/products?category=${c.slug}`} className="group rounded-[18px] border border-white/80 bg-white/55 p-3.5 no-underline shadow-[0_8px_26px_rgba(34,36,90,.08)] backdrop-blur-[12px] transition-shadow hover:shadow-[0_14px_36px_rgba(34,36,90,.16)]">
                  <div className="relative mb-3 aspect-square overflow-hidden rounded-[13px] bg-[#eef0f8]">
                    {c.image ? (
                      <Image src={c.image} alt={c.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 16vw" />
                    ) : (
                      <DcPhoto seed={c.name} className="absolute inset-0" />
                    )}
                  </div>
                  <div className="text-[13px] font-bold leading-[1.25] text-ink group-hover:text-indigo">{c.name}</div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Categories are loading — check back shortly.</p>
          )}
        </div>

        {/* FEATURED PRODUCTS */}
        <div className={`pb-2 pt-9 sm:pt-12 ${sectionWrap}`}>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-1.5 sm:mb-[22px]">
            <div>
              <div className={eyebrow}>Curated</div>
              <h3 className={h3}>Featured &amp; recommended</h3>
            </div>
            <Link href="/products" className="text-sm font-semibold text-indigo no-underline">Full catalogue →</Link>
          </div>
          {featured.length > 0 ? (
            // ponytail: native scroll-snap carousel, no slider lib; plain grid at lg.
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-[18px] lg:overflow-visible lg:px-0 lg:pb-0">
              {featured.slice(0, 4).map((p) => (
                <div key={p._id} className="w-[74%] shrink-0 snap-start sm:w-[44%] lg:w-auto">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Featured products are loading — check back shortly.</p>
          )}
        </div>

        {/* ENTERPRISE SOLUTIONS */}
        <div className={`pb-2 pt-10 sm:pt-14 ${sectionWrap}`}>
          <div className="mb-7 text-center">
            <div className={`${eyebrow} text-center`}>Built for procurement</div>
            <h3 className={h3}>Enterprise gifting solutions</h3>
          </div>
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
            {[
              { icon: '⌁', g: 'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)]', sh: 'shadow-[0_8px_20px_rgba(42,43,106,.28)]', t: 'Quotation engine', d: 'Turn any cart into a priced, branded quotation PDF in one click — delivered by WhatsApp, email or download.' },
              { icon: '▦', g: 'bg-[linear-gradient(135deg,#179b8e,#13b89f)]', sh: 'shadow-[0_8px_20px_rgba(23,155,142,.28)]', t: 'Catalogue generator', d: 'Apply filters and compile every matching product into a branded, no-pricing catalogue to circulate internally.' },
              { icon: '◎', g: 'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)]', sh: 'shadow-[0_8px_20px_rgba(42,43,106,.28)]', t: 'Merchandise portals', d: 'Branded employee stores with points & coupon wallets, real-time balances and self-paid overage.' },
            ].map((s) => (
              <div key={s.t} className="rounded-[22px] border border-white/[.82] bg-white/55 p-5 sm:p-[26px] shadow-[0_14px_40px_rgba(34,36,90,.1)] backdrop-blur-[16px]">
                <div className={`mb-[18px] flex h-[46px] w-[46px] items-center justify-center rounded-[14px] text-xl text-white ${s.g} ${s.sh}`}>{s.icon}</div>
                <div className="mb-2 text-[18px] font-bold">{s.t}</div>
                <div className="mb-4 text-sm leading-[1.55] text-slate">{s.d}</div>
                <span className="text-[13px] font-semibold text-indigo">Learn more →</span>
              </div>
            ))}
          </div>
        </div>

        {/* PROCESS */}
        <div className={`pb-2 pt-10 sm:pt-14 ${sectionWrap}`}>
          <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,rgba(42,43,106,.95),rgba(58,60,152,.92))] p-6 sm:p-[38px] shadow-[0_24px_60px_rgba(42,43,106,.3)]">
            <div className="absolute -right-10 -top-[60px] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(20,155,142,.5),transparent_70%)] blur-[10px]" />
            <div className="relative">
              <div className="font-jbmono mb-2 text-[11px] uppercase tracking-[.14em] text-[#9fe7dc]">How it works</div>
              <h3 className="mb-6 text-[22px] font-extrabold tracking-[-.02em] text-white sm:mb-7 sm:text-[28px]">From browse to lead in four steps</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-[18px] lg:grid-cols-4">
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
        <div className={`grid grid-cols-1 gap-[18px] pb-2 pt-10 sm:pt-14 lg:grid-cols-[1.1fr_1fr] ${sectionWrap}`}>
          <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
            {([['18', ' yrs', 'Of corporate gifting'], ['500', '+', 'Enterprise clients'], ['12k', '+', 'Products in catalogue'], ['40', '%', 'Less quotation effort']] as const).map(([n, u, l]) => (
              <div key={l} className="rounded-[20px] border border-white/[.82] bg-white/55 p-4 shadow-[0_12px_34px_rgba(34,36,90,.08)] backdrop-blur-[14px] sm:p-6">
                <div className="text-[28px] font-extrabold tracking-[-.03em] text-ink sm:text-[38px]">{n}<span className="text-[18px] text-accent sm:text-[22px]">{u}</span></div>
                <div className="mt-1 text-[13px] text-slate">{l}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col rounded-[22px] border border-white/85 bg-white/60 p-6 shadow-[0_14px_40px_rgba(34,36,90,.1)] backdrop-blur-[16px] sm:p-[30px]">
            <div className="mb-[18px] text-[40px] leading-[0.5] text-accent">&ldquo;</div>
            <div className="mb-auto text-[17px] font-medium leading-[1.5] tracking-[-.01em] text-ink sm:text-[19px]">We used to wait days for a gifting quote. Now our team self-generates a branded catalogue and quotation before lunch.</div>
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
        <div className={`pb-10 pt-10 sm:pb-12 sm:pt-14 ${sectionWrap}`}>
          <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/50 p-7 text-center shadow-[0_24px_60px_rgba(34,36,90,.14)] backdrop-blur-[20px] sm:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(23,155,142,.18),transparent_60%)]" />
            <div className="relative">
              <h3 className="mb-3.5 text-[26px] font-extrabold tracking-[-.025em] text-ink sm:text-[38px]">Ready to simplify your gifting?</h3>
              <p className="mx-auto mb-7 max-w-[52ch] text-[15px] text-slate sm:text-[17px]">Browse the catalogue or send us a quick brief — we&apos;ll respond with a tailored quotation.</p>
              <div className="flex justify-center gap-2.5 sm:gap-3">
                <Link href="/products" className="flex-1 rounded-[14px] bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-4 py-[15px] text-[14px] font-semibold text-white no-underline shadow-[0_12px_30px_rgba(42,43,106,.32)] sm:flex-none sm:px-7 sm:text-[15px]">Browse Products</Link>
                <Link href="/quotation" className="flex-1 rounded-[14px] border border-white/[.78] bg-white/70 px-4 py-[15px] text-[14px] font-semibold text-indigo no-underline sm:flex-none sm:px-7 sm:text-[15px]">Request Quotation</Link>
              </div>
            </div>
          </div>
        </div>

        <DcFooter />
      </div>
    </main>
  );
}
