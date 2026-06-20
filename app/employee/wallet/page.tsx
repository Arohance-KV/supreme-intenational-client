'use client';

import { useWallet, useWalletLedger, type LedgerEntry } from '@/lib/employee/wallet';

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
  if (isNaN(num)) return 'text-gray-700';
  return num >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
}

export default function WalletPage() {
  const { data: wallet, isLoading: walletLoading, isError: walletError } = useWallet();
  const { data: ledger, isLoading: ledgerLoading, isError: ledgerError } = useWalletLedger();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Balance card */}
      <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 shadow-lg">
        <p className="text-sm font-medium uppercase tracking-widest opacity-75 mb-2">Wallet Balance</p>
        {walletLoading ? (
          <p className="text-4xl font-bold animate-pulse">Loading…</p>
        ) : walletError || !wallet ? (
          <p className="text-2xl font-semibold opacity-80">Unavailable</p>
        ) : (
          <p className="text-5xl font-bold">
            ₹{wallet.balance.toLocaleString('en-IN')}
          </p>
        )}
        {wallet?.currency && (
          <p className="mt-2 text-sm opacity-70">{wallet.currency}</p>
        )}
      </section>

      {/* Ledger */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h2>

        {ledgerLoading && (
          <p className="text-gray-500 animate-pulse">Loading transactions…</p>
        )}

        {ledgerError && (
          <p className="text-red-500 text-sm">Could not load transaction history.</p>
        )}

        {!ledgerLoading && !ledgerError && ledger && ledger.length === 0 && (
          <p className="text-gray-500 text-sm">No transactions yet.</p>
        )}

        {!ledgerLoading && !ledgerError && ledger && ledger.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance After</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {ledger.map((entry: LedgerEntry, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(entry.createdAt ?? entry.date)}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {entry.description ? String(entry.description) : '—'}
                    </td>
                    <td className={`px-4 py-3 text-right whitespace-nowrap ${amountClass(entry)}`}>
                      {formatAmount(entry)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">
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
  );
}
