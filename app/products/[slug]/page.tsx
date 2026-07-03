import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductBySlug, getRelated } from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';
import AddToCart from '@/components/AddToCart';
import Reviews from '@/components/Reviews';
import TrackView from '@/components/TrackView';
import DcFooter from '@/components/DcFooter';
import DcPhoto from '@/components/DcPhoto';

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
    <main className="font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink selection:bg-[rgba(23,155,142,0.22)]">
      <TrackView slug={slug} />

      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_0%_0%,rgba(58,60,152,.16),transparent_60%),radial-gradient(50%_45%_at_100%_6%,rgba(20,155,142,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />
      <div className="pointer-events-none fixed -left-[120px] -top-[160px] z-0 h-[500px] w-[500px] animate-blob1 rounded-full bg-[radial-gradient(circle,rgba(58,60,152,.16),transparent_70%)] blur-[20px]" />

      <div className="relative z-[1] mx-auto max-w-[1280px] px-[18px] py-10 sm:px-10">
        {/* Product Hero */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Image Gallery */}
          <div className="w-full shrink-0 lg:w-1/2">
            {mainImage ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-[22px] border border-white/70 bg-white/55 shadow-[0_14px_44px_rgba(34,36,90,.12)]">
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
              <DcPhoto seed={product.slug} className="aspect-square w-full rounded-[22px] border border-white/70 shadow-[0_14px_44px_rgba(34,36,90,.12)]" />
            )}
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {product.images.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[14px] border border-white/70 bg-white/55"
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
          <div className="flex flex-1 flex-col gap-5 rounded-[22px] border border-white/80 bg-white/55 p-7 shadow-[0_14px_44px_rgba(34,36,90,.1)] backdrop-blur-[16px]">
            {product.badge && (
              <span className="font-jbmono w-fit rounded-full bg-[rgba(42,43,106,.1)] px-3 py-1 text-[11px] font-medium text-indigo">
                {product.badge.label}
              </span>
            )}

            <h1 className="text-[26px] font-extrabold tracking-[-.02em] text-ink sm:text-[32px]">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(product.rating) ? 'text-[#e0a33b]' : 'text-line'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-slate">
                {product.rating.toFixed(1)} ({product.totalReviews} review
                {product.totalReviews !== 1 ? 's' : ''})
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed text-slate">{product.description}</p>
            )}

            {/* Add to Cart with Variant Selector */}
            <AddToCart variants={variants} />
          </div>
        </div>

        {/* Additional Details */}
        {(product.details || product.materials || product.shipping) && (
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {product.details && (
              <div className="rounded-[18px] border border-white/80 bg-white/55 p-5 backdrop-blur-[14px]">
                <h3 className="mb-2 font-bold text-ink">Details</h3>
                <p className="text-sm text-slate">{product.details}</p>
              </div>
            )}
            {product.materials && (
              <div className="rounded-[18px] border border-white/80 bg-white/55 p-5 backdrop-blur-[14px]">
                <h3 className="mb-2 font-bold text-ink">Materials</h3>
                <p className="text-sm text-slate">{product.materials}</p>
              </div>
            )}
            {product.shipping && (
              <div className="rounded-[18px] border border-white/80 bg-white/55 p-5 backdrop-blur-[14px]">
                <h3 className="mb-2 font-bold text-ink">Shipping</h3>
                <p className="text-sm text-slate">{product.shipping}</p>
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
            <h2 className="mb-6 text-xl font-extrabold tracking-[-.02em] text-ink">Related Products</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <DcFooter />
    </main>
  );
}
