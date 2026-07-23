import type { PortalPromotion } from '@/lib/admin/companies';

export default function PromotionBanner({ promo }: { promo?: PortalPromotion | null }) {
  if (!promo?.image) return null;
  return (
    <section className="relative flex min-h-[200px] overflow-hidden rounded-[28px] shadow-[0_20px_56px_rgba(22,23,58,.2)] sm:min-h-[280px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={promo.image} alt={promo.title || 'Promotion'} className="absolute inset-0 h-full w-full object-cover" />
      {(promo.title || promo.description) && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,13,32,.8)_0%,rgba(12,13,32,.45)_45%,rgba(12,13,32,0)_85%)]" />
          <div className="relative z-10 flex max-w-xl flex-col justify-center gap-2 p-7 sm:p-12">
            <span className="w-fit rounded-full bg-accent/90 px-3 py-1 font-jbmono text-[10px] font-semibold uppercase tracking-[.12em] text-white">
              Limited time
            </span>
            {promo.title && <p className="text-2xl font-extrabold tracking-[-.02em] text-white sm:text-4xl">{promo.title}</p>}
            {promo.description && <p className="max-w-md text-sm leading-relaxed text-white/85 sm:text-base">{promo.description}</p>}
          </div>
        </>
      )}
    </section>
  );
}
