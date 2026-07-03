import Link from 'next/link';
import Image from 'next/image';
import DcPhoto from '@/components/DcPhoto';
import type { Product } from '@/lib/catalog';

interface ProductCardProps {
  product: Product;
  hrefBase?: string;
}

export default function ProductCard({ product, hrefBase = '/products' }: ProductCardProps) {
  const imageSrc = product.images[0] ?? null;
  const hasDiscount = product.originalMinPrice > product.minPrice && product.minPrice > 0;

  return (
    <Link
      href={`${hrefBase}/${product.slug}`}
      className="group font-display block rounded-[20px] border border-white/85 bg-white/60 p-3.5 no-underline shadow-[0_12px_34px_rgba(34,36,90,.1)] backdrop-blur-[14px] transition-shadow hover:shadow-[0_16px_44px_rgba(34,36,90,.18)]"
    >
      <div className="relative mb-3.5 aspect-square overflow-hidden rounded-[14px] bg-[#eef0f8]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <DcPhoto seed={product.slug} className="absolute inset-0" />
        )}
        {product.badge && (
          <span className="font-jbmono absolute left-2.5 top-2.5 rounded-full bg-white/80 px-2 py-[3px] text-[10px] font-medium text-indigo">
            {product.badge.label}
          </span>
        )}
        <span className="absolute right-2.5 top-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/80 text-[13px] text-slate">♡</span>
      </div>

      {product.category && (
        <div className="font-jbmono mb-[5px] truncate text-[10px] uppercase tracking-[.08em] text-accent">{product.category}</div>
      )}
      <h3 className="mb-2 line-clamp-2 text-[15px] font-bold leading-[1.25] text-ink group-hover:text-indigo">
        {product.name}
      </h3>

      <div className="flex items-end justify-between gap-2">
        <div className="leading-[1.1]">
          <span className="text-base font-extrabold text-ink">
            {product.minPrice > 0 ? `₹ ${product.minPrice.toFixed(2)}` : 'On request'}
          </span>
          {hasDiscount && (
            <span className="ml-1.5 text-[11px] text-muted line-through">₹ {product.originalMinPrice.toFixed(2)}</span>
          )}
          <div className="font-jbmono mt-0.5 text-[10px] text-muted">tentative price</div>
        </div>
        {product.totalReviews > 0 && (
          <span className="font-jbmono shrink-0 rounded-full bg-[rgba(23,155,142,.12)] px-2 py-[3px] text-[10px] text-accent">
            ★ {product.rating.toFixed(1)}
          </span>
        )}
      </div>
    </Link>
  );
}
