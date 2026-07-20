'use client';

import { useEffect, useRef, useState } from 'react';
import { useCompanies, useUpdateCompany, type AdminCompany } from '@/lib/admin/companies';
import { useAdminUsers, type AdminUser } from '@/lib/admin/users';
import { useB2BUsers, useSetB2BApproval, type B2BUser } from '@/lib/admin/b2bUsers';

const APPROVED_PAGE_LIMIT = 20;

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';

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
    <tr className="border-b border-line/60 last:border-0">
      <td className="px-5 py-3 align-top font-semibold text-ink">{company.name}</td>
      <td className="px-5 py-3">
        {salesUsers.length === 0 ? (
          <span className="text-sm text-muted">No sales users yet</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {salesUsers.map((u) => {
              const on = assigned.includes(u._id);
              return (
                <label
                  key={u._id}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    on ? 'border-indigo bg-indigo/10 text-indigo' : 'border-line text-slate hover:bg-white/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={update.isPending}
                    onChange={() => toggle(u._id)}
                    className="accent-indigo"
                  />
                  {u.firstName} {u.lastName ?? ''}
                </label>
              );
            })}
          </div>
        )}
        {update.isError && <p className="mt-1.5 text-xs text-red-600">Save failed — try again.</p>}
      </td>
    </tr>
  );
}

