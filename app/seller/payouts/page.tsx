'use client';
import { usePayouts, useEarningsSummary } from '@/lib/seller/payouts';

function inr(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

const STATUS_CHIP: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  settled: 'bg-green-100 text-green-800',
  voided: 'bg-zinc-100 text-zinc-600',
};

export default function PayoutsPage() {
  const { data: summary } = useEarningsSummary();
  const { data: payouts, isLoading } = usePayouts();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900">Payouts</h1>

      {/* Earnings summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500 mb-1">Outstanding</p>
          <p className="text-2xl font-semibold text-amber-600">
            {summary ? inr(summary.outstanding) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500 mb-1">Settled</p>
          <p className="text-2xl font-semibold text-green-600">
            {summary ? inr(summary.settled) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500 mb-1">Lifetime</p>
          <p className="text-2xl font-semibold text-zinc-900">
            {summary ? inr(summary.lifetime) : '—'}
          </p>
        </div>
      </div>

      {/* Payouts table */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-zinc-500">Loading…</p>
        ) : !payouts || payouts.items.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">No payouts yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Quotation</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Gross</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Commission</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Your Earning</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {payouts.items.map((p) => (
                <tr key={p._id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600">{p.quotationId}</td>
                  <td className="px-4 py-3 text-right text-zinc-700">{inr(p.grossAmount)}</td>
                  <td className="px-4 py-3 text-right text-zinc-500">
                    {inr(p.commissionAmount)}
                    <span className="ml-1 text-xs text-zinc-400">({p.marginPercent}%)</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900">{inr(p.earningAmount)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_CHIP[p.status] ?? 'bg-zinc-100 text-zinc-600'}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {new Date(p.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
