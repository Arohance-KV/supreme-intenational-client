'use client';

import {
  useEnquiriesSummary,
  useEnquiriesVsQuotations,
  useTopProducts,
  useSellerPerformance,
} from '@/lib/admin/dashboard';

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';

function inr(n: unknown): string {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-black/5 ${className}`} />;
}

function Kpi({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-[18px] p-5 ${GLASS}`}>
      <p className="font-jbmono text-[10px] uppercase tracking-[.08em] text-muted mb-3">{label}</p>
      {children}
    </div>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return <p className="text-3xl font-extrabold tracking-tight text-ink">{children}</p>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-jbmono text-[11px] font-semibold uppercase tracking-[.14em] text-accent">{title}</h2>
      {children}
    </section>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>;
}

export default function AdminAnalyticsPage() {
  const summary = useEnquiriesSummary();
  const series = useEnquiriesVsQuotations(6);
  const top = useTopProducts(10);
  const sellers = useSellerPerformance(10);

  const points = series.data ?? [];
  const maxEnq = Math.max(1, ...points.map(p => Math.max(p.enquiries, p.quotations)));

  return (
    <main className="max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-slate">Sales, enquiries and seller performance at a glance.</p>
      </div>

      {/* ── Headline KPIs ── */}
      <Section title="Overview">
        {summary.isError ? (
          <ErrorBanner message="Could not load analytics." />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <Kpi label="Total enquiries">
              {summary.isPending ? <Skeleton className="h-8 w-20 mt-1" /> : <Value>{summary.data?.totalEnquiries.toLocaleString('en-IN')}</Value>}
            </Kpi>
            <Kpi label="Conversion rate">
              {summary.isPending ? <Skeleton className="h-8 w-16 mt-1" /> : <Value>{Math.round((summary.data?.conversionRate ?? 0) * 100)}%</Value>}
            </Kpi>
            <Kpi label="Avg quotation">
              {summary.isPending ? <Skeleton className="h-8 w-24 mt-1" /> : <Value>{inr(summary.data?.avgQuotationValue)}</Value>}
            </Kpi>
          </div>
        )}
      </Section>

      {/* ── Enquiries vs Quotations + Top products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4">
        {/* Chart */}
        <div className={`rounded-[20px] p-6 ${GLASS}`}>
          <div className="text-[15px] font-extrabold text-ink mb-1">Enquiries vs Quotations sent</div>
          <div className="text-xs text-muted mb-[18px]">Last 6 months</div>
          {series.isError ? (
            <ErrorBanner message="Could not load the chart." />
          ) : series.isPending ? (
            <Skeleton className="h-[160px] w-full" />
          ) : (
            <>
              <div className="flex items-end gap-4 h-[160px]">
                {points.map((p, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full flex items-end gap-[3px] h-full" title={`${p.month}: ${p.enquiries} enquiries, ${p.quotations} quotations`}>
                      <div className="w-[48%] rounded-t-[5px] bg-gradient-to-b from-indigo2 to-indigo" style={{ height: `${Math.round((p.enquiries / maxEnq) * 100)}%` }} />
                      <div className="w-[48%] rounded-t-[5px] bg-gradient-to-b from-accent2 to-accent" style={{ height: `${Math.round((p.quotations / maxEnq) * 100)}%` }} />
                    </div>
                    <span className="font-jbmono text-[10px] text-muted">{p.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-3.5 text-[11.5px] text-slate">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-indigo inline-block" />Enquiries</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-accent inline-block" />Quotations sent</span>
              </div>
            </>
          )}
        </div>

        {/* Top products */}
        <div className={`rounded-[20px] p-6 ${GLASS}`}>
          <div className="text-[15px] font-extrabold text-ink mb-3.5">Top products</div>
          <div className="grid grid-cols-[1.8fr_.6fr_.9fr] gap-3 px-1 pb-3 border-b border-line font-jbmono text-[10px] uppercase tracking-[.05em] text-muted">
            <span>Product</span><span>Orders</span><span className="text-right">Revenue</span>
          </div>
          {top.isError ? (
            <div className="pt-3"><ErrorBanner message="Could not load top products." /></div>
          ) : top.isPending ? (
            <div className="space-y-2 pt-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
          ) : !top.data?.length ? (
            <p className="pt-3 text-sm text-muted">No sales data yet.</p>
          ) : (
            top.data.slice(0, 5).map((p, i) => (
              <div key={p._id ?? i} className="grid grid-cols-[1.8fr_.6fr_.9fr] gap-3 items-center px-1 py-3 border-b border-line text-[13px]">
                <span className="font-medium text-ink truncate">{p.productName ?? '—'}</span>
                <span className="text-slate">{typeof p.totalQtySold === 'number' ? p.totalQtySold.toLocaleString('en-IN') : '—'}</span>
                <span className="text-right font-bold text-ink">{inr(p.totalRevenue)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Seller performance ── */}
      <Section title="Seller performance">
        <div className={`rounded-[20px] p-6 ${GLASS}`}>
          <div className="grid grid-cols-[1.6fr_.6fr_.9fr_.9fr] gap-3 px-1 pb-3 border-b border-line font-jbmono text-[10px] uppercase tracking-[.05em] text-muted">
            <span>Seller</span><span>Deals</span><span className="text-right">Gross</span><span className="text-right">Earnings</span>
          </div>
          {sellers.isError ? (
            <div className="pt-3"><ErrorBanner message="Could not load seller performance." /></div>
          ) : sellers.isPending ? (
            <div className="space-y-2 pt-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
          ) : !sellers.data?.length ? (
            <p className="pt-3 text-sm text-muted">No seller payouts accrued yet.</p>
          ) : (
            sellers.data.map((s) => (
              <div key={s.sellerId} className="grid grid-cols-[1.6fr_.6fr_.9fr_.9fr] gap-3 items-center px-1 py-3 border-b border-line text-[13px]">
                <span className="font-bold text-ink truncate">{s.name}</span>
                <span className="text-slate">{s.deals}</span>
                <span className="text-right font-bold text-ink">{inr(s.gross)}</span>
                <span className="text-right font-bold text-accent">{inr(s.earnings)}</span>
              </div>
            ))
          )}
        </div>
      </Section>
    </main>
  );
}
