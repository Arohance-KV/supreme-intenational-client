'use client';

import { useRef, useState } from 'react';
import { PageHeader } from '@/components/company/PageHeader';
import { Card } from '@/components/company/Card';
import { StatCard } from '@/components/company/StatCard';
import { StatusPill } from '@/components/company/StatusPill';
import { useCompanyDashboard, type Range, type DashboardSeriesPoint } from '@/lib/company/dashboard';
import { useCompanyProfile, useUploadCompanyLogo } from '@/lib/company/profile';
import { formatLakh, formatIN, initials } from '@/lib/company/format';
import { ApiError } from '@/lib/api';

const RANGE_LABEL: Record<Range, string> = { week: 'week', month: 'month', all: 'all' };
const CHART_SUBTITLE: Record<Range, string> = {
  week: 'Last 7 days',
  month: 'Last 6 months',
  all: 'All time',
};

function RangeFilter({ range, onChange }: { range: Range; onChange: (r: Range) => void }) {
  return (
    <div className="flex items-center gap-2">
      {(Object.keys(RANGE_LABEL) as Range[]).map((r) => {
        const active = range === r;
        return (
          <button
            key={r}
            onClick={() => onChange(r)}
            className="rounded-full px-[14px] py-2 text-[12px] font-semibold capitalize transition-colors"
            style={
              active
                ? {
                    color: '#fff',
                    background: 'linear-gradient(135deg,#2a2b6a,#3a3c98)',
                    border: '1px solid transparent',
                  }
                : {
                    color: 'var(--color-slate)',
                    background: 'rgba(255,255,255,.7)',
                    border: '1px solid var(--color-line)',
                  }
            }
          >
            {RANGE_LABEL[r]}
          </button>
        );
      })}
    </div>
  );
}

// Round a max up to a "nice" ceiling so gridline ticks read cleanly (7 → 10, 6128 → 7000).
function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * pow;
}

