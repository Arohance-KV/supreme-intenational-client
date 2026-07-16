'use client';
import Link from 'next/link';
import { useSellerMe } from '@/lib/seller/me';
import { useEarningsSummary } from '@/lib/seller/payouts';
import { useSellerDashboard } from '@/lib/seller/dashboard';

function inr(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

const STATUS_CHIP: Record<string, string> = {
  pending: 'text-[#b5801e] bg-[rgba(224,163,59,.16)]',
  active: 'text-[#1a8f5a] bg-[rgba(31,170,107,.12)]',
  rejected: 'text-[#d8524d] bg-[rgba(224,82,77,.12)]',
  suspended: 'text-slate bg-[rgba(91,93,122,.12)]',
};

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: string }) {
  return (
    <div className="rounded-[18px] border border-white/80 bg-white/[.62] p-5 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]">
      <div className="font-jbmono mb-3 text-[10px] uppercase tracking-[.08em] text-muted">{label}</div>
      <div className={`text-[30px] font-extrabold tracking-[-.02em] ${tone ?? 'text-ink'}`}>{value}</div>
      <div className="mt-1.5 text-[11px] text-muted">{sub}</div>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  submitted: 'In review',
  approved: 'Approved',
  rejected: 'Rejected',
  draft: 'Draft',
};

export default function SellerDashboardPage() {
  const { data: me } = useSellerMe(true);
  const { data: summary } = useEarningsSummary();
  const { data: dash } = useSellerDashboard();
  const maxViews = Math.max(1, ...(dash?.viewsThisWeek ?? []).map((d) => d.count));

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-7">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-5">
        <div>
          <h1 className="mb-0.5 text-[26px] font-extrabold tracking-[-.02em] text-ink">
            {me ? `Welcome back, ${me.businessName}` : 'Welcome back'}
          </h1>
          <div className="text-[13px] text-slate">Here&apos;s how your catalogue is performing on Supreme.</div>
        </div>
        <Link
          href="/seller/submissions/new"
          className="flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#176054,#179b8e)] px-[18px] py-3 text-sm font-bold text-white no-underline shadow-[0_10px_24px_rgba(23,155,142,.3)]"
        >
          ＋ Add Product
        </Link>
      </div>

      {/* Account status */}
      {me && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[18px] border border-white/80 bg-white/[.62] px-5 py-3.5 backdrop-blur-[16px]">
          <span className="text-sm font-bold text-ink">Account status</span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${STATUS_CHIP[me.status] ?? STATUS_CHIP.suspended}`}>
            {me.status}
          </span>
          <span className="text-[13px] text-slate">Platform margin: {me.marginPercent}%</span>
        </div>
      )}

      {/* Performance KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Live products" value={dash ? String(dash.liveProducts) : '—'} sub={dash ? `${dash.inReview} in review` : ''} />
        <Kpi label="In quotations" value={dash ? String(dash.inQuotations) : '—'} sub="times added to quotes" />
        <Kpi label="Catalogue views" value={dash ? dash.catalogueViews.toLocaleString('en-IN') : '—'} sub="this month" />
        <Kpi label="Est. payout" value={dash ? inr(dash.outstanding) : (summary ? inr(summary.outstanding) : '—')} sub="after platform margin" tone="text-[#b5801e]" />
      </div>

      {/* Earnings (settled / lifetime) */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi label="Settled" value={summary ? inr(summary.settled) : '—'} sub="paid out to you" tone="text-[#1a8f5a]" />
        <Kpi label="Lifetime earnings" value={summary ? inr(summary.lifetime) : '—'} sub="since you joined" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Views this week */}
        <div className="rounded-[18px] border border-white/80 bg-white/[.62] p-5 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]">
          <div className="mb-1 text-sm font-bold text-ink">Views this week</div>
          <div className="mb-4 text-[11px] text-muted">Product page impressions</div>
          {/* Bars must be DIRECT children of the fixed-height row: a percentage height
              resolves against the parent's height, and `items-end` leaves a wrapper at
              auto height — which silently collapses every bar to minHeight. Labels sit
              in a sibling row with the same flex-1 + gap so they stay aligned. */}
          <div className="flex h-40 items-end gap-3">
            {(dash?.viewsThisWeek ?? []).map((d) => (
              <div
                key={d.date}
                className="flex-1 rounded-t bg-[linear-gradient(180deg,#179b8e,#13483f)]"
                style={{ height: `${(d.count / maxViews) * 100}%`, minHeight: 2 }}
                title={`${d.count} views`}
              />
            ))}
          </div>
          <div className="mt-2 flex gap-3">
            {(dash?.viewsThisWeek ?? []).map((d) => (
              <span key={d.date} className="flex-1 text-center text-[10px] text-muted">
                {new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })[0]}
              </span>
            ))}
          </div>
        </div>

        {/* Recent approval activity */}
        <div className="rounded-[18px] border border-white/80 bg-white/[.62] p-5 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]">
          <div className="mb-3 text-sm font-bold text-ink">Recent approval activity</div>
          <div className="divide-y divide-line">
            {(dash?.recentActivity ?? []).map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0 truncate text-sm text-ink">{a.name}</span>
                <span className="flex-none text-[11px] text-slate">{STATUS_LABEL[a.status] ?? a.status}</span>
              </div>
            ))}
            {dash && dash.recentActivity.length === 0 && (
              <p className="py-2 text-xs text-muted">No submissions yet.</p>
            )}
          </div>
          <Link href="/seller/submissions" className="mt-3 inline-block text-xs font-semibold text-[#176054] no-underline hover:underline">
            View all submissions →
          </Link>
        </div>
      </div>
    </div>
  );
}
