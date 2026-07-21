'use client';

import { useEffect, useState } from 'react';
import DcPhoto from '@/components/DcPhoto';
import type { CaseStudy } from '@/lib/content';

// Success-stories grid with an industry filter. Data comes from the admin
// Case Studies CMS (passed in from the server component). Clicking a card opens
// a read-only detail modal built from the same fields.
export default function ClientCaseStudies({ items }: { items: CaseStudy[] }) {
  const industries = ['All', ...Array.from(new Set(items.map((c) => c.industry).filter(Boolean)))];
  const [active, setActive] = useState('All');
  const [open, setOpen] = useState<CaseStudy | null>(null);
  const list = active === 'All' ? items : items.filter((c) => c.industry === active);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {industries.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {industries.map((n) => {
            const on = active === n;
            return (
              <button
                key={n}
                onClick={() => setActive(n)}
                className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-semibold ${on ? 'bg-indigo text-white' : 'border border-line bg-white/70 text-slate'}`}
              >
                {n}
              </button>
            );
          })}
        </div>
      )}

      <section className="pb-5">
        <h2 className="mb-5 text-[24px] font-extrabold tracking-[-.02em] sm:text-[30px]">Success stories</h2>
        {list.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-line bg-white/55 p-10 text-center text-sm text-muted">No case studies published yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => setOpen(c)}
                className="cursor-pointer overflow-hidden rounded-[18px] border border-white/80 bg-white/55 text-left shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[14px] transition-shadow hover:shadow-[0_16px_40px_rgba(34,36,90,.14)]"
              >
                {c.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.coverImage} alt={c.title} className="aspect-video w-full object-cover" />
                ) : (
                  <DcPhoto seed={c._id} className="aspect-video" />
                )}
                <div className="p-[18px]">
                  {c.industry && <div className="font-jbmono mb-[7px] text-[10px] uppercase tracking-[.06em] text-accent">{c.industry}</div>}
                  <div className="mb-1.5 text-[15px] font-bold leading-[1.3]">{c.title}</div>
                  {c.result && <div className="mb-1 text-[13px] font-semibold text-indigo">{c.result}</div>}
                  <div className="line-clamp-3 text-[13px] leading-[1.5] text-slate">{c.summary}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={open.title}
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[22px] border border-white/80 bg-white shadow-[0_40px_100px_rgba(22,23,58,.35)]"
          >
            {open.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={open.coverImage} alt={open.title} className="aspect-video w-full object-cover" />
            ) : (
              <DcPhoto seed={open._id} className="aspect-video" />
            )}
            <div className="p-6 sm:p-7">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  {open.industry && <div className="font-jbmono mb-1.5 text-[10px] uppercase tracking-[.06em] text-accent">{open.industry}</div>}
                  <h3 className="text-[22px] font-extrabold tracking-[-.02em] text-ink">{open.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Close"
                  className="flex-none rounded-lg p-1.5 text-muted hover:bg-black/5 hover:text-slate"
                >
                  ✕
                </button>
              </div>
              {open.result && <div className="mb-3 text-[15px] font-semibold text-indigo">{open.result}</div>}
              {open.summary && <p className="whitespace-pre-line text-[14px] leading-[1.6] text-slate">{open.summary}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
