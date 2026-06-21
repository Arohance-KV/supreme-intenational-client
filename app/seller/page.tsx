'use client';
import Link from 'next/link';
import { useSellerMe } from '@/lib/seller/me';
import { useEarningsSummary } from '@/lib/seller/payouts';

function inr(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

const STATUS_CHIP: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-zinc-100 text-zinc-600',
};

export default function SellerDashboardPage() {
  const { data: me } = useSellerMe(true);
  const { data: summary } = useEarningsSummary();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {me ? me.businessName : <span className="text-zinc-400">Loading…</span>}
          </h1>
          {me && (
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_CHIP[me.status] ?? 'bg-zinc-100 text-zinc-600'}`}
              >
                {me.status}
              </span>
              <span>Margin: {me.marginPercent}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Earnings mini-cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500 mb-1">Outstanding</p>
          <p className="text-xl font-semibold text-amber-600">
            {summary ? inr(summary.outstanding) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500 mb-1">Settled</p>
          <p className="text-xl font-semibold text-green-600">
            {summary ? inr(summary.settled) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500 mb-1">Lifetime</p>
          <p className="text-xl font-semibold text-zinc-900">
            {summary ? inr(summary.lifetime) : '—'}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          href="/seller/submissions"
          className="rounded-xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50 transition-colors"
        >
          <p className="font-semibold text-zinc-900">Submissions</p>
          <p className="mt-1 text-xs text-zinc-500">View and manage your product submissions</p>
        </Link>
        <Link
          href="/seller/products"
          className="rounded-xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50 transition-colors"
        >
          <p className="font-semibold text-zinc-900">Products</p>
          <p className="mt-1 text-xs text-zinc-500">Manage your live catalog listings</p>
        </Link>
        <Link
          href="/seller/payouts"
          className="rounded-xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50 transition-colors"
        >
          <p className="font-semibold text-zinc-900">Payouts</p>
          <p className="mt-1 text-xs text-zinc-500">Track your earnings and payout history</p>
        </Link>
      </div>
    </main>
  );
}
