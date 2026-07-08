'use client';

import {
  useRevenue,
  useDashboardSummary,
  useGeneratedTimeseries,
  useRecentActivity,
} from '@/lib/admin/dashboard';

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

export default function AdminDashboardPage() {
  const revenue = useRevenue();
  const summary = useDashboardSummary();
  const series = useGeneratedTimeseries(10);
  const activity = useRecentActivity(8);

  const points = series.data ?? [];
  const maxTotal = Math.max(1, ...points.map(p => p.quotations + p.catalogues));

  return (
    <main className="max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-slate">Last 30 days overview</p>
      </div>

      {/* ── Revenue KPIs (last 30 days) ── */}
      <Section title="Revenue (last 30 days)">
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
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[15px] font-extrabold text-ink">Downloads over time</div>
              <div className="text-xs text-muted">Quotations &amp; catalogues generated per month</div>
            </div>
            <div className="flex gap-3.5 text-[11px] text-slate">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-indigo inline-block" />Quotations</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-accent inline-block" />Catalogues</span>
            </div>
          </div>
          {series.isError ? (
            <ErrorBanner message="Could not load the chart." />
          ) : series.isPending ? (
            <Skeleton className="h-[180px] w-full" />
          ) : (
            <div className="flex items-end gap-2.5 h-[180px]">
              {points.map((p, i) => {
                const total = p.quotations + p.catalogues;
                const hPct = (total / maxTotal) * 100;
                const qFrac = total ? p.quotations / total : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full" title={`${p.month}: ${p.quotations} quotations, ${p.catalogues} catalogues`}>
                    <div style={{ height: `${hPct}%` }} className="flex flex-col overflow-hidden rounded-t-md">
                      <div style={{ flexGrow: qFrac }} className="bg-gradient-to-b from-indigo2 to-indigo" />
                      <div style={{ flexGrow: 1 - qFrac }} className="bg-gradient-to-b from-accent2 to-accent" />
                    </div>
                    <div className="mt-1.5 text-center font-jbmono text-[9px] text-muted">{p.month}</div>
                  </div>
                );
              })}
            </div>
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
