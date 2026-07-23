'use client';

import Link from 'next/link';
import { useEmployeeAuth } from '@/lib/employee/auth';
import { useRecentlyViewed, useEmployeeCompany } from '@/lib/employee/catalog';
import ProductCard from '@/components/ProductCard';
import { EMPLOYEE_CART } from '@/components/AddToCartMini';
import { glass, eyebrow, pageWrap } from '@/components/employee/ui';
import PortalHero from '@/components/employee/PortalHero';
import AnnouncementsSection from '@/components/employee/AnnouncementsSection';
import ContentBlocks from '@/components/employee/ContentBlocks';
import PromotionBanner from '@/components/employee/PromotionBanner';
import FeaturedProducts from '@/components/employee/FeaturedProducts';
import SupremeSection from '@/components/employee/SupremeSection';
import CompanyAbout from '@/components/employee/CompanyAbout';

export default function EmployeeDashboard() {
  const { token } = useEmployeeAuth();
  const { data, isLoading } = useRecentlyViewed();
  const { data: company } = useEmployeeCompany();
  const recentProducts = data?.products ?? [];

  // Decode a rough display name from the JWT payload (sub claim) if available
  let greeting = 'Welcome back';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.name) greeting = `Welcome back, ${payload.name}`;
      else if (payload.email) greeting = `Welcome back, ${payload.email.split('@')[0]}`;
    } catch {
      // ignore — fallback greeting is fine
    }
  }

  return (
    <div className="min-h-screen bg-[#eef0f8]">
      <div className={`${pageWrap} space-y-12 sm:space-y-16`}>
        <PortalHero hero={company?.portalHero} greeting={greeting} />

        <AnnouncementsSection items={company?.portalAnnouncements} />
        <CompanyAbout about={company?.portalAbout} companyName={company?.name} />
        <ContentBlocks blocks={company?.portalContentBlocks} />
        <PromotionBanner promo={company?.portalPromotion} />
        <FeaturedProducts products={company?.featuredProducts} />
        <SupremeSection />

        {/* Recently Viewed */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className={`${eyebrow} mb-1.5`}>Pick up where you left off</p>
              <h2 className="text-2xl font-extrabold tracking-[-.02em] text-ink sm:text-[28px]">Recently viewed</h2>
            </div>
            <Link href="/employee/products" className="hidden shrink-0 text-sm font-semibold text-accent no-underline transition-colors hover:text-indigo sm:inline">
              Browse all →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`h-56 animate-pulse rounded-[20px] ${glass}`} />
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className={`rounded-[20px] border-dashed py-10 text-center ${glass}`}>
              <p className="text-sm text-slate">Browse the catalog to get started</p>
              <Link
                href="/employee/products"
                className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
              >
                Go to catalog →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {recentProducts.slice(0, 10).map((product) => (
                <ProductCard key={product._id} product={product} hrefBase="/employee/products" cartTarget={EMPLOYEE_CART} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
