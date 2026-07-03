import type { ReactNode } from 'react';

// Mock photo placeholder: a seeded gradient tile with a photo glyph, standing in
// where a real product/case image goes. Swap for <Image> once assets land in /public.
// Styling stays Tailwind; the seed just picks a deterministic gradient so tiles vary.
const GRADS = [
  'bg-[linear-gradient(135deg,#aeb8e8,#e6eaf6)]',
  'bg-[linear-gradient(135deg,#a9ddd4,#e3efed)]',
  'bg-[linear-gradient(135deg,#c3b3ea,#ece7f7)]',
  'bg-[linear-gradient(135deg,#e6cfa0,#f4ecd9)]',
  'bg-[linear-gradient(135deg,#b9c2d9,#e9edf5)]',
  'bg-[linear-gradient(135deg,#b7e0c9,#e6f2ec)]',
];

function pick(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADS[h % GRADS.length];
}

export default function DcPhoto({ seed, className = '', children }: { seed: string; className?: string; children?: ReactNode }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${pick(seed)} ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="h-1/3 w-1/3 max-h-10 max-w-10 text-white/70" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
        <path d="M4 17l4.5-4.5 3 3L15 11l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </div>
  );
}
