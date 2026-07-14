'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { CartItem } from '@/lib/cart';
import { glass, secondaryBtn } from '@/components/employee/ui';

function formatPrice(value: number): string {
  return `₹${value.toFixed(2)}`;
}

// Structural mutation shapes — satisfied by both useCartMutations and
// useEmployeeCartMutations, so this row is shared without coupling to either lib.
interface CartItemRowProps {
  item: CartItem;
  setQty: { mutate: (v: { variantId: string; qty: number }) => void; isPending: boolean };
  remove: { mutate: (v: { variantId: string }) => void; isPending: boolean };
  enforceMoq: boolean;
  productHrefBase: string;
}

// Extracted verbatim from CartView so item-card rendering is identical across
// the employee cart and the B2B quotation cart. ponytail: don't restyle here.
export default function CartItemRow({ item, setQty, remove, enforceMoq, productHrefBase }: CartItemRowProps) {
  return (
    <div className={`flex gap-4 ${glass} rounded-[16px] p-4`}>
      {/* Image */}
      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white/40">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.productName}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">
            No image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`${productHrefBase}/${item.productSlug}`}
          className="font-semibold text-ink hover:text-indigo truncate block"
        >
          {item.productName}
        </Link>
        <p className="text-muted font-jbmono text-[11px] mt-0.5">SKU: {item.sku}</p>
        {item.attributeLabels.length > 0 && (
          <p className="text-muted font-jbmono text-[11px]">{item.attributeLabels.join(' / ')}</p>
        )}
        <p className="text-sm font-medium text-ink mt-1">
          Unit price: {formatPrice(item.priceSnapshot)}
        </p>
        {item.priceChanged && (
          <p className="text-xs text-amber-600 mt-0.5">
            Price changed — current: {formatPrice(item.currentPrice)}
          </p>
        )}
      </div>

      {/* Qty + total + remove */}
      <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
        <p className="font-extrabold text-ink">{formatPrice(item.priceSnapshot * item.qty)}</p>

        {/* Qty stepper */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const floor = enforceMoq ? item.moq : 1;
              const next = item.qty - 1;
              if (next >= floor) {
                setQty.mutate({ variantId: item.variantId, qty: next });
              }
            }}
            disabled={item.qty <= (enforceMoq ? item.moq : 1) || setQty.isPending}
            className={`${secondaryBtn} h-8 w-8 flex items-center justify-center`}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium text-ink">{item.qty}</span>
          <button
            onClick={() => setQty.mutate({ variantId: item.variantId, qty: item.qty + 1 })}
            disabled={setQty.isPending}
            className={`${secondaryBtn} h-8 w-8 flex items-center justify-center`}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {enforceMoq && item.moq > 1 && (
          <p className="text-xs text-muted">Min. qty: {item.moq}</p>
        )}

        <button
          onClick={() => remove.mutate({ variantId: item.variantId })}
          disabled={remove.isPending}
          className="text-xs text-slate hover:text-[#e0524d] disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