// Compact point value for axes/bar labels: 21497 → "21k", 6128 → "6.1k", 199 → "199".
function compact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `${Math.round(n)}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-02" → "Feb", "2026-07-07" → "Jul 7". Falls back to the raw bucket.
function fmtBucket(bucket: string): string {
  const p = bucket.split('-');
  const m = Number(p[1]);
  if (!m || m < 1 || m > 12) return bucket;
  return p.length >= 3 ? `${MONTHS[m - 1]} ${Number(p[2])}` : MONTHS[m - 1];
}

function RedeemedChart({ series }: { series: DashboardSeriesPoint[] }) {
  if (series.length === 0) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center gap-1 text-center">
        <span className="text-[26px]">📊</span>
        <p className="text-[13px] font-medium text-slate">No redemption activity yet</p>
        <p className="text-[11px] text-muted">Points redeemed by your team will appear here.</p>
      </div>
    );
  }

  const total = series.reduce((s, p) => s + p.points, 0);
  const peak = Math.max(...series.map((s) => s.points));
  // Ceiling with ≥20% headroom so the tallest bar's value label never overflows the plot.
  const top = niceCeil(peak / 0.8);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * top); // baseline → peak

  return (
    <div>
      {/* summary strip — gives the chart a headline instead of bare bars */}
      <div className="mb-4 flex items-end gap-6">
        <div>
          <p className="text-[22px] font-extrabold leading-none text-ink">{formatIN(total)}</p>
          <p className="mt-1 text-[11px] text-muted">points redeemed this period</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: 'linear-gradient(180deg,#3a3c98,#2a2b6a)' }} />
          Points redeemed
        </div>
      </div>

      {/* plot: y-axis ticks + recessive gridlines behind baseline-anchored bars */}
      <div className="relative h-[210px] pl-9">
        {ticks.map((t) => (
          <div
            key={t}
            className="absolute left-9 right-0"
            style={{ bottom: `${(t / top) * 100}%`, transform: 'translateY(50%)' }}
          >
            <span
              className="absolute -left-9 -translate-y-1/2 text-[10px] text-muted"
              style={{ fontFamily: 'var(--font-jbmono)' }}
            >
              {compact(t)}
            </span>
            <div
              className="w-full"
              style={{ borderTop: t === 0 ? '1px solid var(--color-line)' : '1px dashed rgba(42,43,106,.10)' }}
            />
          </div>
        ))}

        {/* bars */}
        <div className="absolute inset-0 left-9 flex items-end justify-around gap-3">
          {series.map((s) => {
            const h = (s.points / top) * 100;
            return (
              <div key={s.bucket} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                {/* hover tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-center opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
                  style={{ background: '#1c1d44' }}>
                  <span className="block text-[12px] font-bold text-white">{formatIN(s.points)} pts</span>
                  <span className="block text-[10px] text-white/60" style={{ fontFamily: 'var(--font-jbmono)' }}>{fmtBucket(s.bucket)}</span>
                </div>
                {/* value label above the bar */}
                <span className="mb-1.5 text-[11px] font-bold text-ink opacity-80 transition-opacity group-hover:opacity-100">
                  {compact(s.points)}
                </span>
                {/* bar */}
                <div
                  className="w-full max-w-[46px] cursor-pointer shadow-[0_4px_14px_rgba(42,43,106,.18)] transition-all duration-150 group-hover:brightness-110 group-hover:shadow-[0_8px_22px_rgba(42,43,106,.30)]"
                  style={{
                    height: `${Math.max(h, 1.5)}%`,
                    background: 'linear-gradient(180deg,#4a4cae,#2a2b6a)',
                    borderRadius: '8px 8px 2px 2px',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* x-axis labels, aligned under the bars */}
      <div className="mt-2 flex justify-around gap-3 pl-9">
        {series.map((s) => (
          <span key={s.bucket} className="flex-1 truncate text-center text-[11px] font-medium text-slate">
            {fmtBucket(s.bucket)}
          </span>
        ))}
      </div>
    </div>
  );
}

function BrandLogoCard() {
  const { data: profile } = useCompanyProfile();
  const uploadLogo = useUploadCompanyLogo();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogo.mutate(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Card className="mb-6 p-6">
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex h-16 w-40 flex-none items-center justify-center overflow-hidden rounded-[12px] border border-line bg-white">
          {profile?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.logo} alt={profile.name || 'Company logo'} className="max-h-14 w-auto max-w-[152px] object-contain" />
          ) : (
            <span className="text-[12px] text-muted">No logo yet</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-bold text-ink">Brand logo</h2>
          <p className="mt-0.5 text-[12.5px] text-muted">
            Shown in your employees&rsquo; store header. PNG or SVG with transparent background works best.
          </p>
          {uploadLogo.isError && (
            <p className="mt-1 text-[12px] text-[#d8524d]">
              {uploadLogo.error instanceof ApiError ? uploadLogo.error.message : 'Upload failed.'}
            </p>
          )}
        </div>
        <div className="flex-none">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" id="company-logo-input" />
          <label
            htmlFor="company-logo-input"
            className={`inline-flex cursor-pointer items-center rounded-xl px-4 py-[11px] text-[13.5px] font-bold text-white transition-opacity hover:opacity-90 ${uploadLogo.isPending ? 'pointer-events-none opacity-60' : ''}`}
            style={{ background: 'linear-gradient(135deg,#2a2b6a,#3a3c98)' }}
          >
            {uploadLogo.isPending ? 'Uploading…' : profile?.logo ? 'Replace logo' : 'Upload logo'}
          </label>
        </div>
      </div>
    </Card>
  );
}

export default function CompanyOverviewPage() {
  const [range, setRange] = useState<Range>('month');
  const { data, isLoading, isError } = useCompanyDashboard(range);

  const stats = data?.stats;
  const pool = data?.pool;
  const series = data?.redeemedSeries ?? [];
  const recentOrders = data?.recentOrders ?? [];
  const availablePct = pool ? 100 - pool.redeemedPct : 0;

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-7">
      <PageHeader
        title="Overview"
        subtitle="Your team's merchandise activity at a glance."
      />

      <BrandLogoCard />

      {isError && (
        <Card className="mb-6 p-6 text-[13px] text-muted">Could not load dashboard data.</Card>
      )}

      {isLoading && !data && (
        <Card className="mb-6 p-6 text-[13px] text-muted">Loading…</Card>
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Points Allocated"
              value={formatLakh(stats?.pointsAllocated)}
              sub="across your team"
            />
            <StatCard
              label="Points Used"
              value={formatLakh(stats?.pointsUsed)}
              sub={`${pool?.redeemedPct ?? 0}% of pool`}
              tone="text-accent"
            />
            <StatCard
              label="Orders Placed"
              value={formatIN(stats?.ordersPlaced)}
              sub="all time"
            />
            <StatCard
              label="Points Remaining"
              value={formatLakh(stats?.pointsRemaining)}
              sub={`${availablePct}% of pool`}
            />
          </div>

          <Card className="mb-6 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-ink">Company points pool</h2>
              <span className="text-[13px] font-semibold text-ink">
                {formatIN(pool?.used)} / {formatIN(pool?.total)}
              </span>
            </div>
            <div
              className="w-full overflow-hidden rounded-full"
              style={{ height: 14, background: 'rgba(42,43,106,.08)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pool?.redeemedPct ?? 0}%`,
                  background: 'linear-gradient(90deg,#2a2b6a,#149b8e)',
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[12px] text-muted">
              <span>{pool?.redeemedPct ?? 0}% redeemed</span>
              <span>{availablePct}% available</span>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
            <Card className="p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-bold text-ink">Points redeemed</h2>
                  <p className="text-[12px] text-muted">{CHART_SUBTITLE[range]}</p>
                </div>
                <RangeFilter range={range} onChange={setRange} />
              </div>
              <RedeemedChart series={series} />
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-[15px] font-bold text-ink">Recent orders</h2>
              {recentOrders.length === 0 ? (
                <p className="text-[13px] text-muted">No orders yet.</p>
              ) : (
                <ul className="flex flex-col">
                  {recentOrders.map((o, i) => (
                    <li
                      key={o.id}
                      className="flex items-center gap-3 py-3"
                      style={
                        i < recentOrders.length - 1
                          ? { borderBottom: '1px solid var(--color-line)' }
                          : undefined
                      }
                    >
                      <span
                        className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[12px] font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#3a3c98,#149b8e)' }}
                      >
                        {initials(o.employeeName)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-bold text-ink">{o.item}</p>
                        <p className="truncate text-[11px] text-muted">
                          {o.employeeName} · {formatIN(o.points)} pts
                        </p>
                      </div>
                      <StatusPill status={o.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
