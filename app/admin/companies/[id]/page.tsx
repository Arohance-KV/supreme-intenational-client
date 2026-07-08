'use client';

import { use, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { StatusChip } from '@/components/admin/StatusChip';
import { useAdminProducts } from '@/lib/admin/products';
import { useCategories } from '@/lib/admin/taxonomy';
import CreateProductModal from '@/components/admin/CreateProductModal';
import {
  useCompany,
  useUpdateCompany,
  useCompanyEmployees,
  useInviteEmployee,
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
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCompanyLoginBody>({ email: '', password: '' });
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const email = form.email.trim();
    const password = form.password;
    if (!email) { alert('Email is required'); return; }
    if (password.length < 8) { alert('Password must be at least 8 characters'); return; }
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

  const [creditForm, setCreditForm] = useState({ amount: '', reason: '' });
  const [debitForm, setDebitForm] = useState({ amount: '', reason: '' });
  const [couponValue, setCouponValue] = useState('');

  function handleIssueCoupon(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(couponValue);
    if (!val || val <= 0) { alert('Coupon value must be greater than 0'); return; }
    if (!confirm(`Issue a ₹${val.toLocaleString('en-IN')} coupon to ${employee.firstName}? This replaces any existing coupon.`)) return;
    issueCoupon.mutate({ value: val, reason: 'Coupon issued' }, { onSuccess: () => setCouponValue('') });
  }

  function handleCredit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(creditForm.amount);
    if (!amt || amt <= 0) { alert('Amount must be greater than 0'); return; }
    if (!creditForm.reason.trim()) { alert('Reason is required'); return; }
    credit.mutate(
      { amount: amt, reason: creditForm.reason.trim() },
      { onSuccess: () => setCreditForm({ amount: '', reason: '' }) },
    );
  }

  function handleDebit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(debitForm.amount);
    if (!amt || amt <= 0) { alert('Amount must be greater than 0'); return; }
    if (!debitForm.reason.trim()) { alert('Reason is required'); return; }
    if (!confirm(`Debit ₹${amt.toLocaleString('en-IN')} from ${employee.firstName}'s wallet?\nReason: ${debitForm.reason}\n\nThis cannot be undone.`)) return;
    debit.mutate(
      { amount: amt, reason: debitForm.reason.trim() },
      { onSuccess: () => setDebitForm({ amount: '', reason: '' }) },
    );
  }

  const ledgerItems = ledgerData?.items ?? [];
  const ledgerPagination = ledgerData?.pagination;

  return (
    <div className="pt-4">
      {/* Balance */}
      <div className="mb-4 flex items-center gap-4">
        <div className="rounded-xl border border-line bg-white/60 px-4 py-3">
          <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
            {walletMode === 'coupon' ? 'Active coupon' : 'Wallet balance'}
          </p>
          {walletLoading ? (
            <div className="h-6 w-24 animate-pulse rounded bg-black/5" />
          ) : (
            <p className="text-2xl font-bold text-ink">
              {typeof wallet?.balance === 'number' ? `₹${wallet.balance.toLocaleString('en-IN')}` : '—'}
              {wallet?.currency && wallet.currency !== 'INR' && (
                <span className="ml-1 text-xs font-normal text-slate">{wallet.currency}</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Issue coupon (coupon mode) */}
      {walletMode === 'coupon' && (
        <form onSubmit={handleIssueCoupon} className="space-y-2 rounded-xl border border-line bg-white/60 p-3 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo">Issue coupon</p>
          <div className="flex gap-2">
            <input
              type="number" min="0.01" step="0.01" placeholder="Coupon value (₹)"
              value={couponValue} onChange={(e) => setCouponValue(e.target.value)}
              className="w-40 rounded-lg border border-line px-2.5 py-1.5 text-sm"
            />
            <button type="submit" disabled={issueCoupon.isPending} className="rounded-lg bg-gradient-to-br from-indigo to-indigo2 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
        <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">
          Ledger history
        </p>
        {ledgerLoading && (
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-8 animate-pulse rounded bg-black/5" />
            ))}
          </div>
        )}
        {!ledgerLoading && ledgerItems.length === 0 && (
          <p className="text-xs text-muted">No transactions yet.</p>
        )}
        {!ledgerLoading && ledgerItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
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
  const resend = useResendInvite();
  const updateStatus = useUpdateEmployeeStatus(companyId);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteEmployeeBody>({
    firstName: '',
    lastName: '',
    email: '',
    isdCode: '',
    phoneNumber: '',
  });

  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);

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

  function handleStatusToggle(emp: AdminEmployee) {
    const newStatus: 'active' | 'deactivated' =
      emp.employeeStatus === 'active' ? 'deactivated' : 'active';
    const label = newStatus === 'deactivated' ? 'deactivate' : 'activate';
    if (!confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} employee ${emp.firstName} ${emp.lastName ?? ''}?`)) return;
    updateStatus.mutate({ employeeId: emp._id, status: newStatus });
  }

  function handleResend(emp: AdminEmployee) {
    if (!confirm(`Resend invite to ${emp.email}?`)) return;
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
            <button onClick={() => setShowInvite(!showInvite)} className={primaryBtn}>
              {showInvite ? 'Cancel' : '+ Invite employee'}
            </button>
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

                  {/* Wallet toggle */}
                  <button
                    onClick={() =>
                      setExpandedWallet(expandedWallet === emp._id ? null : emp._id)
                    }
                    className="rounded-lg border border-line px-2.5 py-1 text-xs text-slate hover:bg-white/60"
                  >
                    {expandedWallet === emp._id ? 'Hide wallet' : 'Wallet'}
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

              {/* Inline wallet panel */}
              {expandedWallet === emp._id && (
                <div className="border-t border-line/70 px-3 pb-3">
                  <EmployeeWalletPanel employee={emp} walletMode={walletMode} />
                </div>
              )}
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

  function handleRemoveProductById(id: string, label: string) {
    if (!confirm(`Remove "${label}" from catalog?`)) return;
    updateCatalog.mutate({ removeProductIds: [id] });
  }

  function handleRemoveCategoryById(id: string, label: string) {
    if (!confirm(`Remove "${label}" from catalog?`)) return;
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">
            Whitelisted Products ({products.length})
          </p>
          {products.length > 0 ? (
            <ul className="space-y-1 mb-3 max-h-48 overflow-y-auto">
              {products.map((p) => (
                <li key={p.productId} className="flex items-center justify-between gap-2 rounded bg-white/50 px-3 py-1.5 text-sm">
                  <span className="min-w-0 truncate text-ink">
                    {p.name ?? p.productId}
                    {p.hidden && <span className="ml-2 rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-slate">hidden</span>}
                  </span>
                  <button
                    onClick={() => handleRemoveProductById(p.productId, p.name ?? p.productId)}
                    disabled={updateCatalog.isPending}
                    className="shrink-0 text-red-500 hover:text-red-700 disabled:opacity-40"
                    aria-label={`Remove ${p.name ?? p.productId}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted mb-3">No products whitelisted.</p>
          )}

          <ComboAdd
            placeholder="Search products by name…"
            query={productQuery}
            setQuery={setProductQuery}
            options={productOptions}
            loading={productsFetching}
            disabled={updateCatalog.isPending}
            alreadyAdded={addedProductIds}
            onAdd={(id) => updateCatalog.mutate({ addProductIds: [id] })}
          />
        </div>

        {/* Categories */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">
            Whitelisted Categories ({categoryIds.length})
          </p>
          {categoryIds.length > 0 ? (
            <ul className="space-y-1 mb-3 max-h-48 overflow-y-auto">
              {categoryIds.map((cid) => {
                const label = categoryNameById.get(cid) ?? cid;
                return (
                  <li key={cid} className="flex items-center justify-between gap-2 rounded bg-white/50 px-3 py-1.5 text-sm">
                    <span className="min-w-0 truncate text-ink">{label}</span>
                    <button
                      onClick={() => handleRemoveCategoryById(cid, label)}
                      disabled={updateCatalog.isPending}
                      className="shrink-0 text-red-500 hover:text-red-700 disabled:opacity-40"
                      aria-label={`Remove ${label}`}
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-muted mb-3">No categories whitelisted.</p>
          )}

          <ComboAdd
            placeholder="Search categories by name…"
            query={categoryQuery}
            setQuery={setCategoryQuery}
            options={categoryOptions}
            disabled={updateCatalog.isPending}
            alreadyAdded={addedCategoryIds}
            onAdd={(id) => updateCatalog.mutate({ addCategoryIds: [id] })}
          />
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
