'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useCompanies, useUpdateCompany, type AdminCompany } from '@/lib/admin/companies';
import { useAdminUsers, type AdminUser } from '@/lib/admin/users';
import { useB2BUsers, useSetB2BApproval, type B2BStatus, type B2BUser } from '@/lib/admin/b2bUsers';

const APPROVED_PAGE_LIMIT = 20;

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';

const CHIP_BASE =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors';
const CHIP_ON = 'border-indigo bg-indigo/10 text-indigo';
const CHIP_OFF = 'border-line text-slate hover:bg-white/60';

// Per-status button copy. The same row component drives all three tabs, but "Approve"
// means something different in each: grant, re-save, reinstate.
const ACTION_COPY: Record<B2BStatus, { primary: string; secondary: string | null }> = {
  pending: { primary: 'Approve', secondary: 'Reject' },
  approved: { primary: 'Save', secondary: 'Revoke' },
  rejected: { primary: 'Reinstate', secondary: null },
};

function SalesChips({
  salesUsers,
  selected,
  disabled,
  onToggle,
}: {
  salesUsers: AdminUser[];
  selected: string[];
  disabled: boolean;
  onToggle: (id: string) => void;
}) {
  if (salesUsers.length === 0) return <span className="text-sm text-muted">No sales users yet</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {salesUsers.map((u) => {
        const on = selected.includes(u._id);
        return (
          <label key={u._id} className={`${CHIP_BASE} ${on ? CHIP_ON : CHIP_OFF}`}>
            <input
              type="checkbox"
              checked={on}
              disabled={disabled}
              onChange={() => onToggle(u._id)}
              className="accent-indigo"
            />
            {u.firstName} {u.lastName ?? ''}
          </label>
        );
      })}
    </div>
  );
}

// One row: a company with a checkbox list of sales users. Saving writes the full
// assignedAdminIds array via PATCH /admin/companies/:id (the existing update route).
function CompanyRow({ company, salesUsers }: { company: AdminCompany; salesUsers: AdminUser[] }) {
  const update = useUpdateCompany(company._id);
  const assigned = company.assignedAdminIds ?? [];

  const toggle = (userId: string) => {
    const next = assigned.includes(userId)
      ? assigned.filter((id) => id !== userId)
      : [...assigned, userId];
    update.mutate({ assignedAdminIds: next });
  };

  return (
    <tr className="border-b border-line/60 last:border-0 hover:bg-white/40">
      <td className="px-5 py-3 align-top">
        <div className="font-semibold text-ink">{company.name}</div>
        {assigned.length === 0 && (
          <span className="mt-1 inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
            Unassigned
          </span>
        )}
      </td>
      <td className="px-5 py-3">
        <SalesChips salesUsers={salesUsers} selected={assigned} disabled={update.isPending} onToggle={toggle} />
        {update.isError && <p className="mt-1.5 text-xs text-red-600">Save failed — try again.</p>}
      </td>
    </tr>
  );
}

