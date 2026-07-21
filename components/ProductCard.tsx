import Link from 'next/link';
import Image from 'next/image';
import DcPhoto from '@/components/DcPhoto';
import WishlistButton from '@/components/WishlistButton';
import AddToCartMini, { PUBLIC_CART, type CartTarget } from '@/components/AddToCartMini';
import type { Product } from '@/lib/catalog';

interface ProductCardProps {
  product: Product;
  hrefBase?: string;
  showAddToCart?: boolean;
  // Which cart the quick-add posts to (portals pass their own).
  cartTarget?: CartTarget;
}

export default function ProductCard({ product, hrefBase = '/products', showAddToCart = true, cartTarget = PUBLIC_CART }: ProductCardProps) {
  const imageSrc = product.images[0] ?? null;
  const hasDiscount = product.originalMinPrice > product.minPrice && product.minPrice > 0;

  return (
    <div className="group font-display relative flex flex-col rounded-[16px] border border-white/85 bg-white/60 p-2.5 sm:rounded-[20px] sm:p-3.5 shadow-[0_12px_34px_rgba(34,36,90,.1)] backdrop-blur-[14px] transition-shadow hover:shadow-[0_16px_44px_rgba(34,36,90,.18)]">
      <Link href={`${hrefBase}/${product.slug}`} className="block no-underline">
        <div className="relative mb-2.5 aspect-square overflow-hidden rounded-[12px] bg-[#eef0f8] sm:mb-3.5 sm:rounded-[14px]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <DcPhoto seed={product.slug} className="absolute inset-0" />
          )}
          {product.badge && (
            <span className="font-jbmono absolute left-2.5 top-2.5 rounded-full bg-white/80 px-2 py-[3px] text-[10px] font-medium text-indigo">
              {product.badge.label}
            </span>
          )}
        </div>

        {product.category && (
          <div className="font-jbmono mb-[5px] truncate text-[10px] uppercase tracking-[.08em] text-accent">{product.category}</div>
        )}
        <h3 className="mb-2 line-clamp-2 text-[13px] font-bold leading-[1.25] text-ink group-hover:text-indigo sm:text-[15px]">
          {product.name}
        </h3>

        <div className="flex items-end justify-between gap-2">
          <div className="leading-[1.1]">
            {hasDiscount && (
              <div className="font-jbmono text-[11px] text-muted line-through">MRP ₹ {product.originalMinPrice.toFixed(2)}</div>
            )}
            <span className="text-sm font-extrabold text-ink sm:text-base">
              {product.minPrice > 0 ? `₹ ${product.minPrice.toFixed(2)}` : 'On request'}
            </span>
            <div className="font-jbmono mt-0.5 text-[10px] text-muted">tentative price</div>
          </div>
          {product.totalReviews > 0 && (
            <span className="font-jbmono shrink-0 rounded-full bg-[rgba(23,155,142,.12)] px-2 py-[3px] text-[10px] text-accent">
              ★ {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </Link>

      {showAddToCart && (
        <div className="mt-auto pt-3">
          <AddToCartMini slug={product.slug} target={cartTarget} />
        </div>
      )}
      <WishlistButton productId={product._id} />
    </div>
  );
}
