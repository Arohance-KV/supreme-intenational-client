'use client';

import { useState } from 'react';
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

const SOURCE_LABEL: Record<string, string> = {
  admin_topup: 'Top-up',
  admin_adjustment: 'Adjustment',
  order_redemption: 'Order',
  refund: 'Refund',
  coupon_issue: 'Coupon issued',
  coupon_forfeit: 'Coupon forfeited',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'in', label: 'Added' },
  { key: 'out', label: 'Spent' },
];

export default function WalletPage() {
  const { data: wallet, isLoading: walletLoading, isError: walletError } = useWallet();
  const { data: ledger, isLoading: ledgerLoading, isError: ledgerError } = useWalletLedger();
  const [filter, setFilter] = useState('all');

  const isCoupon = wallet?.walletMode === 'coupon';
  const entries = ledger ?? [];
  const totalIn = entries.filter(isCredit).reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalOut = entries.filter((e) => !isCredit(e)).reduce((s, e) => s + Number(e.amount || 0), 0);
  const shown = entries.filter((e) => (filter === 'in' ? isCredit(e) : filter === 'out' ? !isCredit(e) : true));

  return (
    <div className="min-h-screen bg-[#eef0f8]">
      <div className="mx-auto max-w-3xl px-4 py-6 font-display sm:px-6 sm:py-8">
        {/* Balance hero */}
        <section
          className={`relative overflow-hidden rounded-[28px] p-6 text-white shadow-[0_24px_64px_rgba(22,23,58,.26)] sm:p-8 ${
            isCoupon ? 'bg-[linear-gradient(135deg,#0f766e,#149b8e)]' : 'bg-[linear-gradient(135deg,#16173a,#2a2b6a_60%,#3a3c98)]'
          }`}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="font-jbmono text-[11px] uppercase tracking-[.18em] text-white/70">
              {isCoupon ? 'Active coupon' : 'Wallet balance'}
            </p>
            {walletLoading ? (
              <div className="mt-3 h-12 w-40 animate-pulse rounded-lg bg-white/20" />
            ) : walletError || !wallet ? (
              <p className="mt-2 text-2xl font-semibold opacity-80">Unavailable</p>
            ) : (
              <p className="mt-1 text-[40px] font-extrabold leading-tight tracking-[-.03em] sm:text-[56px]">
                ₹{wallet.balance.toLocaleString('en-IN')}
              </p>
            )}
            <p className="mt-1 max-w-md text-sm text-white/70">
              {isCoupon
                ? 'Spend it in one go — any unused value is forfeited after your order.'
                : `${wallet?.currency ?? 'INR'} · reusable across every order`}
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
            <div key={t.label} className={`rounded-[18px] p-4 ${glass}`}>
              <p className="font-jbmono text-[10px] uppercase tracking-[.1em] text-muted">{t.label}</p>
              <p className={`mt-1 text-[15px] font-extrabold tracking-[-.02em] sm:text-xl ${t.tone}`}>
                {ledgerLoading ? '—' : t.value}
              </p>
            </div>
          ))}
        </div>

        {/* Ledger */}
        <section className="mt-9">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={`${eyebrow} mb-1.5`}>Transaction history</p>
              <h2 className="text-2xl font-extrabold tracking-[-.02em] text-ink sm:text-[28px]">Activity</h2>
            </div>
            {entries.length > 0 && (
              <div className="flex gap-1.5">
                {FILTERS.map((f) => {
                  const on = f.key === filter;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                        on ? 'bg-indigo text-white' : `${glass} text-slate hover:text-ink`
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            )}
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
            <div className={`rounded-[22px] py-14 text-center ${glass}`}>
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-black/5 text-muted">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M20 9a8 8 0 00-14-3M4 15a8 8 0 0014 3" />
                </svg>
              </div>
              <p className="font-medium text-slate">No transactions yet</p>
              <p className="mt-1 text-sm text-muted">Your top-ups and orders will show up here.</p>
            </div>
          )}

          {!ledgerLoading && !ledgerError && entries.length > 0 && (
            <ul className="space-y-2">
              {shown.map((entry, i) => {
                const credit = isCredit(entry);
                const source = String(entry.source ?? '');
                return (
                  <li key={String(entry._id ?? i)} className={`flex items-center gap-3 rounded-[18px] px-3.5 py-3.5 ${glass}`}>
                    <span
                      className={`grid h-10 w-10 flex-none place-items-center rounded-full ${
                        credit ? 'bg-[rgba(31,170,107,.12)] text-[#1a8f5a]' : 'bg-[rgba(224,82,77,.1)] text-[#e0524d]'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        {credit
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12l7 7 7-7" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />}
                      </svg>
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
