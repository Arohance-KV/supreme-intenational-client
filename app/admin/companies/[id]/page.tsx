'use client';

import { use, useState, Suspense } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { StatusChip } from '@/components/admin/StatusChip';
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
  'w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400';
const labelCls = 'mb-1 block text-sm font-medium text-zinc-700';
const sectionCls = 'rounded-xl border border-zinc-200 bg-white p-5';

// ── CompanyEditForm ───────────────────────────────────────────────────────────

function CompanyEditForm({ company }: { company: AdminCompany }) {
  const update = useUpdateCompany(company._id);

  const [fields, setFields] = useState<UpdateCompanyBody>({
    name: company.name,
    status: company.status,
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

      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pt-1">
        Primary contact
      </p>
      <div className="grid grid-cols-2 gap-3">
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
      {update.isSuccess && (
        <p className="text-sm text-green-600">Saved successfully.</p>
      )}

      <button
        type="submit"
        disabled={update.isPending}
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-zinc-700 transition-colors"
      >
        {update.isPending ? 'Saving…' : 'Save changes'}
      </button>
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-800">Company login</h2>
        <button
          onClick={() => { setShowForm(!showForm); setCreatedEmail(null); }}
          className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
        >
          {showForm ? 'Cancel' : '+ Create login'}
        </button>
      </div>

      <p className="mb-3 text-xs text-zinc-500">
        Mint a self-service login this company can use to sign in directly.
      </p>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded border border-dashed border-zinc-300 p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          </div>

          {createLogin.error && (
            <p className="text-sm text-red-600">
              {createLogin.error instanceof ApiError
                ? createLogin.error.message
                : 'Failed to create login.'}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createLogin.isPending}
              className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
            >
              {createLogin.isPending ? 'Creating…' : 'Create login'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && createdEmail && (
        <p className="text-sm text-green-600">Login created for {createdEmail}.</p>
      )}
    </section>
  );
}

// ── EmployeeWalletPanel ───────────────────────────────────────────────────────

function EmployeeWalletPanel({ employee }: { employee: AdminEmployee }) {
  const [ledgerPage, setLedgerPage] = useState(1);
  const { data: wallet, isLoading: walletLoading } = useEmployeeWallet(employee._id);
  const { data: ledgerData, isLoading: ledgerLoading } = useEmployeeLedger(employee._id, ledgerPage);
  const credit = useCreditWallet(employee._id);
  const debit = useDebitWallet(employee._id);

  const [creditForm, setCreditForm] = useState({ amount: '', reason: '' });
  const [debitForm, setDebitForm] = useState({ amount: '', reason: '' });

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
    <div className="border-t border-zinc-100 pt-4 mt-4">
      {/* Balance */}
      <div className="flex items-center gap-4 mb-4">
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3">
          <p className="text-xs text-zinc-500 mb-0.5">Wallet balance</p>
          {walletLoading ? (
            <div className="h-6 w-24 animate-pulse rounded bg-zinc-200" />
          ) : (
            <p className="text-xl font-bold text-zinc-900">
              {typeof wallet?.balance === 'number' ? `₹${wallet.balance.toLocaleString('en-IN')}` : '—'}
              {wallet?.currency && wallet.currency !== 'INR' && (
                <span className="ml-1 text-xs font-normal text-zinc-500">{wallet.currency}</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Credit & Debit forms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Credit form */}
        <form
          onSubmit={handleCredit}
          className="rounded border border-green-200 bg-green-50 p-3 space-y-2"
        >
          <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">Credit</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount (₹)"
              value={creditForm.amount}
              onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
              className="w-28 rounded border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              type="text"
              placeholder="Reason"
              value={creditForm.reason}
              onChange={(e) => setCreditForm({ ...creditForm, reason: e.target.value })}
              className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm"
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
            className="rounded bg-green-700 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
          >
            {credit.isPending ? 'Crediting…' : 'Credit wallet'}
          </button>
        </form>

        {/* Debit form */}
        <form
          onSubmit={handleDebit}
          className="rounded border border-red-200 bg-red-50 p-3 space-y-2"
        >
          <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Debit</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount (₹)"
              value={debitForm.amount}
              onChange={(e) => setDebitForm({ ...debitForm, amount: e.target.value })}
              className="w-28 rounded border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              type="text"
              placeholder="Reason"
              value={debitForm.reason}
              onChange={(e) => setDebitForm({ ...debitForm, reason: e.target.value })}
              className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm"
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
            className="rounded bg-red-700 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
          >
            {debit.isPending ? 'Debiting…' : 'Debit wallet'}
          </button>
        </form>
      </div>

      {/* Ledger */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
          Ledger history
        </p>
        {ledgerLoading && (
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-8 animate-pulse rounded bg-zinc-100" />
            ))}
          </div>
        )}
        {!ledgerLoading && ledgerItems.length === 0 && (
          <p className="text-xs text-zinc-400">No transactions yet.</p>
        )}
        {!ledgerLoading && ledgerItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase">
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
                  <tr key={entry._id} className="border-b border-zinc-100">
                    <td className="px-2 py-1 text-zinc-500">{fmtDateTime(entry.createdAt)}</td>
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
                    <td className="px-2 py-1 font-medium text-zinc-800">
                      {entry.type === 'credit' ? '+' : '-'}
                      {typeof entry.amount === 'number' ? `₹${entry.amount.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-2 py-1 text-zinc-600">
                      {typeof entry.balanceAfter === 'number' ? `₹${entry.balanceAfter.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-2 py-1 text-zinc-500 capitalize">
                      {entry.source?.replace(/_/g, ' ') ?? '—'}
                    </td>
                    <td className="px-2 py-1 text-zinc-500 max-w-xs truncate">{entry.reason ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {ledgerPagination && ledgerPagination.pages > 1 && (
          <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
            <span>
              Page {ledgerPagination.page} of {ledgerPagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={ledgerPagination.page <= 1}
                onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                className="rounded border border-zinc-200 px-2 py-0.5 hover:bg-zinc-50 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={ledgerPagination.page >= ledgerPagination.pages}
                onClick={() => setLedgerPage((p) => p + 1)}
                className="rounded border border-zinc-200 px-2 py-0.5 hover:bg-zinc-50 disabled:opacity-40"
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

function EmployeesSection({ companyId, companyStatus }: { companyId: string; companyStatus: 'active' | 'inactive' }) {
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-800">
          Employees ({list.length})
        </h2>
        {companyStatus === 'active' && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
          >
            {showInvite ? 'Cancel' : '+ Invite employee'}
          </button>
        )}
        {companyStatus === 'inactive' && (
          <span className="text-xs text-zinc-400 italic">Activate company to invite</span>
        )}
      </div>

      {/* Invite form */}
      {showInvite && (
        <form onSubmit={handleInvite} className="mb-4 rounded border border-dashed border-zinc-300 p-4 space-y-3">
          <p className="text-sm font-medium text-zinc-700">Invite new employee</p>
          <div className="grid grid-cols-2 gap-3">
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
            <button
              type="submit"
              disabled={invite.isPending}
              className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
            >
              {invite.isPending ? 'Inviting…' : 'Send invite'}
            </button>
            <button
              type="button"
              onClick={() => setShowInvite(false)}
              className="rounded border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50"
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
            <div key={`skeleton-${i}`} className="h-10 animate-pulse rounded bg-zinc-100" />
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
        <p className="text-sm text-zinc-500">No employees yet.</p>
      )}

      {/* Employee list */}
      {!isLoading && !isError && list.length > 0 && (
        <div className="divide-y divide-zinc-100">
          {list.map((emp) => (
            <div key={emp._id}>
              <div className="flex items-center justify-between gap-3 py-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {emp.firstName} {emp.lastName ?? ''}
                  </p>
                  <p className="text-xs text-zinc-500">{emp.email}</p>
                  {emp.phoneNumber && (
                    <p className="text-xs text-zinc-400">
                      {emp.isdCode ? `${emp.isdCode} ` : ''}{emp.phoneNumber}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <StatusChip
                    status={emp.employeeStatus ?? 'invited'}
                    label={emp.employeeStatus ?? 'invited'}
                  />
                  <span className="text-xs text-zinc-400">{fmtDate(emp.createdAt)}</span>

                  {/* Wallet toggle */}
                  <button
                    onClick={() =>
                      setExpandedWallet(expandedWallet === emp._id ? null : emp._id)
                    }
                    className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
                  >
                    {expandedWallet === emp._id ? 'Hide wallet' : 'Wallet'}
                  </button>

                  {/* Resend invite */}
                  {emp.employeeStatus === 'invited' && (
                    <button
                      onClick={() => handleResend(emp)}
                      disabled={resend.isPending}
                      className="rounded border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                    >
                      Resend invite
                    </button>
                  )}

                  {/* Activate / Deactivate */}
                  {emp.employeeStatus !== 'invited' && (
                    <button
                      onClick={() => handleStatusToggle(emp)}
                      disabled={updateStatus.isPending}
                      className={`rounded border px-2 py-1 text-xs disabled:opacity-60 ${
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
                <div className="pb-3">
                  <EmployeeWalletPanel employee={emp} />
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

// ── CompanyCatalogSection ─────────────────────────────────────────────────────

function CompanyCatalogSection({ companyId }: { companyId: string }) {
  const { data: catalog, isLoading, isError, error } = useCompanyCatalog(companyId);
  const updateCatalog = useUpdateCompanyCatalog(companyId);

  const [addProductId, setAddProductId] = useState('');
  const [removeProductId, setRemoveProductId] = useState('');
  const [addCategoryId, setAddCategoryId] = useState('');
  const [removeCategoryId, setRemoveCategoryId] = useState('');

  function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    const id = addProductId.trim();
    if (!id) return;
    updateCatalog.mutate(
      { addProductIds: [id] },
      { onSuccess: () => setAddProductId('') },
    );
  }

  function handleRemoveProduct(e: React.FormEvent) {
    e.preventDefault();
    const id = removeProductId.trim();
    if (!id) return;
    if (!confirm(`Remove product ${id} from catalog?`)) return;
    updateCatalog.mutate(
      { removeProductIds: [id] },
      { onSuccess: () => setRemoveProductId('') },
    );
  }

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    const id = addCategoryId.trim();
    if (!id) return;
    updateCatalog.mutate(
      { addCategoryIds: [id] },
      { onSuccess: () => setAddCategoryId('') },
    );
  }

  function handleRemoveCategory(e: React.FormEvent) {
    e.preventDefault();
    const id = removeCategoryId.trim();
    if (!id) return;
    if (!confirm(`Remove category ${id} from catalog?`)) return;
    updateCatalog.mutate(
      { removeCategoryIds: [id] },
      { onSuccess: () => setRemoveCategoryId('') },
    );
  }

  function handleRemoveProductById(id: string) {
    if (!confirm(`Remove product ${id} from catalog?`)) return;
    updateCatalog.mutate({ removeProductIds: [id] });
  }

  function handleRemoveCategoryById(id: string) {
    if (!confirm(`Remove category ${id} from catalog?`)) return;
    updateCatalog.mutate({ removeCategoryIds: [id] });
  }

  if (isLoading) {
    return (
      <section className={sectionCls}>
        <h2 className="mb-4 text-base font-semibold text-zinc-800">Company Catalog</h2>
        <div className="h-16 animate-pulse rounded bg-zinc-100" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className={sectionCls}>
        <h2 className="mb-4 text-base font-semibold text-zinc-800">Company Catalog</h2>
        <p className="text-sm text-red-600">
          {error instanceof ApiError ? error.message : 'Failed to load catalog.'}
        </p>
      </section>
    );
  }

  const products = catalog?.products ?? [];
  const categoryIds = catalog?.categoryIds ?? [];

  return (
    <section className={sectionCls}>
      <h2 className="mb-4 text-base font-semibold text-zinc-800">Company Catalog</h2>
      <p className="mb-4 text-xs text-zinc-500">
        Control which public products and categories are visible to this company&apos;s employees.
        Only active, public products can be whitelisted.
      </p>

      {updateCatalog.error && (
        <p className="mb-3 text-sm text-red-600">
          {updateCatalog.error instanceof ApiError ? updateCatalog.error.message : 'Update failed'}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Whitelisted Products ({products.length})
          </p>
          {products.length > 0 ? (
            <ul className="space-y-1 mb-3 max-h-48 overflow-y-auto">
              {products.map((p) => (
                <li key={p.productId} className="flex items-center justify-between gap-2 rounded bg-zinc-50 px-3 py-1.5 text-xs">
                  <span className="font-mono text-zinc-700 truncate">
                    {p.productId}
                    {p.hidden && <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-sans text-zinc-500">hidden</span>}
                  </span>
                  <button
                    onClick={() => handleRemoveProductById(p.productId)}
                    disabled={updateCatalog.isPending}
                    className="text-red-500 hover:text-red-700 disabled:opacity-40 shrink-0"
                    aria-label={`Remove product ${p.productId}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-400 mb-3">No products whitelisted.</p>
          )}

          {/* Add product */}
          <form onSubmit={handleAddProduct} className="flex gap-2">
            <input
              type="text"
              placeholder="Product ObjectId"
              value={addProductId}
              onChange={(e) => setAddProductId(e.target.value)}
              className="flex-1 rounded border border-zinc-300 px-2 py-1 text-xs font-mono"
            />
            <button
              type="submit"
              disabled={updateCatalog.isPending || !addProductId.trim()}
              className="rounded bg-zinc-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
            >
              Add
            </button>
          </form>

          {/* Remove product */}
          <form onSubmit={handleRemoveProduct} className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Product ObjectId to remove"
              value={removeProductId}
              onChange={(e) => setRemoveProductId(e.target.value)}
              className="flex-1 rounded border border-zinc-300 px-2 py-1 text-xs font-mono"
            />
            <button
              type="submit"
              disabled={updateCatalog.isPending || !removeProductId.trim()}
              className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 disabled:opacity-60 hover:bg-red-50"
            >
              Remove
            </button>
          </form>
        </div>

        {/* Categories */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Whitelisted Categories ({categoryIds.length})
          </p>
          {categoryIds.length > 0 ? (
            <ul className="space-y-1 mb-3 max-h-48 overflow-y-auto">
              {categoryIds.map((cid) => (
                <li key={cid} className="flex items-center justify-between gap-2 rounded bg-zinc-50 px-3 py-1.5 text-xs">
                  <span className="font-mono text-zinc-700 truncate">{cid}</span>
                  <button
                    onClick={() => handleRemoveCategoryById(cid)}
                    disabled={updateCatalog.isPending}
                    className="text-red-500 hover:text-red-700 disabled:opacity-40 shrink-0"
                    aria-label={`Remove category ${cid}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-400 mb-3">No categories whitelisted.</p>
          )}

          {/* Add category */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              placeholder="Category ObjectId"
              value={addCategoryId}
              onChange={(e) => setAddCategoryId(e.target.value)}
              className="flex-1 rounded border border-zinc-300 px-2 py-1 text-xs font-mono"
            />
            <button
              type="submit"
              disabled={updateCatalog.isPending || !addCategoryId.trim()}
              className="rounded bg-zinc-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
            >
              Add
            </button>
          </form>

          {/* Remove category */}
          <form onSubmit={handleRemoveCategory} className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Category ObjectId to remove"
              value={removeCategoryId}
              onChange={(e) => setRemoveCategoryId(e.target.value)}
              className="flex-1 rounded border border-zinc-300 px-2 py-1 text-xs font-mono"
            />
            <button
              type="submit"
              disabled={updateCatalog.isPending || !removeCategoryId.trim()}
              className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 disabled:opacity-60 hover:bg-red-50"
            >
              Remove
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ── CompanyProductsSection ────────────────────────────────────────────────────

function CompanyProductsSection({ companyId }: { companyId: string }) {
  const { data, isLoading, isError, error } = useCompanyProducts(companyId);

  const products = data?.products ?? [];

  return (
    <section className={sectionCls}>
      <h2 className="mb-4 text-base font-semibold text-zinc-800">
        Company Products ({products.length})
      </h2>
      <p className="mb-3 text-xs text-zinc-500">
        Products with visibility=&quot;company&quot; owned by this company.
      </p>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="h-10 animate-pulse rounded bg-zinc-100" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-600">
          {error instanceof ApiError ? error.message : 'Failed to load products.'}
        </p>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <p className="text-sm text-zinc-500">No company-specific products.</p>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Slug</th>
                <th className="px-3 py-2 font-medium">Min price</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Link</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-3 py-2 text-zinc-800 truncate max-w-xs">{p.name}</td>
                  <td className="px-3 py-2 text-zinc-500 font-mono text-xs">{p.slug}</td>
                  <td className="px-3 py-2">{inr(p.minPrice)}</td>
                  <td className="px-3 py-2">
                    <StatusChip
                      status={p.isActive ? 'active' : 'inactive'}
                      label={p.isActive ? 'Active' : 'Inactive'}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/catalog/products/${p.slug}`}
                      className="text-xs text-blue-600 hover:underline"
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
        <div className="h-8 w-64 animate-pulse rounded bg-zinc-200" />
        <div className="h-48 animate-pulse rounded-xl bg-zinc-100" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error instanceof ApiError ? error.message : 'Failed to load company.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/admin/companies" className="hover:underline">
          Companies
        </Link>
        <span>/</span>
        <span className="text-zinc-800 font-medium truncate">{company.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{company.name}</h1>
          <p className="mt-1 text-xs text-zinc-400 font-mono">{company.slug}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusChip status={company.status} />
        </div>
      </div>

      {/* Company edit form */}
      <section className={sectionCls}>
        <h2 className="mb-4 text-base font-semibold text-zinc-800">Company details</h2>
        <CompanyEditForm company={company} />
      </section>

      {/* Company login */}
      <CompanyLoginSection companyId={id} />

      {/* Employees section */}
      <EmployeesSection companyId={id} companyStatus={company.status} />

      {/* Catalog editor */}
      <CompanyCatalogSection companyId={id} />

      {/* Company products */}
      <CompanyProductsSection companyId={id} />
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
          <div className="h-8 w-64 animate-pulse rounded bg-zinc-200" />
          <div className="h-48 animate-pulse rounded-xl bg-zinc-100" />
        </div>
      }
    >
      <CompanyDetailInner id={id} />
    </Suspense>
  );
}
