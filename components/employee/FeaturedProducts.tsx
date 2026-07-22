import ProductCard from '@/components/ProductCard';
import { EMPLOYEE_CART } from '@/components/AddToCartMini';
import { eyebrow } from '@/components/employee/ui';
import type { Product } from '@/lib/catalog';

export default function FeaturedProducts({ products }: { products?: Product[] }) {
  if (!products?.length) return null;
  return (
    <section>
      <p className={`${eyebrow} mb-1`}>HAND-PICKED FOR YOU</p>
      <h2 className="mb-4 text-xl font-extrabold tracking-[-.02em] text-ink">Featured Products</h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} hrefBase="/employee/products" cartTarget={EMPLOYEE_CART} />
        ))}
      </div>
    </section>
  );
}
