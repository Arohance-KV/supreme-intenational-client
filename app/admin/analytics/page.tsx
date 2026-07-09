'use client';

import { useState } from 'react';
import {
  useEnquiriesSummary,
  useEnquiriesVsQuotations,
  useTopProducts,
  useSellerPerformance,
} from '@/lib/admin/dashboard';
import SeriesBarChart, { MonthsFilter } from '@/components/admin/SeriesBarChart';

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
  const [months, setMonths] = useState(6);
  const summary = useEnquiriesSummary();
  const series = useEnquiriesVsQuotations(months);
  const top = useTopProducts(10);
  const sellers = useSellerPerformance(10);

  const points = series.data ?? [];

  return (
    <main className="space-y-10">
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
          <div className="mb-[18px] flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[15px] font-extrabold text-ink">Enquiries vs Quotations sent</div>
              <div className="text-xs text-muted">Last {months} months</div>
            </div>
            <MonthsFilter months={months} onChange={setMonths} />
          </div>
          {series.isError ? (
            <ErrorBanner message="Could not load the chart." />
          ) : series.isPending ? (
            <Skeleton className="h-[210px] w-full" />
          ) : (
            <SeriesBarChart
              mode="grouped"
              points={points.map((p) => ({ label: p.month, a: p.enquiries, b: p.quotations }))}
              a={{ label: 'Enquiries', gradient: 'linear-gradient(180deg,#4a4cae,#2a2b6a)', swatch: '#3a3c98' }}
              b={{ label: 'Quotations sent', gradient: 'linear-gradient(180deg,#17b8a6,#127d72)', swatch: '#149b8e' }}
            />
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
