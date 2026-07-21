'use client';

import { useEffect, useRef, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { getProducts, type Product } from '@/lib/catalog';

// Infinite scroll for /products: page 1 is server-rendered, this appends the rest
// as a sentinel below the grid scrolls into view.
// ponytail: native IntersectionObserver, no virtualization — the DOM only grows
// by `limit` per scroll; add windowing if someone scrolls past a few thousand.
export default function MoreProducts({ qs, page: startPage, pages }: { qs: string; page: number; pages: number }) {
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(startPage);
  const [failed, setFailed] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const done = page >= pages;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || done || failed) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || busy.current) return;
        busy.current = true;
        const p = new URLSearchParams(qs);
        p.set('page', String(page + 1));
        getProducts('?' + p.toString())
          .then((r) => {
            setItems((prev) => [...prev, ...r.products]);
            setPage((n) => n + 1);
          })
          .catch(() => setFailed(true))
          .finally(() => { busy.current = false; });
      },
      { rootMargin: '400px' }, // start fetching before the user hits the bottom
    );
    io.observe(el);
    return () => io.disconnect();
  }, [page, pages, qs, done, failed]);

  return (
    <>
      {items.map((p) => <ProductCard key={p._id} product={p} />)}
      <div ref={sentinel} className="col-span-full py-6 text-center text-sm text-muted">
        {failed ? 'Could not load more products.' : done ? 'You’ve reached the end.' : 'Loading more…'}
      </div>
    </>
  );
}
