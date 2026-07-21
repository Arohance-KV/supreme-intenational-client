'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import GenerateCatalogueModal from '@/components/GenerateCatalogueModal';
import Filters from '@/components/Filters';

const selectCls =
  'rounded-xl border border-line bg-white/80 px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent focus:bg-white';
const genCls =
  'inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#149b8e,#13b89f)] px-4 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_8px_22px_rgba(23,155,142,.32)] transition-shadow hover:shadow-[0_10px_28px_rgba(23,155,142,.42)]';

const SORTS = [
  { value: '', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

// Bottom sheet — mobile only, so no desktop styling. Backdrop click closes.
function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="font-display fixed inset-0 z-[100] lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-[22px] border-t border-white/80 bg-[#f4f5fb] p-4 pb-8 shadow-[0_-10px_40px_rgba(34,36,90,.25)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="cursor-pointer border-0 bg-transparent px-2 text-lg leading-none text-slate">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ProductsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [sheet, setSheet] = useState<'sort' | 'filter' | null>(null);
  const sort = searchParams.get('sort') ?? '';

  const onSort = (v: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('page');
    if (v) p.set('sort', v); else p.delete('sort');
    const qs = p.toString();
    router.push(qs ? '/products?' + qs : '/products');
  };

  const icon = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className="flex items-center gap-3">
      {/* Sort moves into the sticky bottom bar on mobile. */}
      <select value={sort} onChange={(e) => onSort(e.target.value)} className={`hidden lg:block ${selectCls}`} aria-label="Sort products">
        {SORTS.map((s) => <option key={s.value} value={s.value}>Sort: {s.label}</option>)}
      </select>

      {isLoggedIn ? (
        <button onClick={() => setModalOpen(true)} className={genCls}>{icon} Generate Catalogue</button>
      ) : (
        <Link href="/login" className={genCls}>{icon} Generate Catalogue</Link>
      )}

      {isLoggedIn && <GenerateCatalogueModal open={modalOpen} onClose={() => setModalOpen(false)} />}

      {/* Myntra-style sticky Sort / Filter bar — mobile only. */}
      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 border-t border-line bg-white/95 backdrop-blur-[14px] lg:hidden">
        <button onClick={() => setSheet('sort')} className="cursor-pointer border-0 border-r border-line bg-transparent py-3.5 text-sm font-semibold text-ink">
          Sort
        </button>
        <button onClick={() => setSheet('filter')} className="cursor-pointer border-0 bg-transparent py-3.5 text-sm font-semibold text-ink">
          Filter
        </button>
      </div>

      {sheet === 'sort' && (
        <Sheet title="Sort by" onClose={() => setSheet(null)}>
          <div className="flex flex-col">
            {SORTS.map((s) => (
              <button
                key={s.value}
                onClick={() => { onSort(s.value); setSheet(null); }}
                className={`cursor-pointer rounded-xl border-0 bg-transparent px-3 py-3 text-left text-[15px] ${sort === s.value ? 'bg-white font-bold text-indigo' : 'font-medium text-slate'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {sheet === 'filter' && (
        <Sheet title="Filters" onClose={() => setSheet(null)}>
          <Filters />
        </Sheet>
      )}
    </div>
  );
}
