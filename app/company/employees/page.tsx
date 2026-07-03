'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '@/components/company/PageHeader';
import { Card } from '@/components/company/Card';
import { StatusPill } from '@/components/company/StatusPill';
import {
  useCompanyEmployees,
  useAddEmployee,
  useSetEmployeeStatus,
  useAdjustPoints,
  type Employee,
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
  const disableMinus = employee.wallet.balance < STEP || adjust.isPending;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
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
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-line text-[15px] font-bold leading-none text-slate transition-colors hover:bg-[#eef0f8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-[68px] text-center text-[13px] font-bold text-ink">
          {formatIN(employee.wallet.allocated)}
        </span>
        <button
          type="button"
          onClick={() => adjust.mutate({ id: employee._id, delta: STEP })}
          disabled={adjust.isPending}
          aria-label={`Add ${STEP} points`}
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-line text-[15px] font-bold leading-none text-slate transition-colors hover:bg-[#eef0f8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
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

      <span className="font-semibold text-ink">{formatIN(employee.wallet.allocated)}</span>
      <span className="font-semibold text-ink">{formatIN(employee.wallet.used)}</span>

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
              className="rounded-lg bg-ink px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {addEmployee.isPending ? 'Adding…' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CompanyEmployeesPage() {
  const { data, isLoading, isError } = useCompanyEmployees();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

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
            <input
              type="search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 rounded-full border border-line bg-white px-4 py-2 text-[13px] text-ink placeholder:text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="whitespace-nowrap rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
            >
              + Add Employee
            </button>
          </>
        }
      />

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
    </div>
  );
}
