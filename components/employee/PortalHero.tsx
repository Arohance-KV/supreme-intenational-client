import Link from 'next/link';
import type { PortalHero as Hero } from '@/lib/admin/companies';

// Portal landing header. Always renders — a company can set an image + copy, otherwise
// a branded gradient fallback carries the personalized greeting and default CTA.
export default function PortalHero({ hero, greeting }: { hero?: Hero | null; greeting: string }) {
  const hasImage = !!hero?.image;
  const headline = hero?.headline || 'Your team store';
  const subtitle = hero?.subtitle || 'Curated products at exclusive employee pricing, delivered to your door.';
  const ctaText = hero?.ctaText || 'Browse the catalog';
  const ctaLink = hero?.ctaLink || '/employee/products';

  return (
    <section className="relative flex min-h-[320px] overflow-hidden rounded-[28px] shadow-[0_24px_64px_rgba(22,23,58,.22)] sm:min-h-[440px]">
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hero!.image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(125deg,#16173a_0%,#2a2b6a_50%,#149b8e_120%)]" />
      )}

      {/* Left-weighted scrim keeps the copy legible over any image. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,13,32,.86)_0%,rgba(12,13,32,.62)_38%,rgba(12,13,32,.12)_78%,rgba(12,13,32,0)_100%)]" />

      <div className="relative z-10 flex max-w-2xl flex-col justify-center gap-4 p-7 sm:p-12 lg:p-16">
        <p className="font-jbmono text-[11px] uppercase tracking-[.2em] text-white/70">{greeting}</p>
        <h1 className="text-[32px] font-extrabold leading-[1.03] tracking-[-.025em] text-white sm:text-5xl lg:text-[56px]">
          {headline}
        </h1>
        <p className="max-w-md text-[15px] leading-relaxed text-white/80 sm:text-lg">{subtitle}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Link
            href={ctaLink}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink no-underline shadow-[0_10px_30px_rgba(0,0,0,.22)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            {ctaText}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link
            href="/employee/wallet"
            className="inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white no-underline backdrop-blur-sm transition-colors duration-200 hover:bg-white/10"
          >
            My wallet
          </Link>
        </div>
      </div>
    </section>
  );
}