// One row: a pending, approved, or rejected B2B signup with a checkbox list of sales
// users. Unlike CompanyRow, approval is a single explicit submit (Approve/Reject)
// rather than a per-checkbox autosave, so selection lives in local state until then.
function PendingB2BRow({
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

  return (
    <tr className="border-b border-line/60 last:border-0">
      <td className="px-5 py-3 align-top">
        <div className="font-semibold text-ink">{user.firstName} {user.lastName ?? ''}</div>
        <div className="text-xs text-slate">{user.email}</div>
        {user.company?.name && <div className="text-xs text-muted">{user.company.name}</div>}
      </td>
      <td className="px-5 py-3">
        {salesUsers.length === 0 ? (
          <span className="text-sm text-muted">No sales users yet</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {salesUsers.map((u) => {
              const on = selected.includes(u._id);
              return (
                <label
                  key={u._id}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    on ? 'border-indigo bg-indigo/10 text-indigo' : 'border-line text-slate hover:bg-white/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={approve.isPending}
                    onChange={() => toggle(u._id)}
                    className="accent-indigo"
                  />
                  {u.firstName} {u.lastName ?? ''}
                </label>
              );
            })}
          </div>
        )}
        {approve.isError && <p className="mt-1.5 text-xs text-red-600">Save failed — try again.</p>}
      </td>
      <td className="px-5 py-3 align-top">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={selected.length === 0 || approve.isPending}
            onClick={() => approve.mutate({ status: 'approved', assignedAdminIds: selected })}
            className="rounded-lg bg-indigo px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={approve.isPending}
            // No assignedAdminIds here: rejecting is a permission change only and the
            // server now leaves existing assignments untouched (see b2bUser.service.ts).
            onClick={() => approve.mutate({ status: 'rejected' })}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-slate disabled:opacity-40"
          >
            Reject
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminAssignmentsPage() {
  const companiesQ = useCompanies(1); // page 1; extend with pagination later if needed
  const usersQ = useAdminUsers();
  const pendingQ = useB2BUsers('pending');
  // Important 5: after the b2bStatus migration, every legacy customer lands here
  // approved-with-no-assignee and invisible to sales until swept. Real (server-side)
  // pagination makes every one of them reachable regardless of count; the "needs
  // assignment" toggle below narrows straight to the ones that actually need action,
  // filtered client-side against just the current page since the unassigned count
  // isn't cheap to query separately without adding a new backend filter.
  const [approvedPage, setApprovedPage] = useState(1);
  const [needsAssignmentOnly, setNeedsAssignmentOnly] = useState(false);
  const approvedQ = useB2BUsers('approved', approvedPage, APPROVED_PAGE_LIMIT);
  const rejectedQ = useB2BUsers('rejected');

  const companies = companiesQ.data?.items ?? [];
  const salesUsers = (usersQ.data ?? []).filter((u) => u.role === 'sales' && u.isActive);
  const salesUsersLoaded = usersQ.isSuccess;
  const pendingUsers = pendingQ.data?.items ?? [];
  const rejectedUsers = rejectedQ.data?.items ?? [];
  const approvedUsersRaw = approvedQ.data?.items ?? [];
  const approvedUsers = needsAssignmentOnly
    ? approvedUsersRaw.filter((u) => (u.assignedAdminIds ?? []).length === 0)
    : approvedUsersRaw;
  const approvedTotal = approvedQ.data?.total ?? 0;
  const approvedTotalPages = Math.max(1, Math.ceil(approvedTotal / APPROVED_PAGE_LIMIT));

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Q&amp;E Assignments</h1>
        <p className="mt-1 text-sm text-slate">
          Assign sales people to a company&apos;s bulk quotations &amp; merchandising enquiries. Assignees see only their companies&apos; Q&amp;E.
        </p>
      </div>

      {companiesQ.isError || usersQ.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load. Only Super Admin can view this page.
        </div>
      ) : companiesQ.isPending || usersQ.isPending ? (
        <div className={`rounded-2xl p-4 ${GLASS}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-2 h-12 animate-pulse rounded-lg bg-black/[.04]" />
          ))}
        </div>
      ) : !companies.length ? (
        <div className={`rounded-2xl p-10 text-center ${GLASS}`}>
          <p className="text-sm text-muted">No companies yet.</p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${GLASS}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate">
                <th className="w-1/4 px-5 py-3">Company</th>
                <th className="px-5 py-3">Assigned sales people</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <CompanyRow key={c._id} company={c} salesUsers={salesUsers} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-ink">B2B Signups Awaiting Approval</h2>
        <p className="mt-1 text-sm text-slate">
          Approve a signup with at least one assigned sales person, or reject to deny quotation access.
        </p>
      </div>

      {pendingQ.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load pending signups.
        </div>
      ) : pendingQ.isPending || usersQ.isPending ? (
        <div className={`rounded-2xl p-4 ${GLASS}`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-2 h-12 animate-pulse rounded-lg bg-black/[.04]" />
          ))}
        </div>
      ) : !pendingUsers.length ? (
        <div className={`rounded-2xl p-10 text-center ${GLASS}`}>
          <p className="text-sm text-muted">No pending signups.</p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${GLASS}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate">
                <th className="w-1/4 px-5 py-3">Customer</th>
                <th className="px-5 py-3">Assign to sales</th>
                <th className="w-40 px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u) => (
                <PendingB2BRow key={u._id} user={u} salesUsers={salesUsers} salesUsersLoaded={salesUsersLoaded} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink">Approved B2B Customers</h2>
          <p className="mt-1 text-sm text-slate">
            Edit sales assignments, or reject to revoke a customer&apos;s quotation access.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate">
          <input
            type="checkbox"
            checked={needsAssignmentOnly}
            onChange={(e) => setNeedsAssignmentOnly(e.target.checked)}
            className="accent-indigo"
          />
          Needs assignment only (this page)
        </label>
      </div>

      {approvedQ.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load approved customers.
        </div>
      ) : approvedQ.isPending || usersQ.isPending ? (
        <div className={`rounded-2xl p-4 ${GLASS}`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-2 h-12 animate-pulse rounded-lg bg-black/[.04]" />
          ))}
        </div>
      ) : !approvedUsers.length ? (
        <div className={`rounded-2xl p-10 text-center ${GLASS}`}>
          <p className="text-sm text-muted">
            {needsAssignmentOnly ? 'No unassigned customers on this page.' : 'No approved B2B customers yet.'}
          </p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${GLASS}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate">
                <th className="w-1/4 px-5 py-3">Customer</th>
                <th className="px-5 py-3">Assign to sales</th>
                <th className="w-40 px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedUsers.map((u) => (
                <PendingB2BRow key={u._id} user={u} salesUsers={salesUsers} salesUsersLoaded={salesUsersLoaded} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {approvedQ.isSuccess && approvedTotal > 0 && (
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

      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-ink">Rejected B2B Customers</h2>
        <p className="mt-1 text-sm text-slate">
          Rejection is reversible — assign at least one sales person and hit Approve to reinstate quotation access.
        </p>
      </div>

      {rejectedQ.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load rejected customers.
        </div>
      ) : rejectedQ.isPending || usersQ.isPending ? (
        <div className={`rounded-2xl p-4 ${GLASS}`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-2 h-12 animate-pulse rounded-lg bg-black/[.04]" />
          ))}
        </div>
      ) : !rejectedUsers.length ? (
        <div className={`rounded-2xl p-10 text-center ${GLASS}`}>
          <p className="text-sm text-muted">No rejected B2B customers.</p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${GLASS}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate">
                <th className="w-1/4 px-5 py-3">Customer</th>
                <th className="px-5 py-3">Assign to sales</th>
                <th className="w-40 px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rejectedUsers.map((u) => (
                <PendingB2BRow key={u._id} user={u} salesUsers={salesUsers} salesUsersLoaded={salesUsersLoaded} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
