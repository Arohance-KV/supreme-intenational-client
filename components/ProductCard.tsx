import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/catalog';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageSrc = product.images[0] ?? null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-lg border border-zinc-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative h-48 w-full bg-zinc-100">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
            No image
          </div>
        )}
        {product.badge && (
          <span
            className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-medium text-white ${
              product.badge.variant === 'primary' ? 'bg-blue-600' : 'bg-rose-500'
            }`}
          >
            {product.badge.label}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm font-semibold text-zinc-800">
          {product.minPrice > 0 ? `₹${product.minPrice.toFixed(2)}` : 'Price on request'}
        </p>
        <p className="text-xs text-zinc-500">MOQ: varies by variant</p>
      </div>
    </Link>
  );
}
