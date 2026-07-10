'use client';

import { useState } from 'react';
import DcPhoto from '@/components/DcPhoto';
import type { CaseStudy } from '@/lib/content';

// Success-stories grid with an industry filter. Data comes from the admin
// Case Studies CMS (passed in from the server component).
export default function ClientCaseStudies({ items }: { items: CaseStudy[] }) {
  const industries = ['All', ...Array.from(new Set(items.map((c) => c.industry).filter(Boolean)))];
  const [active, setActive] = useState('All');
  const list = active === 'All' ? items : items.filter((c) => c.industry === active);

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
        <h2 className="mb-5 text-[30px] font-extrabold tracking-[-.02em]">Success stories</h2>
        {list.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-line bg-white/55 p-10 text-center text-sm text-muted">No case studies published yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <div key={c._id} className="overflow-hidden rounded-[18px] border border-white/80 bg-white/55 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[14px]">
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
                  <div className="text-[13px] leading-[1.5] text-slate">{c.summary}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
