import Link from 'next/link';
import type { PortalHero as Hero } from '@/lib/admin/companies';

export default function PortalHero({ hero }: { hero?: Hero | null }) {
  if (!hero?.image) return null;
  return (
    <section className="relative overflow-hidden rounded-[24px] shadow-[0_16px_44px_rgba(34,36,90,.16)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={hero.image} alt={hero.headline || 'Company hero'} className="h-52 w-full object-cover sm:h-72" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5 sm:p-8">
        {hero.headline && <h1 className="text-2xl font-extrabold tracking-[-.02em] text-white sm:text-4xl">{hero.headline}</h1>}
        {hero.subtitle && <p className="mt-1.5 max-w-2xl text-sm text-white/85 sm:text-base">{hero.subtitle}</p>}
        {hero.ctaText && hero.ctaLink && (
          <Link href={hero.ctaLink} className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink no-underline transition-transform hover:scale-[1.03]">
            {hero.ctaText}
          </Link>
        )}
      </div>
    </section>
  );
}
