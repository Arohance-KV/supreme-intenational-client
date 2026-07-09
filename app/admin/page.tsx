'use client';

import { useState } from 'react';
import {
  useRevenue,
  useDashboardSummary,
  useGeneratedTimeseries,
  useRecentActivity,
} from '@/lib/admin/dashboard';
import SeriesBarChart, { MonthsFilter } from '@/components/admin/SeriesBarChart';

// ── Shared surface class (design-system glass) ──────────────────────────────────
const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';

function inr(n: unknown): string {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
}

function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? 's' : ''} ago`;
}

const ACTIVITY_ICON: Record<string, { icon: string; c: string; bg: string }> = {
  quotation: { icon: '📄', c: '#2a2b6a', bg: 'rgba(42,43,106,.1)' },
  catalogue: { icon: '🖼', c: '#127d72', bg: 'rgba(23,155,142,.12)' },
  order: { icon: '🛒', c: '#1a8f5a', bg: 'rgba(31,170,107,.12)' },
};

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
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
  );
}

const DAY_OPTS: { label: string; days: number | null }[] = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: 'All', days: null },
];

function DayRangeFilter({ days, onChange }: { days: number | null; onChange: (d: number | null) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {DAY_OPTS.map((o) => {
        const active = days === o.days;
        return (
          <button
            key={o.label}
            onClick={() => onChange(o.days)}
            className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors"
            style={
              active
                ? { color: '#fff', background: 'linear-gradient(135deg,#2a2b6a,#3a3c98)' }
                : { color: 'var(--color-slate)', background: 'rgba(255,255,255,.7)', border: '1px solid var(--color-line)' }
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ISO yyyy-mm-dd `days` ago (or a far-past date for the "All" window).
function isoDaysAgo(days: number | null): string {
  if (days == null) return '2000-01-01';
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function AdminDashboardPage() {
  const [months, setMonths] = useState(6);
  const [days, setDays] = useState<number | null>(30);

  const dateTo = new Date().toISOString().slice(0, 10);
  const dateFrom = isoDaysAgo(days);
  const rangeLabel = days == null ? 'all time' : `last ${days} days`;

  const revenue = useRevenue(dateFrom, dateTo);
  const summary = useDashboardSummary(dateFrom, dateTo);
  const series = useGeneratedTimeseries(months);
  const activity = useRecentActivity(8);

  const points = series.data ?? [];

  return (
    <main className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-slate capitalize">{rangeLabel} overview</p>
        </div>
        <DayRangeFilter days={days} onChange={setDays} />
      </div>

      {/* ── Revenue KPIs ── */}
      <Section title={`Revenue (${rangeLabel})`}>
        {revenue.isError ? (
          <ErrorBanner message="Could not load revenue data." />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <Kpi label="Total Revenue">
              {revenue.isPending ? <Skeleton className="h-8 w-28 mt-1" /> : <Value>{inr(revenue.data?.totalRevenue)}</Value>}
            </Kpi>
            <Kpi label="Orders (revenue-bearing)">
              {revenue.isPending ? <Skeleton className="h-8 w-16 mt-1" /> : (
                <Value>{typeof revenue.data?.orderCount === 'number' ? revenue.data.orderCount.toLocaleString('en-IN') : '—'}</Value>
              )}
            </Kpi>
            <Kpi label="Avg Order Value">
              {revenue.isPending ? <Skeleton className="h-8 w-24 mt-1" /> : <Value>{inr(revenue.data?.avgOrderValue)}</Value>}
            </Kpi>
          </div>
        )}
      </Section>

      {/* ── Lead & document counts (all-time) ── */}
      <Section title="Quotations, catalogues & enquiries">
        {summary.isError ? (
          <ErrorBanner message="Could not load counts." />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <Kpi label="Quotations">
              {summary.isPending ? <Skeleton className="h-8 w-20 mt-1" /> : <Value>{summary.data?.quotations.toLocaleString('en-IN')}</Value>}
            </Kpi>
            <Kpi label="Catalogues">
              {summary.isPending ? <Skeleton className="h-8 w-20 mt-1" /> : <Value>{summary.data?.catalogues.toLocaleString('en-IN')}</Value>}
            </Kpi>
            <Kpi label="Enquiries made">
              {summary.isPending ? <Skeleton className="h-8 w-16 mt-1" /> : <Value>{summary.data?.enquiries.toLocaleString('en-IN')}</Value>}
            </Kpi>
          </div>
        )}
      </Section>

      {/* ── Downloads over time + Recent activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        {/* Chart */}
        <div className={`rounded-[20px] p-6 ${GLASS}`}>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[15px] font-extrabold text-ink">Downloads over time</div>
              <div className="text-xs text-muted">Quotations &amp; catalogues generated · last {months} months</div>
            </div>
            <MonthsFilter months={months} onChange={setMonths} />
          </div>
          {series.isError ? (
            <ErrorBanner message="Could not load the chart." />
          ) : series.isPending ? (
            <Skeleton className="h-[210px] w-full" />
          ) : (
            <SeriesBarChart
              mode="stacked"
              points={points.map((p) => ({ label: p.month, a: p.quotations, b: p.catalogues }))}
              a={{ label: 'Quotations', gradient: 'linear-gradient(180deg,#4a4cae,#2a2b6a)', swatch: '#3a3c98' }}
              b={{ label: 'Catalogues', gradient: 'linear-gradient(180deg,#17b8a6,#127d72)', swatch: '#149b8e' }}
            />
          )}
        </div>

        {/* Recent activity */}
        <div className={`rounded-[20px] p-6 ${GLASS}`}>
          <div className="text-[15px] font-extrabold text-ink mb-[18px]">Recent activity</div>
          {activity.isError ? (
            <ErrorBanner message="Could not load activity." />
          ) : activity.isPending ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : !activity.data?.length ? (
            <p className="text-sm text-muted">No recent activity.</p>
          ) : (
            activity.data.map((a, i) => {
              const cfg = ACTIVITY_ICON[a.type] ?? ACTIVITY_ICON.quotation;
              return (
                <div key={i} className="flex gap-3 mb-4">
                  <span
                    className="w-[30px] h-[30px] shrink-0 rounded-[9px] flex items-center justify-center text-[13px]"
                    style={{ background: cfg.bg, color: cfg.c }}
                  >
                    {cfg.icon}
                  </span>
                  <div>
                    <div className="text-[13px] leading-snug text-ink"><strong>{a.who}</strong> {a.what}</div>
                    <div className="font-jbmono text-[11px] text-muted">{ago(a.when)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
