'use client';

import { useWallet, useWalletLedger, type LedgerEntry } from '@/lib/employee/wallet';
import { glass, eyebrow } from '@/components/employee/ui';

function formatDate(value: unknown): string {
  if (!value) return '—';
  const d = new Date(value as string);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatAmount(entry: LedgerEntry): string {
  const raw = entry.amount;
  if (raw === undefined || raw === null) return '—';
  const num = Number(raw);
  if (isNaN(num)) return String(raw);
  return (num >= 0 ? '+' : '') + `₹${Math.abs(num).toLocaleString('en-IN')}`;
}

function amountClass(entry: LedgerEntry): string {
  const num = Number(entry.amount);
  if (isNaN(num)) return 'text-slate';
  return num >= 0 ? 'text-[#1a8f5a] font-semibold' : 'text-[#e0524d] font-semibold';
}

export default function WalletPage() {
  const { data: wallet, isLoading: walletLoading, isError: walletError } = useWallet();
  const { data: ledger, isLoading: ledgerLoading, isError: ledgerError } = useWalletLedger();

  return (
    <div className="min-h-screen bg-[#eef0f8]">
    <div className="mx-auto max-w-3xl px-4 py-8 font-display space-y-8">
      {/* Balance hero */}
      <section className="rounded-[24px] bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] p-8 text-white shadow-[0_24px_60px_rgba(34,36,90,.2)]">
        <p className={`${eyebrow} mb-2 !text-white/70`}>WALLET BALANCE</p>
        {walletLoading ? (
          <p className="animate-pulse text-4xl font-extrabold">Loading…</p>
        ) : walletError || !wallet ? (
          <p className="text-2xl font-semibold opacity-80">Unavailable</p>
        ) : (
          <p className="text-5xl font-extrabold tracking-[-.02em]">₹{wallet.balance.toLocaleString('en-IN')}</p>
        )}
        {wallet?.currency && <p className="mt-2 text-sm opacity-70">{wallet.currency}</p>}
      </section>

      {/* Ledger */}
      <section>
        <div className="mb-4">
          <p className={eyebrow}>TRANSACTION HISTORY</p>
          <h2 className="text-xl font-extrabold tracking-[-.02em] text-ink">Transaction History</h2>
        </div>

        {ledgerLoading && (
          <p className="text-slate animate-pulse">Loading transactions…</p>
        )}

        {ledgerError && (
          <p className="text-[#e0524d] text-sm">Could not load transaction history.</p>
        )}

        {!ledgerLoading && !ledgerError && ledger && ledger.length === 0 && (
          <p className="text-slate text-sm">No transactions yet.</p>
        )}

        {!ledgerLoading && !ledgerError && ledger && ledger.length > 0 && (
          <div className={`${glass} rounded-[20px] overflow-hidden overflow-x-auto`}>
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-white/40">
                <tr>
                  <th className="px-4 py-3 text-left font-jbmono text-[10px] uppercase tracking-[.08em] text-muted">Date</th>
                  <th className="px-4 py-3 text-left font-jbmono text-[10px] uppercase tracking-[.08em] text-muted">Description</th>
                  <th className="px-4 py-3 text-right font-jbmono text-[10px] uppercase tracking-[.08em] text-muted">Amount</th>
                  <th className="px-4 py-3 text-right font-jbmono text-[10px] uppercase tracking-[.08em] text-muted">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ledger.map((entry: LedgerEntry, i: number) => (
                  <tr key={i} className="hover:bg-[rgba(42,43,106,.04)] transition-colors">
                    <td className="px-4 py-3 text-slate whitespace-nowrap">
                      {formatDate(entry.createdAt ?? entry.date)}
                    </td>
                    <td className="px-4 py-3 text-slate">
                      {entry.description ? String(entry.description) : '—'}
                    </td>
                    <td className={`px-4 py-3 text-right whitespace-nowrap ${amountClass(entry)}`}>
                      {formatAmount(entry)}
                    </td>
                    <td className="px-4 py-3 text-right text-ink whitespace-nowrap">
                      {entry.balanceAfter !== undefined
                        ? `₹${Number(entry.balanceAfter).toLocaleString('en-IN')}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
    </div>
  );
}
