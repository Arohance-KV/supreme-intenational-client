'use client';

import { use, useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { StatusChip } from '@/components/admin/StatusChip';
import { useAdminProducts } from '@/lib/admin/products';
import { useCategories } from '@/lib/admin/taxonomy';
import CreateProductModal from '@/components/admin/CreateProductModal';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { useConfirm } from '@/components/ConfirmDialog';
import {
  useCompany,
  useUpdateCompany,
  useCompanyEmployees,
  useInviteEmployee,
  useBulkInvite,
  useBulkIssueCoupons,
  useBulkAllocateSelected,
  useResendInvite,
  useUpdateEmployeeStatus,
  useEmployeeWallet,
  useEmployeeLedger,
  useCreditWallet,
  useDebitWallet,
  useIssueCoupon,
  useCompanyCatalog,
  useUpdateCompanyCatalog,
  useCompanyProducts,
  useCreateCompanyLogin,
  useCompanyLogins,
  type AdminCompany,
  type AdminEmployee,
  type LedgerEntry,
  type UpdateCompanyBody,
  type InviteEmployeeBody,
  type CreateCompanyLoginBody,
} from '@/lib/admin/companies';
import { inr, fmtDate, fmtDateTime } from '@/lib/admin/format';

const inputCls =
  'w-full rounded-lg border border-line bg-white/70 px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';
const labelCls = 'mb-1 block text-xs font-medium text-slate';
const sectionCls = 'rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5 sm:p-6';
const primaryBtn =
  'rounded-lg bg-gradient-to-br from-indigo to-indigo2 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60';

// ── Shared section primitives ─────────────────────────────────────────────────

// Portals a full-screen overlay to <body> so modals escape any ancestor with
// backdrop-filter/transform (which would otherwise trap `fixed` positioning and
// let sibling cards with z-index paint over the modal). Blurs the whole screen.
function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(22,23,58,.5)] p-4 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>,
    document.body,
  );
}

function CardHeader({
  title,
  count,
  description,
  action,
}: {
  title: string;
  count?: number;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">
          {title}
          {typeof count === 'number' && (
            <span className="ml-1.5 text-sm font-normal text-muted">({count})</span>
          )}
        </h2>
        {action}
      </div>
      {description && <p className="mt-1 max-w-2xl text-xs text-slate">{description}</p>}
    </div>
  );
}

// Gradient square with initials — matches the Merch Portal Builder mockup's
// company/employee avatars (indigo→teal, rounded-[10px]).
function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?';
  return (
    <div
      className="grid shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-indigo to-accent font-extrabold text-white"
      style={{ width: size, height: size, fontSize: size <= 32 ? 11 : 12 }}
    >
      {initials}
    </div>
  );
}

// JetBrains-Mono uppercase column-header style shared by the mockup's tables.
const colHeadCls = 'font-jbmono text-[10px] uppercase tracking-[.05em] text-muted';

// ── CompanyEditForm ───────────────────────────────────────────────────────────

