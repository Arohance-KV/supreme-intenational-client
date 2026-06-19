import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductBySlug, getRelated } from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';
import AddToCart from '@/components/AddToCart';
import Reviews from '@/components/Reviews';
import TrackView from '@/components/TrackView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const { product } = await getProductBySlug(slug);
    return {
      title: product.name,
      description: product.description?.slice(0, 160) ?? product.name,
    };
  } catch {
    return { title: 'Product not found' };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  let detail: Awaited<ReturnType<typeof getProductBySlug>>;
  try {
    detail = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  const { product, variants } = detail;

  let related: Awaited<ReturnType<typeof getRelated>> = [];
  try {
    related = await getRelated(slug);
  } catch {
    // best-effort
  }

  const mainImage = product.images[0] ?? null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <TrackView slug={slug} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Product Hero */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 shrink-0">
            {mainImage ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-zinc-200 text-zinc-400">
                No image
              </div>
            )}
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {product.images.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
                  >
                    <Image
                      src={img}
                      alt={`${product.name} image ${i + 2}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-5 flex-1">
            {product.badge && (
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-medium text-white ${
                  product.badge.variant === 'primary' ? 'bg-blue-600' : 'bg-rose-500'
                }`}
              >
                {product.badge.label}
              </span>
            )}

            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(product.rating)
                        ? 'text-amber-400'
                        : 'text-zinc-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-zinc-500">
                {product.rating.toFixed(1)} ({product.totalReviews} review
                {product.totalReviews !== 1 ? 's' : ''})
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-zinc-600 leading-relaxed">{product.description}</p>
            )}

            {/* Add to Cart with Variant Selector */}
            <AddToCart variants={variants} />
          </div>
        </div>

        {/* Additional Details */}
        {(product.details || product.materials || product.shipping) && (
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {product.details && (
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-zinc-900">Details</h3>
                <p className="text-sm text-zinc-600">{product.details}</p>
              </div>
            )}
            {product.materials && (
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-zinc-900">Materials</h3>
                <p className="text-sm text-zinc-600">{product.materials}</p>
              </div>
            )}
            {product.shipping && (
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-zinc-900">Shipping</h3>
                <p className="text-sm text-zinc-600">{product.shipping}</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        <div className="mt-12">
          <Reviews slug={slug} />
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-zinc-900">Related Products</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