// One B2B customer row. Unlike CompanyRow, approval is a single explicit submit rather
// than a per-checkbox autosave, so selection lives in local state until then.
function B2BUserRow({
  user,
  salesUsers,
  salesUsersLoaded,
}: {
  user: B2BUser;
  salesUsers: AdminUser[];
  salesUsersLoaded: boolean;
}) {
  const approve = useSetB2BApproval(user._id);
  const [selected, setSelected] = useState<string[]>(user.assignedAdminIds ?? []);
  const prunedStaleIds = useRef(false);

  // Drop any assignedAdminIds id that isn't in the active sales list (e.g. that admin
  // was later deactivated) — otherwise the stale id survives every Approve resubmit and
  // the server 400s ("One or more selected users are not sales people") forever, with no
  // checkbox to ever clear it. Only prune once, and only once the sales list has
  // genuinely loaded: pruning against an empty in-flight list would wipe a valid
  // selection instead of just the stale one.
  useEffect(() => {
    if (!salesUsersLoaded || prunedStaleIds.current) return;
    prunedStaleIds.current = true;
    const activeIds = new Set(salesUsers.map((u) => u._id));
    setSelected((s) => s.filter((id) => activeIds.has(id)));
  }, [salesUsersLoaded, salesUsers]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const copy = ACTION_COPY[user.b2bStatus];
  const saved = user.assignedAdminIds ?? [];
  const dirty = selected.length !== saved.length || selected.some((id) => !saved.includes(id));
  // Approving always needs at least one assignee (the server enforces this too). On an
  // already-approved row the button is a re-save, so it's only live once something changed.
  const canSubmit =
    selected.length > 0 && (user.b2bStatus !== 'approved' || dirty) && !approve.isPending;

  return (
    <tr className="border-b border-line/60 last:border-0 hover:bg-white/40">
      <td className="px-5 py-3 align-top">
        <div className="font-semibold text-ink">{user.firstName} {user.lastName ?? ''}</div>
        <div className="text-xs text-slate">{user.email}</div>
        {user.company?.name && <div className="text-xs text-muted">{user.company.name}</div>}
        {user.b2bStatus === 'approved' && saved.length === 0 && (
          <span className="mt-1 inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
            Unassigned — invisible to sales
          </span>
        )}
      </td>
      <td className="px-5 py-3">
        <SalesChips salesUsers={salesUsers} selected={selected} disabled={approve.isPending} onToggle={toggle} />
        {approve.isError && <p className="mt-1.5 text-xs text-red-600">Save failed — try again.</p>}
      </td>
      <td className="px-5 py-3 align-top">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => approve.mutate({ status: 'approved', assignedAdminIds: selected })}
            className="rounded-lg bg-indigo px-3 py-1.5 text-xs font-bold text-white transition-opacity disabled:opacity-40"
          >
            {approve.isPending ? 'Saving…' : copy.primary}
          </button>
          {copy.secondary && (
            <button
              type="button"
              disabled={approve.isPending}
              // No assignedAdminIds here: rejecting is a permission change only and the
              // server now leaves existing assignments untouched (see b2bUser.service.ts).
              onClick={() => approve.mutate({ status: 'rejected' })}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-slate transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-40"
            >
              {copy.secondary}
            </button>
          )}
        </div>
        {/* Say why the button is dead rather than just grey it out. */}
        {selected.length === 0 ? (
          <p className="mt-1.5 text-right text-[11px] text-muted">Pick a sales person first</p>
        ) : user.b2bStatus === 'approved' && !dirty ? (
          <p className="mt-1.5 text-right text-[11px] text-muted">No changes</p>
        ) : null}
      </td>
    </tr>
  );
}

function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className={`overflow-x-auto rounded-2xl ${GLASS}`}>
      <table className="w-full min-w-[860px] text-sm">{children}</table>
    </div>
  );
}

function SkeletonCard({ rows }: { rows: number }) {
  return (
    <div className={`rounded-2xl p-4 ${GLASS}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="mb-2 h-12 animate-pulse rounded-lg bg-black/[.04]" />
      ))}
    </div>
  );
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl p-10 text-center ${GLASS}`}>
      <p className="text-sm text-muted">{children}</p>
    </div>
  );
}

function ErrorCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{children}</div>
  );
}

