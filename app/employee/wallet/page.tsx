'use client';

import { useWallet, useWalletLedger, type LedgerEntry } from '@/lib/employee/wallet';
import { glass, eyebrow } from '@/components/employee/ui';

function formatDate(value: unknown): string {
  if (!value) return '—';
  const d = new Date(value as string);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function inr(n: number): string {
  return `₹${Math.abs(n).toLocaleString('en-IN')}`;
}

// Ledger `amount` is always positive; the sign comes from `type` (credit/debit).
const isCredit = (e: LedgerEntry) => e.type !== 'debit';

// Human labels for the ledger `source` enum.
const SOURCE_LABEL: Record<string, string> = {
  admin_topup: 'Top-up',
  admin_adjustment: 'Adjustment',
  order_redemption: 'Order',
  refund: 'Refund',
  coupon_issue: 'Coupon issued',
  coupon_forfeit: 'Coupon forfeited',
};

export default function WalletPage() {
  const { data: wallet, isLoading: walletLoading, isError: walletError } = useWallet();
  const { data: ledger, isLoading: ledgerLoading, isError: ledgerError } = useWalletLedger();

  const isCoupon = wallet?.walletMode === 'coupon';
  const entries = ledger ?? [];
  const totalIn = entries.filter(isCredit).reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalOut = entries.filter((e) => !isCredit(e)).reduce((s, e) => s + Number(e.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#eef0f8]">
      <div className="mx-auto max-w-3xl px-4 py-6 font-display sm:px-6 sm:py-8">
        {/* Balance hero */}
        <section
          className={`relative overflow-hidden rounded-[26px] p-5 text-white sm:p-7 shadow-[0_24px_60px_rgba(34,36,90,.24)] ${
            isCoupon
              ? 'bg-[linear-gradient(135deg,#0f766e,#149b8e)]'
              : 'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)]'
          }`}
        >
          {/* ambient blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="font-jbmono text-[11px] uppercase tracking-[.16em] text-white/70">
              {isCoupon ? 'Active coupon' : 'Wallet balance'}
            </p>
            {walletLoading ? (
              <div className="mt-3 h-12 w-40 animate-pulse rounded-lg bg-white/20" />
            ) : walletError || !wallet ? (
              <p className="mt-2 text-2xl font-semibold opacity-80">Unavailable</p>
            ) : (
              <p className="mt-1 text-[38px] font-extrabold sm:text-[52px] leading-tight tracking-[-.03em]">
                ₹{wallet.balance.toLocaleString('en-IN')}
              </p>
            )}
            <p className="mt-1 text-sm text-white/70">
              {isCoupon
                ? 'Spend it in one go — any unused value is forfeited after your order.'
                : `${wallet?.currency ?? 'INR'} · reusable across orders`}
            </p>
          </div>
        </section>

        {/* Summary tiles */}
        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: 'Total added', value: inr(totalIn), tone: 'text-[#1a8f5a]' },
            { label: 'Total spent', value: inr(totalOut), tone: 'text-[#e0524d]' },
            { label: 'Transactions', value: String(entries.length), tone: 'text-ink' },
          ].map((t) => (
            <div key={t.label} className={`${glass} rounded-[18px] p-3 sm:p-4`}>
              <p className="font-jbmono text-[10px] uppercase tracking-[.1em] text-muted">{t.label}</p>
              <p className={`mt-1 text-[15px] font-extrabold tracking-[-.02em] sm:text-xl ${t.tone}`}>
                {ledgerLoading ? '—' : t.value}
              </p>
            </div>
          ))}
        </div>

        {/* Ledger */}
        <section className="mt-8">
          <div className="mb-4">
            <p className={eyebrow}>TRANSACTION HISTORY</p>
            <h2 className="text-xl font-extrabold tracking-[-.02em] text-ink">Transaction History</h2>
          </div>

          {ledgerLoading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`h-16 animate-pulse rounded-[16px] ${glass}`} />
              ))}
            </div>
          )}

          {ledgerError && <p className="text-sm text-[#e0524d]">Could not load transaction history.</p>}

          {!ledgerLoading && !ledgerError && entries.length === 0 && (
            <div className={`${glass} rounded-[20px] py-14 text-center`}>
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-black/5 text-xl text-muted">↺</div>
              <p className="font-medium text-slate">No transactions yet</p>
              <p className="mt-1 text-sm text-muted">Your top-ups and orders will show up here.</p>
            </div>
          )}

          {!ledgerLoading && !ledgerError && entries.length > 0 && (
            <ul className="space-y-2">
              {entries.map((entry, i) => {
                const credit = isCredit(entry);
                const source = String(entry.source ?? '');
                return (
                  <li key={String(entry._id ?? i)} className={`${glass} flex items-center gap-3 rounded-[16px] px-3 py-3 sm:px-4`}>
                    <span
                      className={`grid h-10 w-10 flex-none place-items-center rounded-full text-base font-bold ${
                        credit ? 'bg-[rgba(31,170,107,.12)] text-[#1a8f5a]' : 'bg-[rgba(224,82,77,.1)] text-[#e0524d]'
                      }`}
                    >
                      {credit ? '↓' : '↑'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {entry.reason ? String(entry.reason) : SOURCE_LABEL[source] ?? 'Transaction'}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        <span className="font-jbmono uppercase tracking-[.06em]">{SOURCE_LABEL[source] ?? source.replace(/_/g, ' ')}</span>
                        {' · '}
                        {formatDate(entry.createdAt ?? entry.date)}
                      </p>
                    </div>
                    <div className="flex-none text-right">
                      <p className={`text-sm font-bold ${credit ? 'text-[#1a8f5a]' : 'text-[#e0524d]'}`}>
                        {credit ? '+' : '−'}{inr(Number(entry.amount || 0))}
                      </p>
                      {entry.balanceAfter !== undefined && (
                        <p className="mt-0.5 font-jbmono text-[11px] text-muted">
                          bal ₹{Number(entry.balanceAfter).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
