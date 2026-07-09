'use client';

import { useCompanies, useUpdateCompany, type AdminCompany } from '@/lib/admin/companies';
import { useAdminUsers, type AdminUser } from '@/lib/admin/users';

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

export default function AdminAssignmentsPage() {
  const companiesQ = useCompanies(1); // page 1; extend with pagination later if needed
  const usersQ = useAdminUsers();

  const companies = companiesQ.data?.items ?? [];
  const salesUsers = (usersQ.data ?? []).filter((u) => u.role === 'sales' && u.isActive);

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
    </main>
  );
}
