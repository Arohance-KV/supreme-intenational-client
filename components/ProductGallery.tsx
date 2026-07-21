'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import DcPhoto from '@/components/DcPhoto';

// Product image gallery. The frame is a scroll-snap track, so mobile gets native
// swiping; thumbnails and the arrow buttons drive the same track by scrolling it.
// `children` is rendered as an overlay on the frame (used for the wishlist button).
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
  const track = useRef<HTMLDivElement>(null);
  const count = images.length;
  const multiple = count > 1;

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: ((i + count) % count) * el.clientWidth, behavior: 'smooth' });
  };
  // The track is the source of truth — swiping and the buttons both land here.
  const onScroll = () => {
    const el = track.current;
    if (el?.clientWidth) setActive(Math.round(el.scrollLeft / el.clientWidth)); // width 0 → NaN counter
  };

  return (
    <div className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[42%] lg:self-start">
      <div className="relative">
        {images.length > 0 ? (
          <div className="group relative aspect-square w-full overflow-hidden rounded-[18px] border border-white/70 bg-white/55 shadow-[0_14px_44px_rgba(34,36,90,.12)] sm:rounded-[22px]">
            <div
              ref={track}
              onScroll={onScroll}
              className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.map((img, i) => (
                <div key={`${img}-${i}`} className="relative h-full w-full shrink-0 snap-center">
                  <Image
                    src={img}
                    alt={i === 0 ? name : `${name} image ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>

            {multiple && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(active - 1)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 hidden h-10 w-10 sm:flex -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-lg text-ink shadow-[0_6px_18px_rgba(34,36,90,.18)] backdrop-blur-sm transition hover:bg-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => goTo(active + 1)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 hidden h-10 w-10 sm:flex -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-lg text-ink shadow-[0_6px_18px_rgba(34,36,90,.18)] backdrop-blur-sm transition hover:bg-white"
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
          <DcPhoto seed={slug} className="aspect-square w-full rounded-[18px] border border-white/70 sm:rounded-[22px] shadow-[0_14px_44px_rgba(34,36,90,.12)]" />
        )}
        {children}
      </div>

      {multiple && (
        <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 sm:mt-3">
          {images.map((img, i) => (
            <button
              type="button"
              key={`${img}-${i}`}
              onClick={() => goTo(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={active === i}
              className={`relative h-14 w-14 shrink-0 sm:h-20 sm:w-20 overflow-hidden rounded-[14px] border bg-white/55 transition ${
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
