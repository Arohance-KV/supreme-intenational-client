'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { usePendingProposals, useDecideProposal, type AdminPointsProposal } from '@/lib/admin/pointsProposals';
import { useCompany } from '@/lib/admin/companies';
import { fmtDateTime } from '@/lib/admin/format';
import { useConfirm } from '@/components/ConfirmDialog';

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';

function CompanyName({ companyId }: { companyId: string }) {
  const { data, isLoading } = useCompany(companyId);
  if (isLoading) return <span className="text-muted">…</span>;
  return <span>{data?.name ?? companyId}</span>;
}

export default function PointsProposalsPage() {
  const { data, isPending, isError } = usePendingProposals();
  const decide = useDecideProposal();
  const { confirm } = useConfirm();

  // Editable approve-amount per row, keyed by proposal id; defaults to requestedAmount until touched.
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [rowError, setRowError] = useState<string | null>(null);

  const proposals = data ?? [];

  const amountFor = (p: AdminPointsProposal) => amounts[p._id] ?? p.requestedAmount;

  const onError = (e: unknown) => setRowError(e instanceof ApiError ? e.message : 'Action failed.');

  const approve = (p: AdminPointsProposal) => {
    const approvedAmount = amountFor(p);
    if (!(approvedAmount > 0) || approvedAmount > p.requestedAmount) {
      setRowError(`Approved amount must be between 1 and the requested ${p.requestedAmount}.`);
      return;
    }
    setRowError(null);
    decide.mutate({ id: p._id, approve: true, approvedAmount }, { onError });
  };

  const reject = async (p: AdminPointsProposal) => {
    const ok = await confirm({
      title: 'Reject request',
      message: `Reject the request for ${p.requestedAmount.toLocaleString('en-IN')} points? The company's pool is left unchanged.`,
      confirmLabel: 'Reject',
      tone: 'danger',
    });
    if (!ok) return;
    setRowError(null);
    decide.mutate({ id: p._id, approve: false }, { onError });
  };

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Points Requests</h1>
        <p className="mt-1 text-sm text-slate">
          Review pending company requests to top up their points pool. Approving funds the pool for the amount you set (up to what was requested); rejecting leaves it untouched.
        </p>
      </div>

      {rowError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{rowError}</span>
          <button onClick={() => setRowError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load points requests. (Only a Super Admin can view this page.)
        </div>
      ) : isPending ? (
        <div className={`rounded-2xl p-4 ${GLASS}`}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-lg animate-pulse bg-black/[.04] mb-2" />)}
        </div>
      ) : !proposals.length ? (
        <div className={`rounded-2xl p-10 text-center ${GLASS}`}><p className="text-sm text-muted">No pending requests.</p></div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${GLASS}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate">
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3 text-right">Requested</th>
                <th className="px-5 py-3">Note</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Approve amount</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p._id} className="border-b border-line/60 last:border-0">
                  <td className="px-5 py-3 font-semibold text-ink"><CompanyName companyId={p.companyId} /></td>
                  <td className="px-5 py-3 text-right text-slate">{p.requestedAmount.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3 text-slate max-w-[220px] truncate" title={p.note}>{p.note || '—'}</td>
                  <td className="px-5 py-3 text-muted">{fmtDateTime(p.createdAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <input
                      type="number"
                      min={1}
                      max={p.requestedAmount}
                      value={amountFor(p)}
                      disabled={decide.isPending}
                      onChange={(e) => setAmounts((prev) => ({ ...prev, [p._id]: Number(e.target.value) }))}
                      className="w-24 rounded-lg border border-line bg-white/80 px-2.5 py-1.5 text-right text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-3 text-xs">
                      <button
                        onClick={() => approve(p)}
                        disabled={decide.isPending}
                        className="rounded-lg bg-[rgba(31,170,107,.12)] px-3 py-1.5 font-semibold text-[#1a8f5a] hover:bg-[rgba(31,170,107,.2)] disabled:opacity-40"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reject(p)}
                        disabled={decide.isPending}
                        className="rounded-lg bg-[rgba(216,82,77,.1)] px-3 py-1.5 font-semibold text-[#d8524d] hover:bg-[rgba(216,82,77,.18)] disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
