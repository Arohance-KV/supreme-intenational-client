import type { PortalPromotion } from '@/lib/admin/companies';

export default function PromotionBanner({ promo }: { promo?: PortalPromotion | null }) {
  if (!promo?.image) return null;
  return (
    <section className="relative overflow-hidden rounded-[24px] shadow-[0_16px_44px_rgba(34,36,90,.16)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={promo.image} alt={promo.title || 'Promotion'} className="h-40 w-full object-cover sm:h-56" />
      {(promo.title || promo.description) && (
        <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-black/60 to-transparent p-5 sm:p-8">
          {promo.title && <p className="text-xl font-extrabold text-white sm:text-2xl">{promo.title}</p>}
          {promo.description && <p className="mt-1 max-w-lg text-sm text-white/85">{promo.description}</p>}
        </div>
      )}
    </section>
  );
}
