import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { EMPLOYEE_CART } from '@/components/AddToCartMini';
import { eyebrow } from '@/components/employee/ui';
import type { Product } from '@/lib/catalog';

export default function FeaturedProducts({ products }: { products?: Product[] }) {
  if (!products?.length) return null;
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className={`${eyebrow} mb-1.5`}>Hand-picked for you</p>
          <h2 className="text-2xl font-extrabold tracking-[-.02em] text-ink sm:text-[28px]">Featured products</h2>
        </div>
        <Link
          href="/employee/products"
          className="hidden shrink-0 text-sm font-semibold text-accent no-underline transition-colors hover:text-indigo sm:inline"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} hrefBase="/employee/products" cartTarget={EMPLOYEE_CART} />
        ))}
      </div>
    </section>
  );
}
