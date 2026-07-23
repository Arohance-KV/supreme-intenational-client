'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { readableTextColor } from '@/lib/color';
import { useAdminProducts } from '@/lib/admin/products';
import {
  useCompanyProducts, useUpdateCompany,
  type AdminCompany, type PortalAnnouncement, type PortalContentBlock, type PortalAbout, type PortalStat,
} from '@/lib/admin/companies';

const inputCls = 'w-full rounded-lg border border-line bg-white/70 px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';
const labelCls = 'mb-1 block text-xs font-medium text-slate';
const sectionCls = 'rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5 sm:p-6';
const primaryBtn = 'rounded-lg bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60';
const subBtn = 'rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-slate hover:bg-white/70';

// Local debounce hook — mirrors the one defined in app/admin/companies/[id]/page.tsx
// (not exported from there, so re-declared here for the featured-products search).
function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function PortalBrandingSection({ company }: { company: AdminCompany }) {
  const update = useUpdateCompany(company._id);

  const [hero, setHero] = useState(company.portalHero ?? {});
  const [theme, setTheme] = useState(company.portalTheme ?? {});
  const [promo, setPromo] = useState(company.portalPromotion ?? {});
  const [announcements, setAnnouncements] = useState<PortalAnnouncement[]>(company.portalAnnouncements ?? []);
  const [blocks, setBlocks] = useState<PortalContentBlock[]>(company.portalContentBlocks ?? []);
  const [about, setAbout] = useState<PortalAbout>(company.portalAbout ?? {});
  const stats = about.stats ?? [];
  const setStats = (next: PortalStat[]) => setAbout({ ...about, stats: next });

  // Featured products: local id list + a debounced search (same admin product
  // search CompanyCatalogSection uses) to resolve names/images for picking.
  const [featured, setFeatured] = useState<string[]>(company.featuredProductIds ?? []);
  const [productQuery, setProductQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const debouncedProductQuery = useDebounced(productQuery);
  const { data: productSearch, isFetching: productsFetching } = useAdminProducts(1, debouncedProductQuery.trim() || undefined);
  // Company's own catalog — the common source for pre-existing featuredProductIds,
  // since search results alone rarely include ids seeded from a prior save.
  const { data: companyProductsData } = useCompanyProducts(company._id);

  const searchResults = productSearch?.products ?? [];
  const availableResults = searchResults.filter((p) => !featured.includes(p._id));

  // Persistent id -> name map for chip labels. Merges names discovered via the
  // live product search with the company's own products, so chips don't lose
  // their resolved name when the search query changes (no products-by-ids
  // endpoint exists, so this is the best coverage available without one).
  // Updated during render (the React-docs-endorsed "adjusting state when a
  // prop changes" pattern) rather than in an effect, since each query's data
  // reference only changes when new data actually arrives.
  const [nameById, setNameById] = useState<Map<string, string>>(new Map());
  const [prevProductSearch, setPrevProductSearch] = useState(productSearch);
  if (productSearch !== prevProductSearch) {
    setPrevProductSearch(productSearch);
    if (searchResults.length > 0) {
      setNameById((prev) => {
        const next = new Map(prev);
        searchResults.forEach((p) => next.set(p._id, p.name));
        return next;
      });
    }
  }
  const [prevCompanyProducts, setPrevCompanyProducts] = useState(companyProductsData);
  if (companyProductsData !== prevCompanyProducts) {
    setPrevCompanyProducts(companyProductsData);
    const companyProducts = companyProductsData?.products ?? [];
    if (companyProducts.length > 0) {
      setNameById((prev) => {
        const next = new Map(prev);
        companyProducts.forEach((p) => next.set(p._id, p.name));
        return next;
      });
    }
  }

  function addFeatured(id: string) {
    setFeatured((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }
  function removeFeatured(id: string) {
    setFeatured((prev) => prev.filter((x) => x !== id));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    update.mutate({
      portalHero: hero,
      portalTheme: theme,
      portalPromotion: promo,
      portalAnnouncements: announcements.filter((a) => a.title?.trim() && a.message?.trim()),
      portalContentBlocks: blocks
        .filter((b) => b.body?.trim())
        .map((b, i) => ({ ...b, order: i })),
      portalAbout: { ...about, stats: stats.filter((s) => s.value?.trim() && s.label?.trim()) },
      featuredProductIds: featured,
    });
  }

  const navText = readableTextColor(theme.navbarColor);

  return (
    <section className={sectionCls}>
      <h2 className="mb-1 text-base font-semibold text-ink">Portal Branding</h2>
      <p className="mb-5 text-xs text-slate">Customize this company&apos;s employee portal landing page. Empty fields hide their section.</p>

      <form onSubmit={save} className="space-y-6">
        {/* Theme + live navbar preview */}
        <div className="space-y-2">
          <p className={labelCls}>Navbar color</p>
          <div className="flex items-center gap-3">
            <input type="color" value={theme.navbarColor || '#179b8e'} onChange={(e) => setTheme({ ...theme, navbarColor: e.target.value })} className="h-9 w-12 rounded border border-line" />
            <input type="text" value={theme.navbarColor ?? ''} placeholder="#179b8e" onChange={(e) => setTheme({ ...theme, navbarColor: e.target.value })} className={inputCls} />
          </div>
          <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ backgroundColor: theme.navbarColor || '#e8f7f4', color: navText }}>
            {company.name} — navbar preview
          </div>
        </div>

        {/* Hero */}
        <div className="space-y-3 border-t border-line/70 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Hero banner</p>
          <ImageUploadField value={hero.image ?? ''} onChange={(url) => setHero({ ...hero, image: url })} folder="logos" />
          <input className={inputCls} placeholder="Headline" value={hero.headline ?? ''} onChange={(e) => setHero({ ...hero, headline: e.target.value })} />
          <input className={inputCls} placeholder="Subtitle" value={hero.subtitle ?? ''} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder="CTA text (e.g. Shop now)" value={hero.ctaText ?? ''} onChange={(e) => setHero({ ...hero, ctaText: e.target.value })} />
            <input className={inputCls} placeholder="CTA link (e.g. /employee/products)" value={hero.ctaLink ?? ''} onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })} />
          </div>
        </div>

        {/* Announcements */}
        <div className="space-y-3 border-t border-line/70 pt-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Announcements (newest 3 shown)</p>
            <button type="button" className={subBtn} onClick={() => setAnnouncements([...announcements, { title: '', message: '', icon: '' }])}>+ Add</button>
          </div>
          {announcements.map((a, i) => (
            <div key={i} className="rounded-lg border border-dashed border-line bg-white/40 p-3 space-y-2">
              <div className="flex gap-2">
                <input className={`${inputCls} w-16`} placeholder="📢" value={a.icon ?? ''} onChange={(e) => setAnnouncements(announcements.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))} />
                <input className={inputCls} placeholder="Title" value={a.title} onChange={(e) => setAnnouncements(announcements.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                <button type="button" className="text-red-500" onClick={() => setAnnouncements(announcements.filter((_, j) => j !== i))} aria-label={`Remove announcement ${i + 1}`}>✕</button>
              </div>
              <textarea className={inputCls} rows={2} placeholder="Message" value={a.message} onChange={(e) => setAnnouncements(announcements.map((x, j) => j === i ? { ...x, message: e.target.value } : x))} />
            </div>
          ))}
        </div>

        {/* Content blocks */}
        <div className="space-y-3 border-t border-line/70 pt-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Content blocks</p>
            <button type="button" className={subBtn} onClick={() => setBlocks([...blocks, { body: '', layout: 'text-left', order: blocks.length }])}>+ Add</button>
          </div>
          {blocks.map((b, i) => (
            <div key={i} className="rounded-lg border border-dashed border-line bg-white/40 p-3 space-y-2">
              <div className="flex gap-2">
                <input className={inputCls} placeholder="Title (optional)" value={b.title ?? ''} onChange={(e) => setBlocks(blocks.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                <select className={`${inputCls} w-36`} value={b.layout ?? 'text-left'} onChange={(e) => setBlocks(blocks.map((x, j) => j === i ? { ...x, layout: e.target.value as PortalContentBlock['layout'] } : x))}>
                  <option value="text-left">Image left</option>
                  <option value="text-right">Image right</option>
                  <option value="centered">Centered</option>
                </select>
                <button type="button" className="text-red-500" onClick={() => setBlocks(blocks.filter((_, j) => j !== i))} aria-label={`Remove content block ${i + 1}`}>✕</button>
              </div>
              <textarea className={inputCls} rows={3} placeholder="Body text" value={b.body} onChange={(e) => setBlocks(blocks.map((x, j) => j === i ? { ...x, body: e.target.value } : x))} />
              <ImageUploadField value={b.image ?? ''} onChange={(url) => setBlocks(blocks.map((x, j) => j === i ? { ...x, image: url } : x))} folder="logos" />
            </div>
          ))}
        </div>

        {/* About the company */}
        <div className="space-y-3 border-t border-line/70 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">About the company</p>
          <input className={inputCls} placeholder={`Heading (default "About ${company.name}")`} value={about.heading ?? ''} onChange={(e) => setAbout({ ...about, heading: e.target.value })} />
          <textarea className={inputCls} rows={4} placeholder="Company description / profile" value={about.body ?? ''} onChange={(e) => setAbout({ ...about, body: e.target.value })} />
          <ImageUploadField value={about.image ?? ''} onChange={(url) => setAbout({ ...about, image: url })} folder="logos" />
          <input className={inputCls} placeholder="Website (e.g. https://acme.com)" value={about.website ?? ''} onChange={(e) => setAbout({ ...about, website: e.target.value })} />
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] font-medium text-slate">Key stats (e.g. 1968 / Founded)</p>
            <button type="button" className={subBtn} onClick={() => setStats([...stats, { value: '', label: '' }])}>+ Add stat</button>
          </div>
          {stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input className={`${inputCls} w-32`} placeholder="Value" value={s.value} onChange={(e) => setStats(stats.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
              <input className={inputCls} placeholder="Label" value={s.label} onChange={(e) => setStats(stats.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
              <button type="button" className="text-red-500" onClick={() => setStats(stats.filter((_, j) => j !== i))} aria-label={`Remove stat ${i + 1}`}>✕</button>
            </div>
          ))}
        </div>

        {/* Promotion */}
        <div className="space-y-3 border-t border-line/70 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Promotion banner</p>
          <ImageUploadField value={promo.image ?? ''} onChange={(url) => setPromo({ ...promo, image: url })} folder="logos" />
          <input className={inputCls} placeholder="Title" value={promo.title ?? ''} onChange={(e) => setPromo({ ...promo, title: e.target.value })} />
          <input className={inputCls} placeholder="Description" value={promo.description ?? ''} onChange={(e) => setPromo({ ...promo, description: e.target.value })} />
        </div>

        {/* Featured products */}
        <div className="space-y-3 border-t border-line/70 pt-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Featured products</p>
            <span className="text-[11px] text-muted">3–5 recommended</span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={productQuery}
              placeholder="Search products by name to add…"
              onChange={(e) => { setProductQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              className={inputCls}
            />
            {searchOpen && productQuery.trim().length > 0 && (
              <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-line bg-white shadow-lg">
                {productsFetching && <p className="px-3 py-2 text-xs text-muted">Searching…</p>}
                {!productsFetching && availableResults.length === 0 && (
                  <p className="px-3 py-2 text-xs text-muted">No matches.</p>
                )}
                {!productsFetching && availableResults.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { addFeatured(p._id); setProductQuery(''); setSearchOpen(false); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-black/5"
                  >
                    {p.images?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt="" className="h-8 w-8 shrink-0 rounded-md border border-line object-cover" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-ink">{p.name}</span>
                    <span className="shrink-0 text-xs font-medium text-indigo">+ Add</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {featured.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {featured.map((id) => {
                const label = nameById.get(id) ?? id;
                return (
                  <span key={id} className="flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-3 py-1 text-xs text-ink">
                    {label}
                    <button type="button" onClick={() => removeFeatured(id)} className="text-muted hover:text-red-600" aria-label={`Remove ${label}`}>✕</button>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-line py-4 text-center text-xs text-muted">
              No featured products selected — search above to add.
            </p>
          )}
        </div>

        {update.error && <p className="text-sm text-red-600">{update.error instanceof ApiError ? update.error.message : 'Save failed.'}</p>}
        <div className="flex items-center gap-3 border-t border-line/70 pt-4">
          <button type="submit" disabled={update.isPending} className={primaryBtn}>{update.isPending ? 'Saving…' : 'Save portal branding'}</button>
          {update.isSuccess && <span className="text-sm text-green-600">Saved.</span>}
        </div>
      </form>
    </section>
  );
}
