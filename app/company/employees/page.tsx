'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/company/PageHeader';
import { Card } from '@/components/company/Card';
import { StatusPill } from '@/components/company/StatusPill';
import {
  useCompanyEmployees,
  useAddEmployee,
  useSetEmployeeStatus,
  useAdjustPoints,
  useBulkCreditPoints,
  useCompanyPointsPool,
  useSubmitProposal,
  POINTS_POOL_KEY,
  type Employee,
  type PointsPoolView,
} from '@/lib/company/employees';
import { formatLakh, formatIN } from '@/lib/company/format';
import { ApiError } from '@/lib/api';

const GRID = 'grid grid-cols-[minmax(220px,2.2fr)_.8fr_.8fr_1fr_1.7fr] items-center gap-4';
// Top-up interaction: a compact stepper next to the ALLOCATED figure. Each click
// immediately credits/debits a fixed 100-point step via useAdjustPoints — no separate
// "apply" step, so the table always reflects the live allocated/used/left totals.
const STEP = 100;

function employeeName(e: Employee) {
  return [e.firstName, e.lastName].filter(Boolean).join(' ') || e.email;
}

function TopUpStepper({ employee }: { employee: Employee }) {
  const adjust = useAdjustPoints();
  const qc = useQueryClient();
  // Reads the same cached query the page-level pool Card uses (react-query dedupes by
  // key), so gating a single "+" click doesn't fire an extra network request.
  const { data: poolView } = useCompanyPointsPool();
  const available = poolView?.pool.available ?? 0;
  const disableMinus = employee.wallet.balance < STEP || adjust.isPending;
  // Only the "+" (credit) direction draws from the company's shared points pool —
  // deductions never need gating against `available`.
  const overAvailable = STEP > available;
  const disablePlus = overAvailable || adjust.isPending;

  const handlePlus = () => {
    adjust.mutate(
      { id: employee._id, delta: STEP },
      // Crediting draws down the shared pool; refresh it so the header figure and
      // this same gate reflect the new `available` right away instead of waiting
      // out the query's staleTime.
      { onSuccess: () => qc.invalidateQueries({ queryKey: POINTS_POOL_KEY }) },
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <div
        className="inline-flex w-fit items-center gap-1 rounded-[9px] border border-line"
        style={{ background: 'rgba(255,255,255,.7)', padding: 3 }}
      >
        <button
          type="button"
          onClick={() => adjust.mutate({ id: employee._id, delta: -STEP })}
          disabled={disableMinus}
          aria-label={`Remove ${STEP} points`}
          title={
            employee.wallet.balance < STEP
              ? "Can't remove more points than the employee currently holds"
              : undefined
          }
          className="flex h-6 w-6 flex-none items-center justify-center rounded-[7px] text-[15px] font-bold leading-none text-slate transition-colors hover:bg-[#eef0f8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-[60px] text-center text-[13px] font-bold text-ink">
          {formatIN(employee.wallet.allocated)}
        </span>
        <button
          type="button"
          onClick={handlePlus}
          disabled={disablePlus}
          aria-label={`Add ${STEP} points`}
          title={
            overAvailable
              ? `Only ${formatIN(available)} points available. Request more from Supreme.`
              : undefined
          }
          className="flex h-6 w-6 flex-none items-center justify-center rounded-[7px] text-[15px] font-bold leading-none text-slate transition-colors hover:bg-[#eef0f8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
      {overAvailable && (
        <span className="text-[11px] text-[#d8524d]">
          Only {formatIN(available)} points available. Request more from Supreme.
        </span>
      )}
      {adjust.isError && (
        <span className="text-[11px] text-[#d8524d]">
          {adjust.error instanceof ApiError ? adjust.error.message : 'Could not update points.'}
        </span>
      )}
    </div>
  );
}

function EmployeeRow({ employee }: { employee: Employee }) {
  const setStatus = useSetEmployeeStatus();
  const isActive = employee.employeeStatus === 'active';
  const isInvited = employee.employeeStatus === 'invited';

  const handleToggle = () => {
    setStatus.mutate({ id: employee._id, status: isActive ? 'deactivated' : 'active' });
  };

  return (
    <div className={`${GRID} border-b border-line px-5 py-4 text-[13px] last:border-0`}>
      <span className="min-w-0">
        <span className="block truncate font-bold text-ink">{employeeName(employee)}</span>
        <span className="block truncate text-[12px] text-muted">{employee.email}</span>
        <span className="mt-0.5 block text-[11px] font-semibold text-[#1a8f5a]">
          {formatLakh(employee.wallet.balance)} pts left
        </span>
      </span>

      <span className="font-bold text-ink">{formatIN(employee.wallet.allocated)}</span>
      <span className="font-normal text-slate">{formatIN(employee.wallet.used)}</span>

      <span className="flex items-center gap-2">
        <StatusPill status={employee.employeeStatus} />
        <button
          type="button"
          onClick={handleToggle}
          disabled={setStatus.isPending || isInvited}
          title={isInvited ? 'Waiting for the employee to accept their invite' : undefined}
          aria-label={isActive ? 'Deactivate employee' : 'Activate employee'}
          className={`relative inline-flex h-5 w-9 flex-none items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            isActive ? 'bg-accent' : 'bg-line'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              isActive ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </span>

      <TopUpStepper employee={employee} />
    </div>
  );
}

function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const addEmployee = useAddEmployee();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    dialogRef.current?.querySelector<HTMLElement>('input')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEmployee.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim(),
      });
      onClose();
    } catch {
      // Surfaced inline below via addEmployee.isError.
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-employee-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="add-employee-title" className="text-[17px] font-bold text-ink">
          Add Employee
        </h2>
        <p className="mt-1 text-[12px] text-muted">
          They&rsquo;ll receive an email invite to set their password and activate their account.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <div>
            <label htmlFor="ae-first" className="mb-1 block text-[12px] font-semibold text-slate">
              First name
            </label>
            <input
              id="ae-first"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>
          <div>
            <label htmlFor="ae-last" className="mb-1 block text-[12px] font-semibold text-slate">
              Last name (optional)
            </label>
            <input
              id="ae-last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>
          <div>
            <label htmlFor="ae-email" className="mb-1 block text-[12px] font-semibold text-slate">
              Email
            </label>
            <input
              id="ae-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>

          {addEmployee.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-[#d8524d]">
              {addEmployee.error instanceof ApiError
                ? addEmployee.error.message
                : 'Could not add employee. Please try again.'}
            </p>
          )}

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-slate transition-colors hover:bg-[#f6f7fb]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addEmployee.isPending}
              className="rounded-lg px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#2a2b6a,#3a3c98)' }}
            >
              {addEmployee.isPending ? 'Adding…' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BulkPointsModal({ employees, onClose }: { employees: Employee[]; onClose: () => void }) {
  const bulk = useBulkCreditPoints();
  const qc = useQueryClient();
  const { data: poolView } = useCompanyPointsPool();
  const available = poolView?.pool.available ?? 0;
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState<{ ok: number; failed: number } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filtered = employees.filter((e) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return employeeName(e).toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
  });
  const allShownChecked = filtered.length > 0 && filtered.every((e) => checked.has(e._id));

  const toggle = (id: string) => {
    setDone(null);
    setChecked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };
  const toggleAllShown = () => {
    setDone(null);
    setChecked((prev) => {
      const n = new Set(prev);
      if (allShownChecked) filtered.forEach((e) => n.delete(e._id));
      else filtered.forEach((e) => n.add(e._id));
      return n;
    });
  };

  const value = Number(amount);
  // Bulk credit draws `value` points from the shared pool for every checked employee,
  // so the amount that matters for gating is the total, not the per-employee figure.
  const totalRequested = value * checked.size;
  const overAvailable = value > 0 && checked.size > 0 && totalRequested > available;
  const canApply = checked.size > 0 && value > 0 && !overAvailable && !bulk.isPending;

  const handleApply = async () => {
    const res = await bulk.mutateAsync({ ids: [...checked], amount: value });
    setDone(res);
    if (res.ok > 0) {
      qc.invalidateQueries({ queryKey: POINTS_POOL_KEY });
    }
    if (res.failed === 0) {
      setChecked(new Set());
      setAmount('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-points-title"
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="bulk-points-title" className="text-[17px] font-bold text-ink">Bulk points top-up</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-muted hover:bg-black/5 hover:text-slate">✕</button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          <p className="text-[12px] text-muted">Credit the same number of points to every selected employee.</p>
          <input
            type="search"
            placeholder="Search employees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
          />
          <div className="overflow-hidden rounded-xl border border-line">
            <label className="flex cursor-pointer items-center gap-2 border-b border-line bg-black/[.02] px-3 py-2 text-[12px] font-medium text-slate">
              <input type="checkbox" checked={allShownChecked} onChange={toggleAllShown} className="accent-indigo" />
              Select all{search ? ' shown' : ''} ({filtered.length})
            </label>
            <ul className="max-h-56 overflow-y-auto">
              {filtered.map((e) => (
                <li key={e._id}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-[13px] hover:bg-black/[.03]">
                    <input type="checkbox" checked={checked.has(e._id)} onChange={() => toggle(e._id)} className="accent-indigo" />
                    <span className="min-w-0">
                      <span className="block truncate text-ink">{employeeName(e)}</span>
                      <span className="block truncate text-[11px] text-muted">{e.email}</span>
                    </span>
                  </label>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-3 py-6 text-center text-[12px] text-muted">No employees match.</li>}
            </ul>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="bp-amount" className="mb-1 block text-[12px] font-semibold text-slate">Points per employee</label>
              <input
                id="bp-amount"
                type="number"
                min={1}
                step={1}
                placeholder="0"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setDone(null); }}
                className="w-full rounded-lg border border-line px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
              />
            </div>
            <button
              type="button"
              disabled={!canApply}
              onClick={handleApply}
              className="rounded-lg px-4 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#2a2b6a,#3a3c98)' }}
            >
              {bulk.isPending ? 'Applying…' : `Credit (${checked.size})`}
            </button>
          </div>

          {overAvailable && (
            <p className="text-[12px] text-[#d8524d]">
              Only {formatIN(available)} points available. Request more from Supreme.
            </p>
          )}

          {done && (
            done.failed === 0 ? (
              <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700">
                ✓ Credited {done.ok} employee{done.ok === 1 ? '' : 's'}.
              </div>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-[#d8524d]">
                Credited {done.ok}, but {done.failed} failed. Try the failed ones again.
              </div>
            )
          )}
        </div>

        <div className="flex justify-end border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-slate hover:bg-[#f6f7fb]">
            {done && done.failed === 0 ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestPointsModal({
  poolView,
  onClose,
}: {
  poolView: PointsPoolView | undefined;
  onClose: () => void;
}) {
  const submit = useSubmitProposal();
  const [requestedAmount, setRequestedAmount] = useState('');
  const [note, setNote] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const value = Number(requestedAmount);
  const canSubmit = value > 0 && !submit.isPending;
  const proposals = poolView?.proposals ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submit.mutateAsync({ requestedAmount: value, note: note.trim() || undefined });
      setRequestedAmount('');
      setNote('');
    } catch {
      // Surfaced inline below via submit.isError (e.g. a pending request already exists).
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-points-title"
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="request-points-title" className="text-[17px] font-bold text-ink">
            Request points
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-black/5 hover:text-slate"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <p className="text-[12px] text-muted">
            Ask Supreme to top up your company&rsquo;s points pool. A superAdmin will review this
            request.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label htmlFor="rp-amount" className="mb-1 block text-[12px] font-semibold text-slate">
                Points requested
              </label>
              <input
                id="rp-amount"
                type="number"
                min={1}
                step={1}
                required
                placeholder="0"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
              />
            </div>
            <div>
              <label htmlFor="rp-note" className="mb-1 block text-[12px] font-semibold text-slate">
                Note (optional)
              </label>
              <textarea
                id="rp-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why do you need more points?"
                className="w-full rounded-lg border border-line px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
              />
            </div>

            {submit.isError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-[#d8524d]">
                {submit.error instanceof ApiError
                  ? submit.error.message
                  : 'Could not submit request. Please try again.'}
              </p>
            )}
            {submit.isSuccess && (
              <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700">
                ✓ Request submitted. A superAdmin will review it shortly.
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-lg px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#2a2b6a,#3a3c98)' }}
              >
                {submit.isPending ? 'Submitting…' : 'Submit request'}
              </button>
            </div>
          </form>

          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[.05em] text-muted">
              Your requests
            </h3>
            {proposals.length === 0 ? (
              <p className="text-[12px] text-muted">No requests yet.</p>
            ) : (
              <ul className="overflow-hidden rounded-xl border border-line">
                {proposals.map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center justify-between gap-3 border-b border-line px-3 py-2 text-[13px] last:border-0"
                  >
                    <span className="min-w-0">
                      <span className="block font-bold text-ink">{formatIN(p.requestedAmount)} pts</span>
                      {typeof p.approvedAmount === 'number' && (
                        <span className="block text-[11px] text-muted">
                          Approved: {formatIN(p.approvedAmount)}
                        </span>
                      )}
                    </span>
                    <StatusPill status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-slate hover:bg-[#f6f7fb]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyEmployeesPage() {
  const { data, isLoading, isError } = useCompanyEmployees();
  const { data: poolView } = useCompanyPointsPool();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [showRequest, setShowRequest] = useState(false);

  const employees = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) => employeeName(e).toLowerCase().includes(q) || e.email.toLowerCase().includes(q),
    );
  }, [employees, search]);

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-7">
      <PageHeader
        title="Employees & Points"
        subtitle="Manage who can shop and how many points they hold."
        right={
          <>
            <div
              className="flex items-center gap-2 rounded-xl border border-line"
              style={{ background: 'var(--glass-bg)', padding: '10px 14px' }}
            >
              <span className="text-[13px] text-muted" aria-hidden="true">
                ⌕
              </span>
              <input
                type="search"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 bg-transparent text-[13px] text-ink placeholder:text-muted focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowBulk(true)}
              disabled={employees.length === 0}
              className="whitespace-nowrap rounded-xl border border-line px-4 py-[11px] text-[13.5px] font-semibold text-slate transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Bulk points
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="whitespace-nowrap rounded-xl px-4 py-[11px] text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg,#2a2b6a,#3a3c98)',
                boxShadow: '0 8px 20px rgba(42,43,106,.28)',
              }}
            >
              ＋ Add Employee
            </button>
          </>
        }
      />

      <Card className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="font-jbmono text-[10px] uppercase tracking-[.05em] text-muted">
              Available to allocate
            </p>
            <p className="text-[20px] font-extrabold text-ink">
              {formatIN(poolView?.pool.available ?? 0)}
            </p>
          </div>
          <div>
            <p className="font-jbmono text-[10px] uppercase tracking-[.05em] text-muted">Approved</p>
            <p className="text-[15px] font-semibold text-slate">
              {formatIN(poolView?.pool.approved ?? 0)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowRequest(true)}
          className="whitespace-nowrap rounded-xl border border-line px-4 py-[11px] text-[13.5px] font-semibold text-slate transition-colors hover:bg-white/70"
        >
          Request points
        </button>
      </Card>

      {isError && <Card className="p-6 text-[13px] text-muted">Could not load employees.</Card>}

      {isLoading && !data && <Card className="p-6 text-[13px] text-muted">Loading…</Card>}

      {!isLoading && !isError && employees.length === 0 && (
        <Card className="p-10 text-center text-[13px] text-muted">
          No employees yet. Add your first teammate to get started.
        </Card>
      )}

      {!isLoading && !isError && employees.length > 0 && (
        <Card className="overflow-hidden">
          {filtered.length === 0 ? (
            <p className="p-6 text-[13px] text-muted">No employees match &ldquo;{search}&rdquo;.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                <div
                  className={`${GRID} font-jbmono border-b border-line px-5 pb-3 pt-4 text-[10px] uppercase tracking-[.05em] text-muted`}
                >
                  <span>Name</span>
                  <span>Allocated</span>
                  <span>Used</span>
                  <span>Status</span>
                  <span>Top up</span>
                </div>
                {filtered.map((e) => (
                  <EmployeeRow key={e._id} employee={e} />
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} />}
      {showBulk && <BulkPointsModal employees={employees} onClose={() => setShowBulk(false)} />}
      {showRequest && <RequestPointsModal poolView={poolView} onClose={() => setShowRequest(false)} />}
    </div>
  );
}
