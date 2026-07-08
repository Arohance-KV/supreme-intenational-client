'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  useAdminUsers, useCreateUser, useUpdateUserRole, useUpdateUser, useSetUserActive, useDeleteUser,
  type AdminUser,
} from '@/lib/admin/users';
import { useAdminProfile } from '@/lib/admin/userAuth';
import { ROLE_LABEL, type Role } from '@/lib/admin/roles';
import { AdminModal, Field, inputCls } from '@/components/admin/AdminModal';

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';
const ROLES: Role[] = ['sales', 'marketing', 'finance', 'admin', 'superAdmin'];

// id present → editing an existing user (name/email); absent → creating (adds password + role).
type Draft = { id?: string; firstName: string; lastName: string; email: string; password: string; role: Role };
const EMPTY: Draft = { firstName: '', lastName: '', email: '', password: '', role: 'sales' };

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

const ROLE_CHIP: Record<Role, string> = {
  sales: 'bg-[rgba(37,99,235,.10)] text-[#2563eb]',
  marketing: 'bg-[rgba(217,70,160,.10)] text-[#c026a3]',
  finance: 'bg-[rgba(180,120,10,.12)] text-[#a16207]',
  admin: 'bg-[rgba(31,170,107,.12)] text-[#1a8f5a]',
  superAdmin: 'bg-[rgba(42,43,106,.10)] text-indigo',
};

export default function AdminUsersPage() {
  const { data, isPending, isError } = useAdminUsers();
  const { data: me } = useAdminProfile();
  const create = useCreateUser();
  const updateRole = useUpdateUserRole();
  const updateUser = useUpdateUser();
  const setActive = useSetUserActive();
  const del = useDeleteUser();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const users = data ?? [];

  const openNew = () => { setFormError(null); setDraft({ ...EMPTY }); };
  const openEdit = (u: AdminUser) => {
    setFormError(null);
    setDraft({ id: u._id, firstName: u.firstName, lastName: u.lastName ?? '', email: u.email, password: '', role: u.role });
  };

  const onRowError = (e: unknown) => setRowError(e instanceof ApiError ? e.message : 'Action failed.');

  const submit = () => {
    if (!draft) return;
    setFormError(null);
    const lastName = draft.lastName.trim() || undefined;

    if (draft.id) {
      if (!draft.firstName.trim() || !draft.email.trim()) {
        setFormError('Name and a valid email are required.');
        return;
      }
      updateUser.mutate(
        { id: draft.id, firstName: draft.firstName, lastName, email: draft.email },
        { onSuccess: () => setDraft(null), onError: (e) => setFormError(e instanceof ApiError ? e.message : 'Failed to save.') },
      );
      return;
    }

    if (!draft.firstName.trim() || !draft.email.trim() || draft.password.length < 8) {
      setFormError('Name, a valid email, and a password of at least 8 characters are required.');
      return;
    }
    create.mutate(
      { firstName: draft.firstName, lastName, email: draft.email, password: draft.password, role: draft.role },
      { onSuccess: () => setDraft(null), onError: (e) => setFormError(e instanceof ApiError ? e.message : 'Failed to create user.') },
    );
  };

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">User Management</h1>
          <p className="mt-1 text-sm text-slate">Create team members and assign what they can access. Sales, Marketing, Finance see only their sections; Admin and Super Admin see everything.</p>
        </div>
        <button onClick={openNew} className="shrink-0 rounded-xl bg-gradient-to-br from-indigo to-indigo2 px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(42,43,106,.28)]">+ Add user</button>
      </div>

      {rowError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{rowError}</span>
          <button onClick={() => setRowError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load users. (Only a Super Admin can view this page.)</div>
      ) : isPending ? (
        <div className={`rounded-2xl p-4 ${GLASS}`}>
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-lg animate-pulse bg-black/[.04] mb-2" />)}
        </div>
      ) : !users.length ? (
        <div className={`rounded-2xl p-10 text-center ${GLASS}`}><p className="text-sm text-muted">No users yet. Add your first team member.</p></div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${GLASS}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last login</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: AdminUser) => {
                const isSelf = me?._id === u._id;
                return (
                  <tr key={u._id} className={`border-b border-line/60 last:border-0 ${u.isActive ? '' : 'opacity-60'}`}>
                    <td className="px-5 py-3 font-semibold text-ink">
                      {[u.firstName, u.lastName].filter(Boolean).join(' ')}
                      {isSelf && <span className="ml-2 text-[10px] font-semibold text-muted">(you)</span>}
                    </td>
                    <td className="px-5 py-3 text-slate">{u.email}</td>
                    <td className="px-5 py-3">
                      <select
                        value={u.role}
                        disabled={updateRole.isPending}
                        onChange={(e) => updateRole.mutate({ id: u._id, role: e.target.value as Role }, { onError: onRowError })}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none ${ROLE_CHIP[u.role]}`}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${u.isActive ? 'bg-[rgba(31,170,107,.12)] text-[#1a8f5a]' : 'bg-black/[.06] text-muted'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted">{fmtDate(u.lastLoginAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-3 text-xs">
                        <button onClick={() => openEdit(u)} className="text-indigo hover:underline">Edit</button>
                        <button
                          onClick={() => setActive.mutate({ id: u._id, isActive: !u.isActive }, { onError: onRowError })}
                          disabled={isSelf || setActive.isPending}
                          className="text-slate hover:underline disabled:opacity-40 disabled:no-underline"
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete ${u.firstName}? This cannot be undone.`)) del.mutate(u._id, { onError: onRowError }); }}
                          disabled={isSelf || del.isPending}
                          className="text-[#d8524d] hover:underline disabled:opacity-40 disabled:no-underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal
        title={draft?.id ? 'Edit user' : 'Add user'}
        open={!!draft}
        onClose={() => setDraft(null)}
        onSave={submit}
        saving={create.isPending || updateUser.isPending}
      >
        {draft && (
          <>
            {formError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}
            <div className="flex gap-4">
              <Field label="First name"><input className={inputCls} value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} /></Field>
              <Field label="Last name (optional)"><input className={inputCls} value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} /></Field>
            </div>
            <Field label="Email"><input type="email" className={inputCls} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="person@company.com" /></Field>
            {!draft.id && (
              <>
                <Field label="Temporary password"><input type="text" className={inputCls} value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} placeholder="min 8 characters" /></Field>
                <Field label="Role">
                  <select className={inputCls} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })}>
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                  </select>
                </Field>
              </>
            )}
          </>
        )}
      </AdminModal>
    </main>
  );
}
