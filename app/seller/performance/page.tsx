'use client';
import { useSellerPerformance } from '@/lib/seller/performance';

function inr(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

const FUNNEL_TONE = ['#179b8e', '#1f9a6b', '#13483f'];

export default function SellerPerformancePage() {
  const { data, isLoading } = useSellerPerformance();
  const f = data?.funnel;
  const steps = f
    ? [
        { label: 'Viewed', value: f.viewed },
        { label: 'Added to quote', value: f.addedToQuote },
        { label: 'Won', value: f.won },
      ]
    : [];
  const max = Math.max(1, ...steps.map((s) => s.value));

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-7">
      <div className="mb-6">
        <h1 className="mb-0.5 text-[26px] font-extrabold tracking-[-.02em] text-ink">Performance</h1>
        <div className="text-[13px] text-slate">From discovery to won quotations.</div>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-[20px] bg-white/55" />
      ) : (
        <>
          {/* Funnel */}
          <div className="mb-5 rounded-[18px] border border-white/80 bg-white/[.62] p-5 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-sm font-bold text-ink">Conversion funnel</div>
              <div className="text-[13px] font-bold text-[#176054]">{f?.conversionRate ?? 0}% quote → win</div>
            </div>
            <div className="mt-4 space-y-3">
              {steps.map((s, i) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="w-28 flex-none text-[12px] text-slate">{s.label}</span>
                  <div className="h-7 flex-1 overflow-hidden rounded-md bg-black/5">
                    <div
                      className="h-full rounded-md"
                      style={{ width: `${(s.value / max) * 100}%`, minWidth: 4, background: FUNNEL_TONE[i] }}
                    />
                  </div>
                  <span className="w-14 flex-none text-right text-sm font-bold text-ink">
                    {s.value.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Top by views */}
            <div className="rounded-[18px] border border-white/80 bg-white/[.62] p-5 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]">
              <div className="mb-3 text-sm font-bold text-ink">Top products by views</div>
              <div className="divide-y divide-line">
                {(data?.topByViews ?? []).map((p) => (
                  <div key={p.productId} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0 truncate text-sm text-ink">{p.name}</span>
                    <span className="flex-none text-[12px] font-semibold text-slate">
                      {p.views.toLocaleString('en-IN')} views
                    </span>
                  </div>
                ))}
                {data && data.topByViews.length === 0 && <p className="py-2 text-xs text-muted">No views yet.</p>}
              </div>
            </div>

            {/* Top by revenue */}
            <div className="rounded-[18px] border border-white/80 bg-white/[.62] p-5 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]">
              <div className="mb-3 text-sm font-bold text-ink">Top products by revenue</div>
              <div className="divide-y divide-line">
                {(data?.topByRevenue ?? []).map((p) => (
                  <div key={p.productId} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0 truncate text-sm text-ink">{p.productName}</span>
                    <span className="flex-none text-[12px] font-semibold text-slate">{inr(p.revenue)}</span>
                  </div>
                ))}
                {data && data.topByRevenue.length === 0 && <p className="py-2 text-xs text-muted">No sales yet.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
