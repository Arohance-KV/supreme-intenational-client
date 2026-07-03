'use client';
import Link from 'next/link';
import { useSellerMe } from '@/lib/seller/me';
import { useEarningsSummary } from '@/lib/seller/payouts';

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

export default function SellerDashboardPage() {
  const { data: me } = useSellerMe(true);
  const { data: summary } = useEarningsSummary();

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

      {/* Earnings KPIs */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="Outstanding" value={summary ? inr(summary.outstanding) : '—'} sub="awaiting payout" tone="text-[#b5801e]" />
        <Kpi label="Settled" value={summary ? inr(summary.settled) : '—'} sub="paid out to you" tone="text-[#1a8f5a]" />
        <Kpi label="Lifetime earnings" value={summary ? inr(summary.lifetime) : '—'} sub="since you joined" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/seller/submissions"
          className="rounded-[18px] border border-white/80 bg-white/[.55] p-5 no-underline shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px] transition-shadow hover:shadow-[0_14px_40px_rgba(34,36,90,.14)]"
        >
          <div className="mb-2 text-[22px]">◷</div>
          <p className="font-bold text-ink">Approval status</p>
          <p className="mt-1 text-xs text-slate">View and manage your product submissions.</p>
        </Link>
        <Link
          href="/seller/products"
          className="rounded-[18px] border border-white/80 bg-white/[.55] p-5 no-underline shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px] transition-shadow hover:shadow-[0_14px_40px_rgba(34,36,90,.14)]"
        >
          <div className="mb-2 text-[22px]">▤</div>
          <p className="font-bold text-ink">My products</p>
          <p className="mt-1 text-xs text-slate">Manage your live catalogue listings.</p>
        </Link>
        <Link
          href="/seller/payouts"
          className="rounded-[18px] border border-white/80 bg-white/[.55] p-5 no-underline shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px] transition-shadow hover:shadow-[0_14px_40px_rgba(34,36,90,.14)]"
        >
          <div className="mb-2 text-[22px]">₹</div>
          <p className="font-bold text-ink">Payouts</p>
          <p className="mt-1 text-xs text-slate">Track your earnings and payout history.</p>
        </Link>
      </div>
    </div>
  );
}
