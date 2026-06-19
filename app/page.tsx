import type { Metadata } from 'next';
import { getFeatured, getBestsellers } from '@/lib/catalog';
import type { Product } from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'Supreme International',
  description: 'B2B catalog — Supreme International',
};

function ProductGrid({ products, emptyMessage }: { products: Product[]; emptyMessage: string }) {
  if (products.length === 0) {
    return (
      <p className="text-zinc-400 text-sm py-8 text-center">{emptyMessage}</p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={String(product._id)} product={product} />
      ))}
    </div>
  );
}

export default async function HomePage() {
  const [featured, bestsellers] = await Promise.allSettled([
    getFeatured(),
    getBestsellers(),
  ]);

  const featuredProducts = featured.status === 'fulfilled' ? featured.value : [];
  const bestsellersProducts = bestsellers.status === 'fulfilled' ? bestsellers.value : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">Featured Products</h2>
        <ProductGrid products={featuredProducts} emptyMessage="No products yet" />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">Bestsellers</h2>
        <ProductGrid products={bestsellersProducts} emptyMessage="No products yet" />
      </section>
    </main>
  );
}
