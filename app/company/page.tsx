'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/company/PageHeader';
import { Card } from '@/components/company/Card';
import { StatCard } from '@/components/company/StatCard';
import { StatusPill } from '@/components/company/StatusPill';
import { useCompanyDashboard, type Range, type DashboardSeriesPoint } from '@/lib/company/dashboard';
import { formatLakh, formatIN, initials } from '@/lib/company/format';

const RANGE_LABEL: Record<Range, string> = { week: 'week', month: 'month', all: 'all' };
const CHART_SUBTITLE: Record<Range, string> = {
  week: 'Last 7 days',
  month: 'Last 6 months',
  all: 'All time',
};

function RangeFilter({ range, onChange }: { range: Range; onChange: (r: Range) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-[#f6f7fb] p-1">
      {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`rounded-full px-3 py-1 text-[12px] font-semibold capitalize transition-colors ${
            range === r ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-slate'
          }`}
        >
          {RANGE_LABEL[r]}
        </button>
      ))}
    </div>
  );
}

function RedeemedChart({ series }: { series: DashboardSeriesPoint[] }) {
  if (series.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-[13px] text-muted">
        No redemption activity yet.
      </div>
    );
  }
  const maxPoints = Math.max(...series.map((s) => s.points), 1);
  return (
    <div className="flex h-48 items-end gap-2">
      {series.map((s) => (
        <div key={s.bucket} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <div
            className="w-full max-w-[32px] rounded-t-md bg-indigo"
            style={{ height: `${Math.max((s.points / maxPoints) * 100, 2)}%` }}
            title={`${s.bucket}: ${formatIN(s.points)} pts`}
          />
          <span className="truncate text-[10px] text-muted">{s.bucket}</span>
        </div>
      ))}
    </div>
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
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#eef0f8]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo to-accent"
                style={{ width: `${pool?.redeemedPct ?? 0}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[12px] text-muted">
              <span>{pool?.redeemedPct ?? 0}% redeemed</span>
              <span>{availablePct}% available</span>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
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
                <ul className="flex flex-col gap-4">
                  {recentOrders.map((o) => (
                    <li key={o.id} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-indigo text-[12px] font-bold text-white">
                        {initials(o.employeeName)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-ink">{o.item}</p>
                        <p className="truncate text-[12px] text-muted">
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