function CompanyEditForm({ company }: { company: AdminCompany }) {
  const update = useUpdateCompany(company._id);

  const [fields, setFields] = useState<UpdateCompanyBody>({
    name: company.name,
    logo: company.logo ?? '',
    status: company.status,
    walletMode: company.walletMode ?? 'points',
    notes: company.notes ?? '',
    primaryContact: {
      name: company.primaryContact?.name ?? '',
      email: company.primaryContact?.email ?? '',
      isdCode: company.primaryContact?.isdCode ?? '',
      phoneNumber: company.primaryContact?.phoneNumber ?? '',
    },
  });

  function setPrimary(key: keyof NonNullable<UpdateCompanyBody['primaryContact']>, val: string) {
    setFields((prev) => ({
      ...prev,
      primaryContact: { ...prev.primaryContact, [key]: val },
    }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload: UpdateCompanyBody = {
      name: fields.name?.trim() || undefined,
      logo: fields.logo ?? '',
      status: fields.status,
      walletMode: fields.walletMode,
      notes: fields.notes?.trim() || undefined,
      primaryContact: {
        name: fields.primaryContact?.name?.trim() || undefined,
        email: fields.primaryContact?.email?.trim() || undefined,
        isdCode: fields.primaryContact?.isdCode?.trim() || undefined,
        phoneNumber: fields.primaryContact?.phoneNumber?.trim() || undefined,
      },
    };
    update.mutate(payload);
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>
            Company name <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={fields.name ?? ''}
            onChange={(e) => setFields({ ...fields, name: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select
            value={fields.status ?? 'active'}
            onChange={(e) =>
              setFields({ ...fields, status: e.target.value as 'active' | 'inactive' })
            }
            className={inputCls}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Company logo</label>
        <ImageUploadField
          value={fields.logo ?? ''}
          onChange={(url) => setFields((prev) => ({ ...prev, logo: url }))}
          folder="logos"
        />
        <p className="mt-1 text-xs text-muted">Shown in this company&apos;s employee portal header.</p>
      </div>

      {/* Wallet model — segmented toggle (Merch Portal Builder mockup) */}
      <div>
        <label className={labelCls}>Wallet model</label>
        <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-line bg-white/50 p-1.5">
          {([
            ['points', 'Points', 'accumulate · leftover retained'],
            ['coupon', 'Coupon', 'spend-once · remainder forfeited'],
          ] as const).map(([val, label, sub]) => {
            const on = (fields.walletMode ?? 'points') === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setFields({ ...fields, walletMode: val })}
                className={`rounded-lg px-4 py-2.5 text-center transition ${
                  on
                    ? 'bg-gradient-to-br from-indigo to-indigo2 text-white shadow-sm'
                    : 'text-slate hover:bg-white/70'
                }`}
              >
                <span className="block text-sm font-semibold">{label}</span>
                <span className={`mt-0.5 block text-[10px] ${on ? 'text-white/70' : 'text-muted'}`}>{sub}</span>
              </button>
            );
          })}
        </div>
        {fields.walletMode !== company.walletMode && (
          <p className="mt-1.5 text-xs text-amber-600">
            Existing employee balances will now behave under the new mode on their next order.
          </p>
        )}
      </div>

      <p className="border-t border-line/70 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted">
        Primary contact
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Name</label>
          <input
            value={fields.primaryContact?.name ?? ''}
            onChange={(e) => setPrimary('name', e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input
            type="email"
            value={fields.primaryContact?.email ?? ''}
            onChange={(e) => setPrimary('email', e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>ISD code</label>
          <input
            value={fields.primaryContact?.isdCode ?? ''}
            onChange={(e) => setPrimary('isdCode', e.target.value)}
            placeholder="+91"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input
            value={fields.primaryContact?.phoneNumber ?? ''}
            onChange={(e) => setPrimary('phoneNumber', e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Notes</label>
        <textarea
          rows={2}
          value={fields.notes ?? ''}
          onChange={(e) => setFields({ ...fields, notes: e.target.value })}
          className={inputCls}
        />
      </div>

      {update.error && (
        <p className="text-sm text-red-600">
          {update.error instanceof ApiError ? update.error.message : 'Save failed.'}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-line/70 pt-4">
        <button
          type="submit"
          disabled={update.isPending}
          className="rounded-lg bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
        >
          {update.isPending ? 'Saving…' : 'Save changes'}
        </button>
        {update.isSuccess && <span className="text-sm text-green-600">Saved.</span>}
      </div>
    </form>
  );
}

// ── CompanyLoginSection ───────────────────────────────────────────────────────

function CompanyLoginSection({ companyId }: { companyId: string }) {
  const createLogin = useCreateCompanyLogin(companyId);
  const { data: logins, isLoading: loginsLoading } = useCompanyLogins(companyId);
  const { alert } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCompanyLoginBody>({ email: '', password: '' });
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const email = form.email.trim();
    const password = form.password;
    if (!email) { await alert({ message: 'Email is required' }); return; }
    if (password.length < 8) { await alert({ message: 'Password must be at least 8 characters' }); return; }
    createLogin.mutate(
      { email, password },
      {
        onSuccess: (res) => {
          setCreatedEmail(res.email);
          setForm({ email: '', password: '' });
          setShowForm(false);
        },
      },
    );
  }

  return (
    <section className={sectionCls}>
      <CardHeader
        title="Company login"
        description="Mint a self-service login this company can use to sign in directly. The password is stored hashed — it can't be viewed later, only re-created."
        action={
          <button
            onClick={() => { setShowForm(!showForm); setCreatedEmail(null); }}
            className={primaryBtn}
          >
            {showForm ? 'Cancel' : '+ Create login'}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border border-dashed border-line bg-white/40 p-4 space-y-3">
          <div>
            <label className={labelCls}>
              Email <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              Password <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputCls}
              placeholder="Min 8 characters"
            />
          </div>

          {createLogin.error && (
            <p className="text-sm text-red-600">
              {createLogin.error instanceof ApiError
                ? createLogin.error.message
                : 'Failed to create login.'}
            </p>
          )}

          <div className="flex gap-2">
            <button type="submit" disabled={createLogin.isPending} className={primaryBtn}>
              {createLogin.isPending ? 'Creating…' : 'Create login'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs text-slate hover:bg-white/60"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && createdEmail && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <span aria-hidden>✓</span>
          <span className="truncate">Login active for {createdEmail}</span>
        </div>
      )}

      {/* Existing login accounts for this company */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-slate">Login accounts</p>
        {loginsLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : !logins || logins.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line bg-white/40 px-3 py-3 text-sm text-muted">
            No login accounts yet. Create one above.
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white/50">
            {logins.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-indigo/10 text-[11px] font-bold text-indigo" aria-hidden>
                    {l.email.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="truncate text-sm text-ink">{l.email}</span>
                </span>
                <span className="flex-none text-xs text-muted">Added {fmtDate(l.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// ── EmployeeWalletPanel ───────────────────────────────────────────────────────

function EmployeeWalletPanel({
  employee,
  walletMode,
}: {
  employee: AdminEmployee;
  walletMode: 'points' | 'coupon';
}) {
  const [ledgerPage, setLedgerPage] = useState(1);
  const { data: wallet, isLoading: walletLoading } = useEmployeeWallet(employee._id);
  const { data: ledgerData, isLoading: ledgerLoading } = useEmployeeLedger(employee._id, ledgerPage);
  const credit = useCreditWallet(employee._id);
  const debit = useDebitWallet(employee._id);
  const issueCoupon = useIssueCoupon(employee._id);
  const { confirm, alert } = useConfirm();

  const [creditForm, setCreditForm] = useState({ amount: '', reason: '' });
  const [debitForm, setDebitForm] = useState({ amount: '', reason: '' });
  const [couponValue, setCouponValue] = useState('');

  async function handleIssueCoupon(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(couponValue);
    if (!val || val <= 0) { await alert({ message: 'Coupon value must be greater than 0' }); return; }
    if (!(await confirm({ title: 'Issue coupon', message: `Issue a ₹${val.toLocaleString('en-IN')} coupon to ${employee.firstName}? This replaces any existing coupon.`, confirmLabel: 'Issue coupon' }))) return;
    issueCoupon.mutate({ value: val, reason: 'Coupon issued' }, { onSuccess: () => setCouponValue('') });
  }

  async function handleCredit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(creditForm.amount);
    if (!amt || amt <= 0) { await alert({ message: 'Amount must be greater than 0' }); return; }
    if (!creditForm.reason.trim()) { await alert({ message: 'Reason is required' }); return; }
    credit.mutate(
      { amount: amt, reason: creditForm.reason.trim() },
      { onSuccess: () => setCreditForm({ amount: '', reason: '' }) },
    );
  }

  async function handleDebit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(debitForm.amount);
    if (!amt || amt <= 0) { await alert({ message: 'Amount must be greater than 0' }); return; }
    if (!debitForm.reason.trim()) { await alert({ message: 'Reason is required' }); return; }
    if (!(await confirm({ title: 'Debit wallet', message: `Debit ₹${amt.toLocaleString('en-IN')} from ${employee.firstName}'s wallet?\nReason: ${debitForm.reason}\n\nThis cannot be undone.`, confirmLabel: 'Debit', tone: 'danger' }))) return;
    debit.mutate(
      { amount: amt, reason: debitForm.reason.trim() },
      { onSuccess: () => setDebitForm({ amount: '', reason: '' }) },
    );
  }

  const ledgerItems = ledgerData?.items ?? [];
  const ledgerPagination = ledgerData?.pagination;

  return (
    <div className="space-y-5">
      {/* Balance / coupon hero */}
      <div className={`rounded-2xl p-5 text-white ${walletMode === 'coupon' ? 'bg-gradient-to-br from-accent to-[#127d72]' : 'bg-gradient-to-br from-indigo to-indigo2'}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-white/70">
          {walletMode === 'coupon' ? 'Active coupon' : 'Wallet balance'}
        </p>
        {walletLoading ? (
          <div className="mt-1 h-8 w-28 animate-pulse rounded bg-white/20" />
        ) : (
          <p className="mt-1 text-3xl font-extrabold tracking-[-.02em]">
            {typeof wallet?.balance === 'number' ? `₹${wallet.balance.toLocaleString('en-IN')}` : '—'}
            {wallet?.currency && wallet.currency !== 'INR' && (
              <span className="ml-1 text-sm font-normal text-white/70">{wallet.currency}</span>
            )}
          </p>
        )}
      </div>

      {/* Issue coupon (coupon mode) */}
      {walletMode === 'coupon' && (
        <form onSubmit={handleIssueCoupon} className="rounded-xl border border-line bg-white/60 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-ink">Issue / replace coupon</p>
            <p className="text-xs text-muted">Sets the employee&apos;s coupon to this value, replacing any existing one.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
              <input
                type="number" min="0.01" step="0.01" placeholder="Coupon value"
                value={couponValue} onChange={(e) => setCouponValue(e.target.value)}
                className="w-full rounded-lg border border-line bg-white pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <button type="submit" disabled={issueCoupon.isPending} className="shrink-0 rounded-lg bg-gradient-to-br from-indigo to-indigo2 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60">
              {issueCoupon.isPending ? 'Issuing…' : 'Issue coupon'}
            </button>
          </div>
          {issueCoupon.error && (
            <p className="text-xs text-red-600">{issueCoupon.error instanceof ApiError ? issueCoupon.error.message : 'Error'}</p>
          )}
          {issueCoupon.isSuccess && <p className="text-xs text-green-700">Coupon issued.</p>}
        </form>
      )}

      {/* Credit & Debit forms (points mode) */}
      {walletMode === 'points' && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Credit form */}
        <form
          onSubmit={handleCredit}
          className="space-y-2 rounded-xl border border-line bg-white/60 p-3"
        >
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Credit
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount (₹)"
              value={creditForm.amount}
              onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
              className="w-28 rounded-lg border border-line px-2.5 py-1.5 text-sm"
            />
            <input
              type="text"
              placeholder="Reason"
              value={creditForm.reason}
              onChange={(e) => setCreditForm({ ...creditForm, reason: e.target.value })}
              className="flex-1 rounded-lg border border-line px-2.5 py-1.5 text-sm"
            />
          </div>
          {credit.error && (
            <p className="text-xs text-red-600">
              {credit.error instanceof ApiError ? credit.error.message : 'Error'}
            </p>
          )}
          {credit.isSuccess && <p className="text-xs text-green-700">Credited successfully.</p>}
          <button
            type="submit"
            disabled={credit.isPending}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700 disabled:opacity-60"
          >
            {credit.isPending ? 'Crediting…' : 'Credit wallet'}
          </button>
        </form>

        {/* Debit form */}
        <form
          onSubmit={handleDebit}
          className="space-y-2 rounded-xl border border-line bg-white/60 p-3"
        >
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-700">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            Debit
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount (₹)"
              value={debitForm.amount}
              onChange={(e) => setDebitForm({ ...debitForm, amount: e.target.value })}
              className="w-28 rounded-lg border border-line px-2.5 py-1.5 text-sm"
            />
            <input
              type="text"
              placeholder="Reason"
              value={debitForm.reason}
              onChange={(e) => setDebitForm({ ...debitForm, reason: e.target.value })}
              className="flex-1 rounded-lg border border-line px-2.5 py-1.5 text-sm"
            />
          </div>
          {debit.error && (
            <p className="text-xs text-red-600">
              {debit.error instanceof ApiError ? debit.error.message : 'Error'}
            </p>
          )}
          {debit.isSuccess && <p className="text-xs text-red-700">Debited successfully.</p>}
          <button
            type="submit"
            disabled={debit.isPending}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {debit.isPending ? 'Debiting…' : 'Debit wallet'}
          </button>
        </form>
      </div>
      )}

      {/* Ledger */}
      <div>
        <p className={`mb-2 ${colHeadCls}`}>Ledger history</p>
        {ledgerLoading && (
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-8 animate-pulse rounded bg-black/5" />
            ))}
          </div>
        )}
        {!ledgerLoading && ledgerItems.length === 0 && (
          <p className="rounded-lg border border-dashed border-line py-6 text-center text-xs text-muted">No transactions yet.</p>
        )}
        {!ledgerLoading && ledgerItems.length > 0 && (
          <div className="max-h-72 overflow-auto rounded-lg border border-line">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 bg-white/95 backdrop-blur">
                <tr className="border-b border-line text-slate uppercase">
                  <th className="px-2 py-1 font-medium">Date</th>
                  <th className="px-2 py-1 font-medium">Type</th>
                  <th className="px-2 py-1 font-medium">Amount</th>
                  <th className="px-2 py-1 font-medium">Balance after</th>
                  <th className="px-2 py-1 font-medium">Source</th>
                  <th className="px-2 py-1 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {ledgerItems.map((entry: LedgerEntry) => (
                  <tr key={entry._id} className="border-b border-line">
                    <td className="px-2 py-1 text-slate">{fmtDateTime(entry.createdAt)}</td>
                    <td className="px-2 py-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          entry.type === 'credit'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-2 py-1 font-medium text-ink">
                      {entry.type === 'credit' ? '+' : '-'}
                      {typeof entry.amount === 'number' ? `₹${entry.amount.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-2 py-1 text-slate">
                      {typeof entry.balanceAfter === 'number' ? `₹${entry.balanceAfter.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-2 py-1 text-slate capitalize">
                      {entry.source?.replace(/_/g, ' ') ?? '—'}
                    </td>
                    <td className="px-2 py-1 text-slate max-w-xs truncate">{entry.reason ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {ledgerPagination && ledgerPagination.pages > 1 && (
          <div className="flex items-center justify-between mt-2 text-xs text-slate">
            <span>
              Page {ledgerPagination.page} of {ledgerPagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={ledgerPagination.page <= 1}
                onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                className="rounded border border-line px-2 py-0.5 hover:bg-white/60 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={ledgerPagination.page >= ledgerPagination.pages}
                onClick={() => setLedgerPage((p) => p + 1)}
                className="rounded border border-line px-2 py-0.5 hover:bg-white/60 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── BulkImportModal ───────────────────────────────────────────────────────────

interface SelectMode {
  employees: AdminEmployee[];
  valueLabel: string;
  actionLabel: string;
  apply: (employeeIds: string[], value: number) => Promise<string>;
}

function BulkModal({
  title,
  blurb,
  templateFilename,
  templateCsv,
  onClose,
  uploadFile,
  select,
}: {
  title: string;
  blurb: string;
  templateFilename: string;
  templateCsv: string;
  onClose: () => void;
  uploadFile: (file: File) => Promise<string>; // resolves to a success message
  select?: SelectMode; // when present, adds the "Select employees" tab
}) {
  const [tab, setTab] = useState<'select' | 'file'>(select ? 'select' : 'file');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // file tab
  const [file, setFile] = useState<File | null>(null);
  // select tab
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [value, setValue] = useState('');
  const [search, setSearch] = useState('');

  const reset = () => { setError(null); setDone(null); };

  function downloadTemplate() {
    const blob = new Blob([templateCsv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = templateFilename; a.click();
    URL.revokeObjectURL(url);
  }

  async function run(fn: () => Promise<string>) {
    setBusy(true); reset();
    try { setDone(await fn()); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }

  const filtered = (select?.employees ?? []).filter((e) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${e.firstName} ${e.lastName ?? ''} ${e.email}`.toLowerCase().includes(q);
  });
  const allShownChecked = filtered.length > 0 && filtered.every((e) => checked.has(e._id));

  function toggle(id: string) {
    setChecked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    reset();
  }
  function toggleAllShown() {
    setChecked((prev) => {
      const n = new Set(prev);
      if (allShownChecked) filtered.forEach((e) => n.delete(e._id));
      else filtered.forEach((e) => n.add(e._id));
      return n;
    });
    reset();
  }

  const tabCls = (on: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${on ? 'bg-white text-ink shadow-sm' : 'text-slate hover:text-ink'}`;

  return (
    <ModalShell onClose={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_40px_100px_rgba(22,23,58,.35)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-black/5 hover:text-slate" aria-label="Close">✕</button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <p className="text-sm text-slate">{blurb}</p>

          {select && (
            <div className="flex gap-1 rounded-xl border border-line bg-black/[.03] p-1">
              <button type="button" className={tabCls(tab === 'select')} onClick={() => { setTab('select'); reset(); }}>Select employees</button>
              <button type="button" className={tabCls(tab === 'file')} onClick={() => { setTab('file'); reset(); }}>Upload file</button>
            </div>
          )}

          {/* SELECT TAB */}
          {select && tab === 'select' && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search employees…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputCls}
              />
              <div className="overflow-hidden rounded-xl border border-line">
                <label className="flex cursor-pointer items-center gap-2 border-b border-line bg-black/[.02] px-3 py-2 text-xs font-medium text-slate">
                  <input type="checkbox" checked={allShownChecked} onChange={toggleAllShown} className="accent-indigo" />
                  Select all{search ? ' shown' : ''} ({filtered.length})
                </label>
                <ul className="max-h-56 overflow-y-auto">
                  {filtered.map((e) => (
                    <li key={e._id}>
                      <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-black/[.03]">
                        <input type="checkbox" checked={checked.has(e._id)} onChange={() => toggle(e._id)} className="accent-indigo" />
                        <Avatar name={`${e.firstName} ${e.lastName ?? ''}`} size={28} />
                        <span className="min-w-0">
                          <span className="block truncate text-ink">{e.firstName} {e.lastName ?? ''}</span>
                          <span className="block truncate text-xs text-muted">{e.email}</span>
                        </span>
                      </label>
                    </li>
                  ))}
                  {filtered.length === 0 && <li className="px-3 py-6 text-center text-xs text-muted">No employees match.</li>}
                </ul>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className={labelCls}>{select.valueLabel}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
                    <input
                      type="number" min="0.01" step="0.01" placeholder="0"
                      value={value} onChange={(e) => { setValue(e.target.value); reset(); }}
                      className={`${inputCls} pl-7`}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busy || checked.size === 0 || !(Number(value) > 0)}
                  onClick={() => run(async () => select.apply([...checked], Number(value)))}
                  className="rounded-lg bg-gradient-to-br from-indigo to-indigo2 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? 'Applying…' : `${select.actionLabel} (${checked.size})`}
                </button>
              </div>
            </div>
          )}

          {/* FILE TAB */}
          {(!select || tab === 'file') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white/50 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">Need the format?</p>
                  <p className="text-xs text-muted">Download the template, fill it in, and upload.</p>
                </div>
                <button type="button" onClick={downloadTemplate} className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs font-medium text-slate hover:bg-white/70">
                  ↓ Template
                </button>
              </div>
              <div>
                <label className={labelCls}>Spreadsheet file (.xlsx, .xls or .csv)</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => { setFile(e.target.files?.[0] ?? null); reset(); }}
                  className="block w-full text-sm text-slate file:mr-3 file:rounded-lg file:border-0 file:bg-indigo/10 file:px-3 file:py-2 file:text-xs file:font-medium file:text-indigo hover:file:bg-indigo/15"
                />
              </div>
              <button
                type="button"
                disabled={!file || busy}
                onClick={() => run(async () => { const m = await uploadFile(file!); setFile(null); return m; })}
                className="rounded-lg bg-gradient-to-br from-indigo to-indigo2 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              >
                {busy ? 'Uploading…' : 'Upload & apply'}
              </button>
            </div>
          )}

          {error && (
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</pre>
          )}
          {done && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">✓ {done}</div>
          )}
        </div>

        <div className="flex justify-end border-t border-line px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-sm text-slate hover:bg-white/60">
            {done ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

const INVITE_TEMPLATE_CSV = 'firstName,lastName,email,isdCode,phoneNumber\nAsha,Rao,asha@example.com,+91,9876543210\n';
const COUPON_TEMPLATE_CSV = 'email,value\nasha@example.com,2000\n';

// ── EmployeesSection ──────────────────────────────────────────────────────────

function EmployeesSection({
  companyId,
  companyStatus,
  walletMode,
}: {
  companyId: string;
  companyStatus: 'active' | 'inactive';
  walletMode: 'points' | 'coupon';
}) {
  const { data: employees, isLoading, isError, error } = useCompanyEmployees(companyId);
  const invite = useInviteEmployee(companyId);
  const bulkInvite = useBulkInvite(companyId);
  const bulkCoupons = useBulkIssueCoupons(companyId);
  const bulkAllocate = useBulkAllocateSelected(companyId);
  const resend = useResendInvite();
  const updateStatus = useUpdateEmployeeStatus(companyId);
  const { confirm } = useConfirm();

  const [showInvite, setShowInvite] = useState(false);
  const [bulkMode, setBulkMode] = useState<'invite' | 'coupon' | null>(null);
  const [inviteForm, setInviteForm] = useState<InviteEmployeeBody>({
    firstName: '',
    lastName: '',
    email: '',
    isdCode: '',
    phoneNumber: '',
  });

  const [walletModalEmp, setWalletModalEmp] = useState<AdminEmployee | null>(null);

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const payload: InviteEmployeeBody = {
      firstName: inviteForm.firstName.trim(),
      lastName: inviteForm.lastName?.trim() || undefined,
      email: inviteForm.email.trim(),
      isdCode: inviteForm.isdCode?.trim() || undefined,
      phoneNumber: inviteForm.phoneNumber?.trim() || undefined,
    };
    invite.mutate(payload, {
      onSuccess: () => {
        setShowInvite(false);
        setInviteForm({ firstName: '', lastName: '', email: '', isdCode: '', phoneNumber: '' });
      },
    });
  }

  async function handleStatusToggle(emp: AdminEmployee) {
    const newStatus: 'active' | 'deactivated' =
      emp.employeeStatus === 'active' ? 'deactivated' : 'active';
    const label = newStatus === 'deactivated' ? 'deactivate' : 'activate';
    const ok = await confirm({
      title: `${label.charAt(0).toUpperCase() + label.slice(1)} employee`,
      message: `${label.charAt(0).toUpperCase() + label.slice(1)} employee ${emp.firstName} ${emp.lastName ?? ''}?`,
      confirmLabel: label.charAt(0).toUpperCase() + label.slice(1),
      tone: newStatus === 'deactivated' ? 'danger' : 'default',
    });
    if (!ok) return;
    updateStatus.mutate({ employeeId: emp._id, status: newStatus });
  }

  async function handleResend(emp: AdminEmployee) {
    if (!(await confirm({ title: 'Resend invite', message: `Resend invite to ${emp.email}?`, confirmLabel: 'Resend' }))) return;
    resend.mutate(emp._id);
  }

  const list = employees ?? [];

  return (
    <section className={sectionCls}>
      <CardHeader
        title="Employees"
        count={list.length}
        action={
          companyStatus === 'active' ? (
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setBulkMode('invite')} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-slate hover:bg-white/70">
                Bulk invite
              </button>
              <button onClick={() => setBulkMode('coupon')} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-slate hover:bg-white/70">
                {walletMode === 'coupon' ? 'Bulk coupon' : 'Bulk points'}
              </button>
              <button onClick={() => setShowInvite(!showInvite)} className={primaryBtn}>
                {showInvite ? 'Cancel' : '+ Invite employee'}
              </button>
            </div>
          ) : (
            <span className="text-xs italic text-muted">Activate company to invite</span>
          )
        }
      />

      {/* Invite form */}
      {showInvite && (
        <form onSubmit={handleInvite} className="mb-4 rounded-lg border border-dashed border-line bg-white/40 p-4 space-y-3">
          <p className="text-sm font-medium text-slate">Invite new employee</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>
                First name <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={inviteForm.firstName}
                onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Last name</label>
              <input
                value={inviteForm.lastName ?? ''}
                onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>ISD code</label>
              <input
                value={inviteForm.isdCode ?? ''}
                onChange={(e) => setInviteForm({ ...inviteForm, isdCode: e.target.value })}
                placeholder="+91"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Phone number</label>
              <input
                value={inviteForm.phoneNumber ?? ''}
                onChange={(e) => setInviteForm({ ...inviteForm, phoneNumber: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          {invite.error && (
            <p className="text-sm text-red-600">
              {invite.error instanceof ApiError ? invite.error.message : 'Invite failed'}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={invite.isPending} className={primaryBtn}>
              {invite.isPending ? 'Inviting…' : 'Send invite'}
            </button>
            <button
              type="button"
              onClick={() => setShowInvite(false)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs text-slate hover:bg-white/60"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="h-10 animate-pulse rounded bg-black/5" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <p className="text-sm text-red-600">
          {error instanceof ApiError ? error.message : 'Failed to load employees.'}
        </p>
      )}

      {/* Empty */}
      {!isLoading && !isError && list.length === 0 && (
        <div className="rounded-lg border border-dashed border-line py-8 text-center text-sm text-muted">
          No employees yet.
        </div>
      )}

      {/* Employee list */}
      {!isLoading && !isError && list.length > 0 && (
        <div className="space-y-2">
          {list.map((emp) => (
            <div key={emp._id} className="rounded-xl border border-line/70 bg-white/40">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={`${emp.firstName} ${emp.lastName ?? ''}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {emp.firstName} {emp.lastName ?? ''}
                    </p>
                    <p className="truncate text-xs text-slate">{emp.email}</p>
                    {emp.phoneNumber && (
                      <p className="text-xs text-muted">
                        {emp.isdCode ? `${emp.isdCode} ` : ''}{emp.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <StatusChip
                    status={emp.employeeStatus ?? 'invited'}
                    label={emp.employeeStatus ?? 'invited'}
                  />
                  <span className="hidden text-xs text-muted sm:inline">{fmtDate(emp.createdAt)}</span>

                  {/* Manage wallet / coupon */}
                  <button
                    onClick={() => setWalletModalEmp(emp)}
                    className="rounded-lg bg-indigo/[.07] px-2.5 py-1 text-xs font-medium text-indigo hover:bg-indigo/10"
                  >
                    {walletMode === 'coupon' ? 'Manage coupon' : 'Manage wallet'}
                  </button>

                  {/* Resend invite */}
                  {emp.employeeStatus === 'invited' && (
                    <button
                      onClick={() => handleResend(emp)}
                      disabled={resend.isPending}
                      className="rounded-lg border border-blue-200 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                    >
                      Resend invite
                    </button>
                  )}

                  {/* Activate / Deactivate */}
                  {emp.employeeStatus !== 'invited' && (
                    <button
                      onClick={() => handleStatusToggle(emp)}
                      disabled={updateStatus.isPending}
                      className={`rounded-lg border px-2.5 py-1 text-xs disabled:opacity-60 ${
                        emp.employeeStatus === 'active'
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-green-200 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {emp.employeeStatus === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {updateStatus.error && (
        <p className="mt-2 text-xs text-red-600">
          {updateStatus.error instanceof ApiError
            ? updateStatus.error.message
            : 'Status update failed'}
        </p>
      )}

      {/* Bulk import modals */}
      {bulkMode === 'invite' && (
        <BulkModal
          title="Bulk invite employees"
          blurb="Invite many employees at once from a spreadsheet. Required columns: firstName and email. Optional: lastName, isdCode, phoneNumber. The whole file is validated first — if any row is invalid, nothing is imported."
          templateFilename="employee-invite-template.csv"
          templateCsv={INVITE_TEMPLATE_CSV}
          onClose={() => setBulkMode(null)}
          uploadFile={async (file) => { const r = await bulkInvite.mutateAsync(file); return `${r.invited} employee(s) invited.`; }}
        />
      )}
      {bulkMode === 'coupon' && (
        <BulkModal
          title={walletMode === 'coupon' ? 'Bulk issue coupons' : 'Bulk credit points'}
          blurb={
            walletMode === 'coupon'
              ? "Set the same coupon value for several employees at once — pick them below, or upload a spreadsheet (columns: email, value). Coupon mode sets each employee's coupon to the value (replacing any existing one)."
              : 'Credit the same points to several employees at once — pick them below, or upload a spreadsheet (columns: email, value).'
          }
          templateFilename="coupon-template.csv"
          templateCsv={COUPON_TEMPLATE_CSV}
          onClose={() => setBulkMode(null)}
          uploadFile={async (file) => {
            const r = await bulkCoupons.mutateAsync(file);
            const n = r.issued ?? r.credited ?? 0;
            return walletMode === 'coupon' ? `${n} coupon(s) issued.` : `${n} employee(s) credited.`;
          }}
          select={{
            employees: list,
            valueLabel: walletMode === 'coupon' ? 'Coupon value' : 'Points to credit',
            actionLabel: walletMode === 'coupon' ? 'Issue coupon' : 'Credit',
            apply: async (employeeIds, value) => {
              const r = await bulkAllocate.mutateAsync({ employeeIds, value });
              const n = r.issued ?? r.credited ?? employeeIds.length;
              return walletMode === 'coupon' ? `${n} coupon(s) issued.` : `${n} employee(s) credited.`;
            },
          }}
        />
      )}

      {/* Wallet / coupon management modal */}
      {walletModalEmp && (
        <ModalShell onClose={() => setWalletModalEmp(null)}>
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_40px_100px_rgba(22,23,58,.35)]">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={`${walletModalEmp.firstName} ${walletModalEmp.lastName ?? ''}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {walletModalEmp.firstName} {walletModalEmp.lastName ?? ''}
                  </p>
                  <p className="truncate text-xs text-muted">{walletModalEmp.email}</p>
                </div>
              </div>
              <button
                onClick={() => setWalletModalEmp(null)}
                className="rounded-lg p-1.5 text-muted hover:bg-black/5 hover:text-slate"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              <EmployeeWalletPanel employee={walletModalEmp} walletMode={walletMode} />
            </div>
          </div>
        </ModalShell>
      )}
    </section>
  );
}

// ── Searchable add picker ─────────────────────────────────────────────────────

function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

interface PickerOption {
  id: string;
  label: string;
  meta?: string;
  image?: string;
}

function ComboAdd({
  placeholder,
  query,
  setQuery,
  options,
  loading,
  disabled,
  alreadyAdded,
  onAdd,
}: {
  placeholder: string;
  query: string;
  setQuery: (v: string) => void;
  options: PickerOption[];
  loading?: boolean;
  disabled?: boolean;
  alreadyAdded: Set<string>;
  onAdd: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const showMenu = open && query.trim().length > 0;

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={inputCls}
      />
      {showMenu && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-line bg-white shadow-lg">
          {loading && <p className="px-3 py-2 text-xs text-muted">Searching…</p>}
          {!loading && options.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted">No matches.</p>
          )}
          {options.map((o) => {
            const added = alreadyAdded.has(o.id);
            return (
              <button
                key={o.id}
                type="button"
                disabled={added || disabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onAdd(o.id); setQuery(''); setOpen(false); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {o.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.image} alt="" className="h-8 w-8 shrink-0 rounded-md border border-line object-cover" />
                )}
                <span className="min-w-0 flex-1 truncate">
                  <span className="text-ink">{o.label}</span>
                  {o.meta && <span className="ml-2 text-xs text-muted">{o.meta}</span>}
                </span>
                <span className={`shrink-0 text-xs font-medium ${added ? 'text-muted' : 'text-indigo'}`}>
                  {added ? 'Added' : '+ Add'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── CompanyCatalogSection ─────────────────────────────────────────────────────

function CompanyCatalogSection({ companyId }: { companyId: string }) {
  const { data: catalog, isLoading, isError, error } = useCompanyCatalog(companyId);
  const updateCatalog = useUpdateCompanyCatalog(companyId);
  const { confirm } = useConfirm();

  const [productQuery, setProductQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const debouncedProductQuery = useDebounced(productQuery);

  // Product options come from admin product search; category options from the
  // full category list (small, filtered client-side).
  const { data: productSearch, isFetching: productsFetching } = useAdminProducts(1, debouncedProductQuery.trim() || undefined);
  const { data: categories } = useCategories();

  const productOptions: PickerOption[] = (productSearch?.products ?? [])
    .filter((p) => p.isActive !== false)
    .map((p) => ({ id: p._id, label: p.name, image: p.images?.[0] }));

  const categoryNameById = new Map((categories ?? []).map((c) => [c._id, c.name]));
  const categoryOptions: PickerOption[] = (categories ?? [])
    .filter((c) => c.name.toLowerCase().includes(categoryQuery.trim().toLowerCase()))
    .map((c) => ({ id: c._id, label: c.name }));

  async function handleRemoveProductById(id: string, label: string) {
    if (!(await confirm({ title: 'Remove from catalog', message: `Remove "${label}" from catalog?`, confirmLabel: 'Remove', tone: 'danger' }))) return;
    updateCatalog.mutate({ removeProductIds: [id] });
  }

  async function handleRemoveCategoryById(id: string, label: string) {
    if (!(await confirm({ title: 'Remove from catalog', message: `Remove "${label}" from catalog?`, confirmLabel: 'Remove', tone: 'danger' }))) return;
    updateCatalog.mutate({ removeCategoryIds: [id] });
  }

  if (isLoading) {
    return (
      <section className={sectionCls}>
        <CardHeader title="Company Catalog" />
        <div className="h-16 animate-pulse rounded bg-black/5" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className={sectionCls}>
        <CardHeader title="Company Catalog" />
        <p className="text-sm text-red-600">
          {error instanceof ApiError ? error.message : 'Failed to load catalog.'}
        </p>
      </section>
    );
  }

  const products = catalog?.products ?? [];
  const categoryIds = catalog?.categoryIds ?? [];
  const addedProductIds = new Set(products.map((p) => p.productId));
  const addedCategoryIds = new Set(categoryIds);

  return (
    // relative z-30: each card is its own backdrop-blur stacking context, so
    // without this the later Company Products card paints over the search dropdown.
    <section className={`${sectionCls} relative z-30`}>
      <CardHeader
        title="Company Catalog"
        description="Control which public products and categories are visible to this company's employees. Search by name to add. Only active, public products can be whitelisted."
      />

      {updateCatalog.error && (
        <p className="mb-3 text-sm text-red-600">
          {updateCatalog.error instanceof ApiError ? updateCatalog.error.message : 'Update failed'}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Products */}
        <div className="rounded-xl border border-line bg-white/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className={colHeadCls}>Whitelisted products</p>
            <span className="rounded-full bg-indigo/10 px-2 py-0.5 text-[11px] font-semibold text-indigo">{products.length}</span>
          </div>

          <ComboAdd
            placeholder="Search products by name to add…"
            query={productQuery}
            setQuery={setProductQuery}
            options={productOptions}
            loading={productsFetching}
            disabled={updateCatalog.isPending}
            alreadyAdded={addedProductIds}
            onAdd={(id) => updateCatalog.mutate({ addProductIds: [id] })}
          />

          {products.length > 0 ? (
            <ul className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {products.map((p) => (
                <li key={p.productId} className="group flex items-center justify-between gap-2 rounded-lg border border-line/60 bg-white/70 px-3 py-2 text-sm">
                  <span className="min-w-0 truncate text-ink">
                    {p.name ?? p.productId}
                    {p.hidden && <span className="ml-2 rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-slate">hidden</span>}
                  </span>
                  <button
                    onClick={() => handleRemoveProductById(p.productId, p.name ?? p.productId)}
                    disabled={updateCatalog.isPending}
                    className="shrink-0 rounded-md p-1 text-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    aria-label={`Remove ${p.name ?? p.productId}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-line py-6 text-center text-xs text-muted">
              No products whitelisted — search above to add.
            </p>
          )}
        </div>

        {/* Categories */}
        <div className="rounded-xl border border-line bg-white/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className={colHeadCls}>Whitelisted categories</p>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">{categoryIds.length}</span>
          </div>

          <ComboAdd
            placeholder="Search categories by name to add…"
            query={categoryQuery}
            setQuery={setCategoryQuery}
            options={categoryOptions}
            disabled={updateCatalog.isPending}
            alreadyAdded={addedCategoryIds}
            onAdd={(id) => updateCatalog.mutate({ addCategoryIds: [id] })}
          />

          {categoryIds.length > 0 ? (
            <ul className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {categoryIds.map((cid) => {
                const label = categoryNameById.get(cid) ?? cid;
                return (
                  <li key={cid} className="group flex items-center justify-between gap-2 rounded-lg border border-line/60 bg-white/70 px-3 py-2 text-sm">
                    <span className="min-w-0 truncate text-ink">{label}</span>
                    <button
                      onClick={() => handleRemoveCategoryById(cid, label)}
                      disabled={updateCatalog.isPending}
                      className="shrink-0 rounded-md p-1 text-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      aria-label={`Remove ${label}`}
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-line py-6 text-center text-xs text-muted">
              No categories whitelisted — search above to add.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ── CompanyProductsSection ────────────────────────────────────────────────────

function CompanyProductsSection({ companyId, companyName }: { companyId: string; companyName: string }) {
  const { data, isLoading, isError, error } = useCompanyProducts(companyId);
  const [showCreate, setShowCreate] = useState(false);

  const products = data?.products ?? [];

  return (
    <section className={sectionCls}>
      <CardHeader
        title="Company Products"
        count={products.length}
        description={'Products with visibility="company" owned by this company. New products are created for this company and open in the full product editor to add images, variants and pricing.'}
        action={
          <button onClick={() => setShowCreate(true)} className={primaryBtn}>
            + Add product
          </button>
        }
      />

      {showCreate && (
        <CreateProductModal
          onClose={() => setShowCreate(false)}
          lockedCompany={{ id: companyId, name: companyName }}
        />
      )}

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="h-10 animate-pulse rounded bg-black/5" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-600">
          {error instanceof ApiError ? error.message : 'Failed to load products.'}
        </p>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div className="rounded-lg border border-dashed border-line py-8 text-center text-sm text-muted">
          No company-specific products yet.
        </div>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={`border-b border-line ${colHeadCls}`}>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Min price</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Link</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-line/70 hover:bg-white/50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="h-9 w-9 shrink-0 rounded-md border border-line object-cover" />
                      ) : (
                        <span className="h-9 w-9 shrink-0 rounded-md border border-line bg-black/5" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-ink">{p.name}</p>
                        <p className="truncate font-jbmono text-xs text-muted">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">{inr(p.minPrice)}</td>
                  <td className="px-3 py-2">
                    <StatusChip
                      status={p.isActive ? 'active' : 'inactive'}
                      label={p.isActive ? 'Active' : 'Inactive'}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/catalog/products/${p.slug}`}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs text-slate hover:bg-white/60"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function CompanyDetailInner({ id }: { id: string }) {
  const { data: company, isLoading, error } = useCompany(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-black/5" />
        <div className="h-48 animate-pulse rounded-[20px] bg-black/5" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error instanceof ApiError ? error.message : 'Failed to load company.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate">
        <Link href="/admin/companies" className="hover:underline">
          Companies
        </Link>
        <span>/</span>
        <span className="text-ink font-medium truncate">{company.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar name={company.name} size={48} />
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink truncate">{company.name}</h1>
            <p className="mt-1 text-xs text-muted font-jbmono">{company.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full bg-indigo/10 px-2.5 py-1 text-[11px] font-semibold text-indigo capitalize">
            {(company.walletMode ?? 'points')} model
          </span>
          <StatusChip status={company.status} />
        </div>
      </div>

      {/* Details + login: two shorter config sections share a row on wide screens */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className={`${sectionCls} xl:col-span-2`}>
          <CardHeader title="Company details" />
          <CompanyEditForm company={company} />
        </section>
        <CompanyLoginSection companyId={id} />
      </div>

      {/* Employees section */}
      <EmployeesSection companyId={id} companyStatus={company.status} walletMode={company.walletMode ?? 'points'} />

      {/* Catalog editor */}
      <CompanyCatalogSection companyId={id} />

      {/* Company products */}
      <CompanyProductsSection companyId={id} companyName={company.name} />
    </div>
  );
}

export default function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded bg-black/5" />
          <div className="h-48 animate-pulse rounded-[20px] bg-black/5" />
        </div>
      }
    >
      <CompanyDetailInner id={id} />
    </Suspense>
  );
}
