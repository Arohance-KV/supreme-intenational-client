'use client';

import { useState } from 'react';
import Image from 'next/image';
import DcPhoto from '@/components/DcPhoto';

// Interactive product image gallery: click a thumbnail (or use the arrow buttons)
// to swap the large frame. `children` is rendered as an overlay on the main image
// (used for the wishlist button).
export default function ProductGallery({
  images,
  name,
  slug,
  children,
}: {
  images: string[];
  name: string;
  slug: string;
  children?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const count = images.length;
  const current = images[active] ?? null;
  const multiple = count > 1;

  const go = (dir: 1 | -1) => setActive((i) => (i + dir + count) % count);

  return (
    <div className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[42%] lg:self-start">
      <div className="relative">
        {current ? (
          <div className="group relative aspect-square w-full overflow-hidden rounded-[22px] border border-white/70 bg-white/55 shadow-[0_14px_44px_rgba(34,36,90,.12)]">
            <Image
              key={current}
              src={current}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />

            {multiple && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-lg text-ink shadow-[0_6px_18px_rgba(34,36,90,.18)] backdrop-blur-sm transition hover:bg-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-lg text-ink shadow-[0_6px_18px_rgba(34,36,90,.18)] backdrop-blur-sm transition hover:bg-white"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                  {active + 1} / {count}
                </div>
              </>
            )}
          </div>
        ) : (
          <DcPhoto seed={slug} className="aspect-square w-full rounded-[22px] border border-white/70 shadow-[0_14px_44px_rgba(34,36,90,.12)]" />
        )}
        {children}
      </div>

      {multiple && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              type="button"
              key={`${img}-${i}`}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={active === i}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-[14px] border bg-white/55 transition ${
                active === i ? 'border-accent ring-2 ring-accent/50' : 'border-white/70 hover:border-accent/50'
              }`}
            >
              <Image src={img} alt={`${name} image ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
