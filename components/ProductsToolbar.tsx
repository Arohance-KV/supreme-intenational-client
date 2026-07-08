'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import GenerateCatalogueModal from '@/components/GenerateCatalogueModal';

const selectCls =
  'rounded-xl border border-line bg-white/80 px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent focus:bg-white';
const genCls =
  'inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#149b8e,#13b89f)] px-4 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_8px_22px_rgba(23,155,142,.32)] transition-shadow hover:shadow-[0_10px_28px_rgba(23,155,142,.42)]';

export default function ProductsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
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
      <select value={sort} onChange={(e) => onSort(e.target.value)} className={selectCls} aria-label="Sort products">
        <option value="">Sort: Relevance</option>
        <option value="newest">Newest</option>
        <option value="rating">Top Rated</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>

      {isLoggedIn ? (
        <button onClick={() => setModalOpen(true)} className={genCls}>{icon} Generate Catalogue</button>
      ) : (
        <Link href="/login" className={genCls}>{icon} Generate Catalogue</Link>
      )}

      {isLoggedIn && <GenerateCatalogueModal open={modalOpen} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