const TABS: { key: B2BStatus; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const TAB_BLURB: Record<B2BStatus, string> = {
  pending: 'Approve a signup with at least one assigned sales person, or reject to deny quotation access.',
  approved: 'Edit sales assignments, or revoke to take away a customer’s quotation access.',
  rejected: 'Rejection is reversible — assign at least one sales person and hit Reinstate.',
};

export default function AdminAssignmentsPage() {
  const companiesQ = useCompanies(1); // page 1; extend with pagination later if needed
  const usersQ = useAdminUsers();

  const [tab, setTab] = useState<B2BStatus>('pending');
  // Important 5: after the b2bStatus migration, every legacy customer lands in Approved
  // with no assignee and is invisible to sales until swept. Real (server-side) pagination
  // makes every one of them reachable regardless of count; the filters below narrow the
  // current page client-side, which is why they say "this page".
  const [approvedPage, setApprovedPage] = useState(1);
  const [needsAssignmentOnly, setNeedsAssignmentOnly] = useState(false);
  const [search, setSearch] = useState('');

  // All three stay mounted so the tab badges can show live counts.
  const pendingQ = useB2BUsers('pending');
  const approvedQ = useB2BUsers('approved', approvedPage, APPROVED_PAGE_LIMIT);
  const rejectedQ = useB2BUsers('rejected');
  const activeQ = tab === 'pending' ? pendingQ : tab === 'approved' ? approvedQ : rejectedQ;

  const counts: Record<B2BStatus, number | undefined> = {
    pending: pendingQ.data?.total,
    approved: approvedQ.data?.total,
    rejected: rejectedQ.data?.total,
  };

  const companies = companiesQ.data?.items ?? [];
  const salesUsers = useMemo(
    () => (usersQ.data ?? []).filter((u) => u.role === 'sales' && u.isActive),
    [usersQ.data],
  );
  const salesUsersLoaded = usersQ.isSuccess;

  const visibleUsers = useMemo(() => {
    let list = activeQ.data?.items ?? [];
    if (tab === 'approved' && needsAssignmentOnly) {
      list = list.filter((u) => (u.assignedAdminIds ?? []).length === 0);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          `${u.firstName} ${u.lastName ?? ''}`.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.company?.name ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeQ.data, tab, needsAssignmentOnly, search]);

  const approvedTotal = approvedQ.data?.total ?? 0;
  const approvedTotalPages = Math.max(1, Math.ceil(approvedTotal / APPROVED_PAGE_LIMIT));

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Q&amp;E Assignments</h1>
        <p className="mt-1 text-sm text-slate">
          Sales people see only the quotations, leads and enquiries of the companies and B2B customers assigned to them.
        </p>
      </div>

      {/* ── B2B customers ──────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-xl border border-line bg-white/50 p-1">
            {TABS.map((t) => {
              const on = tab === t.key;
              const n = counts[t.key];
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  aria-current={on ? 'page' : undefined}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    on ? 'bg-indigo text-white' : 'text-slate hover:bg-white/70'
                  }`}
                >
                  {t.label}
                  {n !== undefined && (
                    <span
                      className={`ml-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                        on
                          ? 'bg-white/25 text-white'
                          : t.key === 'pending' && n > 0
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-black/[.05] text-slate'
                      }`}
                    >
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {tab === 'approved' && (
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate">
                <input
                  type="checkbox"
                  checked={needsAssignmentOnly}
                  onChange={(e) => setNeedsAssignmentOnly(e.target.checked)}
                  className="accent-indigo"
                />
                Needs assignment (this page)
              </label>
            )}
            <label className="sr-only" htmlFor="b2b-search">
              Filter customers on this page
            </label>
            <input
              id="b2b-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter this page…"
              className="w-56 rounded-lg border border-line bg-white/70 px-3 py-1.5 text-xs text-ink placeholder:text-muted focus:border-indigo focus:outline-none"
            />
          </div>
        </div>

        <p className="text-sm text-slate">{TAB_BLURB[tab]}</p>

        {activeQ.isError ? (
          <ErrorCard>Failed to load {tab} customers. Only Super Admin can view this page.</ErrorCard>
        ) : activeQ.isPending || usersQ.isPending ? (
          <SkeletonCard rows={4} />
        ) : !visibleUsers.length ? (
          <EmptyCard>
            {search.trim() || needsAssignmentOnly
              ? 'No customers match this filter on the current page.'
              : `No ${tab} B2B customers.`}
          </EmptyCard>
        ) : (
          <TableCard>
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate">
                <th className="w-[320px] px-5 py-3">Customer</th>
                <th className="px-5 py-3">Assigned sales people</th>
                <th className="w-[220px] px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u) => (
                <B2BUserRow key={u._id} user={u} salesUsers={salesUsers} salesUsersLoaded={salesUsersLoaded} />
              ))}
            </tbody>
          </TableCard>
        )}

        {tab === 'approved' && approvedQ.isSuccess && approvedTotal > 0 && (
          <div className="flex items-center justify-between text-xs text-slate">
            <span>
              Page {approvedPage} of {approvedTotalPages} &middot; {approvedTotal} approved total
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={approvedPage <= 1 || approvedQ.isFetching}
                onClick={() => setApprovedPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-line px-3 py-1.5 font-semibold text-slate disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={approvedPage >= approvedTotalPages || approvedQ.isFetching}
                onClick={() => setApprovedPage((p) => Math.min(approvedTotalPages, p + 1))}
                className="rounded-lg border border-line px-3 py-1.5 font-semibold text-slate disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Company portals ────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink">Company Portal Assignments</h2>
          <p className="mt-1 text-sm text-slate">
            Assign sales people to a company&apos;s bulk quotations &amp; merchandising enquiries. Changes save on click.
          </p>
        </div>

        {companiesQ.isError || usersQ.isError ? (
          <ErrorCard>Failed to load. Only Super Admin can view this page.</ErrorCard>
        ) : companiesQ.isPending || usersQ.isPending ? (
          <SkeletonCard rows={5} />
        ) : !companies.length ? (
          <EmptyCard>No companies yet.</EmptyCard>
        ) : (
          <TableCard>
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate">
                <th className="w-[320px] px-5 py-3">Company</th>
                <th className="px-5 py-3">Assigned sales people</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <CompanyRow key={c._id} company={c} salesUsers={salesUsers} />
              ))}
            </tbody>
          </TableCard>
        )}
      </section>
    </main>
  );
}
