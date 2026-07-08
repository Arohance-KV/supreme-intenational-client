'use client';

import { useEffect, useRef, useState } from 'react';

// Live stock photo, seeded so each item keeps a stable image across fades.
const stock = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

// Hero decoration: two glass cards that cross-fade through a few sample items.
const floats = [
  { cat: 'Drinkware', count: '1,240 products', name: 'Insulated Steel Bottle', moq: 'MOQ 50', price: '₹ 540' },
  { cat: 'Bags & Backpacks', count: '980 products', name: 'Canvas Laptop Backpack', moq: 'MOQ 100', price: '₹ 1,250' },
  { cat: 'Tech & Gadgets', count: '760 products', name: 'Wireless Charging Pad', moq: 'MOQ 100', price: '₹ 890' },
];

function AddButton() {
  const [added, setAdded] = useState(false);
  return (
    <button
      className={`w-full cursor-pointer rounded-xl py-[11px] text-[13px] font-semibold transition-colors ${added ? 'bg-accent text-white' : 'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] text-white'}`}
      onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1100); }}
    >
      {added ? 'Added ✓' : 'Add to cart'}
    </button>
  );
}

export default function HomeHeroFloats() {
  const [fi, setFi] = useState(0);
  const [fade, setFade] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setFade(false);
      setTimeout(() => { setFi((i) => (i + 1) % floats.length); setFade(true); }, 420);
    }, 3000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const f = floats[fi];
  const fadeCls = `transition-opacity duration-[450ms] ${fade ? 'opacity-100' : 'opacity-0'}`;

  return (
    <div className="relative hidden h-[440px] lg:block">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(86,68,210,.22),rgba(19,184,159,.16)_55%,transparent_72%)] blur-[20px]" />
      <div className="absolute right-0 top-3.5 w-[300px] animate-floaty rounded-3xl border border-white/85 bg-white/[.58] p-[18px] shadow-[0_24px_60px_rgba(34,36,90,.2)] backdrop-blur-[20px] backdrop-saturate-[1.6]">
        <div className={fadeCls}>
          <div className="mb-3.5 aspect-[4/3] overflow-hidden rounded-2xl bg-[#eef0f8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stock(f.name, 600, 450)} alt={f.name} className="h-full w-full object-cover" />
          </div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[15px] font-bold">{f.name}</div>
            <span className="font-jbmono rounded-full bg-[rgba(23,155,142,.12)] px-2 py-[3px] text-[10px] text-accent">{f.moq}</span>
          </div>
          <div className="mb-3.5 flex items-end justify-between">
            <div className="leading-[1.1]">
              <span className="text-[18px] font-extrabold text-ink">{f.price}</span>
              <div className="font-jbmono mt-0.5 text-[10px] text-muted">tentative price</div>
            </div>
          </div>
          <AddButton />
        </div>
      </div>
      <div className="absolute bottom-[34px] left-0 w-[212px] animate-floaty2 rounded-[20px] border border-white/85 bg-white/[.58] p-4 shadow-[0_20px_50px_rgba(34,36,90,.18)] backdrop-blur-[20px] backdrop-saturate-[1.6]">
        <div className={fadeCls}>
          <div className="mb-3 flex items-center gap-[11px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stock(f.cat, 120, 120)} alt={f.cat} className="h-[46px] w-[46px] flex-none rounded-[13px] object-cover" />
            <div>
              <div className="font-jbmono mb-[3px] text-[9px] uppercase tracking-[.12em] text-muted">Category</div>
              <div className="text-[15px] font-bold leading-[1.1] tracking-[-.01em] text-ink">{f.cat}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate">{f.count}</span>
            <span className="text-[13px] font-semibold text-accent">Explore →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
