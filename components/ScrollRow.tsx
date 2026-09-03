'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

// ponytail: native overflow-x scroller + two scrollBy buttons, no carousel lib.
// Arrows are desktop-only (touch users swipe); each hides at its edge.
export default function ScrollRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  };

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scroll = (dir: number) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: 'smooth' });

  const btn =
    'absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-2xl leading-none text-ink shadow-[0_6px_20px_rgba(34,36,90,.18)] backdrop-blur-md transition hover:bg-white lg:flex';

  return (
    <div className="relative">
      {edges.left && (
        <button onClick={() => scroll(-1)} aria-label="Scroll left" className={`${btn} -left-4`}>
          ‹
        </button>
      )}
      <div ref={ref} className={`flex overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
        {children}
      </div>
      {edges.right && (
        <button onClick={() => scroll(1)} aria-label="Scroll right" className={`${btn} -right-4`}>
          ›
        </button>
      )}
    </div>
  );
}
