'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DcPhoto from '@/components/DcPhoto';
import { getCategories, getProducts, type Category, type Product } from '@/lib/catalog';

// Module-level caches — survive re-mounts across client-side navigation.
let _catsCache: Category[] | null = null;
const _productsCache: Record<string, Product[]> = {};

export default function NavProductsMenu({ active }: { active?: boolean }) {
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState<Category[] | null>(_catsCache);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [products, setProducts] = useState<Record<string, Product[]>>(_productsCache);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function loadProducts(slug: string) {
    if (_productsCache[slug] !== undefined) return;
    getProducts(`?category=${slug}&limit=6`)
      .then(({ products: list }) => {
        _productsCache[slug] = list;
        setProducts((p) => ({ ...p, [slug]: list }));
      })
      .catch(() => {
        _productsCache[slug] = [];
        setProducts((p) => ({ ...p, [slug]: [] }));
      });
  }

  function selectCategory(slug: string) {
    setActiveSlug(slug);
    loadProducts(slug);
  }

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
    if (_catsCache) {
      if (!activeSlug && _catsCache[0]) selectCategory(_catsCache[0].slug);
      return;
    }
    getCategories()
      .then((list) => {
        _catsCache = list;
        setCats(list);
        if (list[0]) selectCategory(list[0].slug);
      })
      .catch(() => { _catsCache = []; setCats([]); });
  }

  // Small grace period so moving the cursor from trigger → panel doesn't close it.
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  const activeProducts = activeSlug ? products[activeSlug] : undefined;

  return (
    <div
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <Link
        href="/products"
        aria-haspopup="true"
        aria-expanded={open}
        onFocus={openMenu}
        className={`inline-flex items-center gap-1 rounded-[10px] px-3 py-2 text-sm no-underline ${active ? 'bg-[rgba(42,43,106,.07)] font-semibold text-ink' : 'font-medium text-slate'}`}
      >
        Products
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </Link>

      {/* Mega-menu panel */}
      <div
        role="menu"
        className={`absolute left-0 top-full z-50 mt-2 origin-top-left transition-all duration-200 ease-out ${
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
        }`}
      >
        <div className="flex w-[640px] max-w-[86vw] overflow-hidden rounded-[18px] border border-white/80 bg-white/[.92] shadow-[0_20px_60px_rgba(34,36,90,.22)] backdrop-blur-[20px]">
          {/* Category column */}
          <div className="w-[210px] shrink-0 border-r border-line/70 bg-white/40 p-2">
            {cats === null ? (
              <div className="space-y-1.5 p-1.5">
                {[0, 1, 2, 3, 4].map((n) => <div key={n} className="h-8 animate-pulse rounded-lg bg-line/60" />)}
              </div>
            ) : cats.length === 0 ? (
              <p className="p-3 text-sm text-muted">No categories.</p>
            ) : (
              cats.map((c) => {
                const on = c.slug === activeSlug;
                return (
                  <button
                    key={c._id}
                    type="button"
                    onMouseEnter={() => selectCategory(c.slug)}
                    onFocus={() => selectCategory(c.slug)}
                    className={`flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-sm no-underline transition-colors ${
                      on ? 'bg-[rgba(42,43,106,.08)] font-semibold text-ink' : 'font-medium text-slate hover:bg-[rgba(42,43,106,.05)]'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className={`text-[13px] ${on ? 'text-accent' : 'text-muted'}`}>›</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Product preview panel */}
          <div className="min-w-0 flex-1 p-4">
            {activeProducts === undefined ? (
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <div key={n}>
                    <div className="aspect-square animate-pulse rounded-[12px] bg-line/50" />
                    <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-line/50" />
                  </div>
                ))}
              </div>
            ) : activeProducts.length === 0 ? (
              <p className="p-4 text-sm text-muted">No products in this category yet.</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {activeProducts.map((p) => (
                    <Link
                      key={p._id}
                      href={`/products/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="group no-underline"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-[12px] bg-[#eef0f8]">
                        {p.images[0] ? (
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="120px" />
                        ) : (
                          <DcPhoto seed={p.slug} className="absolute inset-0" />
                        )}
                      </div>
                      <div className="mt-1.5 line-clamp-1 text-[12px] font-semibold text-ink group-hover:text-indigo">{p.name}</div>
                      <div className="text-[11px] font-bold text-slate">
                        {p.minPrice > 0 ? `₹ ${p.minPrice.toFixed(2)}` : 'On request'}
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 border-t border-line/70 pt-3">
                  <Link
                    href={`/products?category=${activeSlug}`}
                    onClick={() => setOpen(false)}
                    className="text-[13px] font-semibold text-indigo no-underline hover:text-accent"
                  >
                    View all in this category →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
