'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { AdminModal, Field, inputCls } from '@/components/admin/AdminModal';
import {
  useOpenings, useSaveOpening, useDeleteOpening, type JobOpening, type JobOpeningInput,
  useApplications, useUpdateApplicationStatus, useCreateApplication,
  type JobApplication, type ApplicationStatus,
} from '@/lib/admin/careers';

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';
const APP_STATUSES: ApplicationStatus[] = ['new', 'reviewing', 'shortlisted', 'rejected'];

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}
function errMsg(e: unknown): string {
  return e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Action failed.';
}

// ── Openings tab ────────────────────────────────────────────────────────────

type OpeningDraft = JobOpeningInput & { id?: string };
const EMPTY_OPENING: OpeningDraft = { title: '', department: '', location: '', employmentType: 'Full-time', description: '', isActive: true };

function OpeningsTab() {
  const { data, isPending, isError } = useOpenings();
  const save = useSaveOpening();
  const del = useDeleteOpening();
  const [draft, setDraft] = useState<OpeningDraft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const openings = data ?? [];

  const openNew = () => { setFormError(null); setDraft({ ...EMPTY_OPENING }); };
  const openEdit = (o: JobOpening) => {
    setFormError(null);
    setDraft({ id: o._id, title: o.title, department: o.department, location: o.location, employmentType: o.employmentType, description: o.description, isActive: o.isActive });
  };

  const submit = async () => {
    if (!draft) return;
    setFormError(null);
    const { id, ...input } = draft;
    if (!input.title.trim() || !input.department.trim() || !input.location.trim() || !input.description.trim()) {
      setFormError('Title, department, location and description are required.');
      return;
    }
    try { await save.mutateAsync({ id, input }); setDraft(null); }
    catch (e) { setFormError(errMsg(e)); }
  };

  const remove = async (o: JobOpening) => {
    if (!window.confirm(`Delete opening "${o.title}"?`)) return;
    setRowError(null);
    try { await del.mutateAsync(o._id); } catch (e) { setRowError(errMsg(e)); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate">{openings.length} opening{openings.length !== 1 ? 's' : ''} · what candidates see on the careers page</p>
        <button onClick={openNew} className="rounded-xl bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-bold text-white shadow-[0_8px_20px_rgba(42,43,106,.28)]">+ New opening</button>
      </div>

      {rowError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{rowError}</div>}
      {isError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load openings.</div>}
      {isPending && <div className={`rounded-2xl ${GLASS} p-8 text-center text-sm text-slate animate-pulse`}>Loading openings…</div>}

      {!isPending && !isError && openings.length === 0 && (
        <div className={`rounded-2xl ${GLASS} p-10 text-center text-sm text-slate`}>No openings yet. Add one to show it on the careers page.</div>
      )}

      {!isPending && openings.length > 0 && (
        <div className={`rounded-2xl ${GLASS} divide-y divide-line overflow-hidden`}>
          <div className="grid grid-cols-[1fr_160px_180px_100px_120px] gap-4 px-5 py-2 bg-white/50 text-xs font-semibold text-slate uppercase tracking-wider">
            <span>Title</span><span>Department</span><span>Location</span><span>Status</span><span>Actions</span>
          </div>
          {openings.map((o) => (
            <div key={o._id} className="grid grid-cols-[1fr_160px_180px_100px_120px] gap-4 items-center px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{o.title}</p>
                <p className="text-xs text-muted truncate">{o.employmentType}</p>
              </div>
              <span className="text-sm text-slate">{o.department}</span>
              <span className="text-xs text-slate">{o.location}</span>
              <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${o.isActive ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>{o.isActive ? 'Active' : 'Hidden'}</span>
              <div className="flex gap-2">
                <button onClick={() => openEdit(o)} className="text-xs font-medium text-indigo hover:underline">Edit</button>
                <button onClick={() => remove(o)} className="text-xs font-medium text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal
        title={draft?.id ? 'Edit opening' : 'New opening'}
        open={!!draft}
        onClose={() => setDraft(null)}
        onSave={submit}
        saving={save.isPending}
      >
        {draft && (
          <>
            {formError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</div>}
            <Field label="Title"><input className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Department"><input className={inputCls} value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })} /></Field>
              <Field label="Employment type"><input className={inputCls} value={draft.employmentType} onChange={(e) => setDraft({ ...draft, employmentType: e.target.value })} /></Field>
            </div>
            <Field label="Location"><input className={inputCls} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></Field>
            <Field label="Description"><textarea className={inputCls} rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={draft.isActive ?? true} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} />
              Active (visible on the careers page)
            </label>
          </>
        )}
      </AdminModal>
    </div>
  );
}

// ── Applications tab ──────────────────────────────────────────────────────────

type AppDraft = { fullName: string; email: string; isdCode: string; phoneNumber: string; position: string; coverLetter: string; resume: File | null };
const EMPTY_APP: AppDraft = { fullName: '', email: '', isdCode: '', phoneNumber: '', position: '', coverLetter: '', resume: null };

function ApplicationStatusCell({ id, status }: { id: string; status: ApplicationStatus }) {
  const update = useUpdateApplicationStatus();
  const [error, setError] = useState<string | null>(null);
  const current = APP_STATUSES.includes(status) ? status : 'new';
  return (
    <div className="flex flex-col gap-1">
      <select
        value={current}
        disabled={update.isPending}
        onChange={async (e) => {
          setError(null);
          try { await update.mutateAsync({ id, status: e.target.value as ApplicationStatus }); }
          catch (err) { setError(errMsg(err)); }
        }}
        className="rounded border border-line bg-white px-2 py-1 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
      >
        {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ApplicationsTab() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useApplications(page);
  const create = useCreateApplication();
  const [draft, setDraft] = useState<AppDraft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const apps = data?.items ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 20;
  const pages = Math.max(1, Math.ceil(total / limit));

  const submit = async () => {
    if (!draft) return;
    setFormError(null);
    if (!draft.fullName.trim() || !draft.email.trim() || !draft.position.trim()) {
      setFormError('Name, email and position are required.'); return;
    }
    if (!draft.resume) { setFormError('A PDF resume is required.'); return; }
    try {
      await create.mutateAsync({
        fullName: draft.fullName, email: draft.email, position: draft.position,
        isdCode: draft.isdCode || undefined, phoneNumber: draft.phoneNumber || undefined,
        coverLetter: draft.coverLetter || undefined, resume: draft.resume,
      });
      setDraft(null);
    } catch (e) { setFormError(errMsg(e)); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate">{total} application{total !== 1 ? 's' : ''}</p>
        <button onClick={() => { setFormError(null); setDraft({ ...EMPTY_APP }); }} className="rounded-xl bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-bold text-white shadow-[0_8px_20px_rgba(42,43,106,.28)]">+ Add application</button>
      </div>

      {isError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load applications.</div>}
      {isPending && <div className={`rounded-2xl ${GLASS} p-8 text-center text-sm text-slate animate-pulse`}>Loading applications…</div>}

      {!isPending && !isError && apps.length === 0 && (
        <div className={`rounded-2xl ${GLASS} p-10 text-center text-sm text-slate`}>No applications yet.</div>
      )}

      {!isPending && apps.length > 0 && (
        <div className={`rounded-2xl ${GLASS} divide-y divide-line overflow-hidden`}>
          <div className="grid grid-cols-[1fr_180px_140px_100px_120px] gap-4 px-5 py-2 bg-white/50 text-xs font-semibold text-slate uppercase tracking-wider">
            <span>Candidate</span><span>Position</span><span>Status</span><span>Resume</span><span>Applied</span>
          </div>
          {apps.map((a: JobApplication) => (
            <div key={a._id} className="grid grid-cols-[1fr_180px_140px_100px_120px] gap-4 items-center px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{a.fullName}</p>
                <p className="text-xs text-muted truncate">{a.email}{a.phoneNumber ? ` · ${a.isdCode ?? ''} ${a.phoneNumber}` : ''}</p>
              </div>
              <span className="text-sm text-slate truncate">{a.position}</span>
              <ApplicationStatusCell id={a._id} status={a.status} />
              <span>{a.resumeUrl ? <a href={a.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:underline">View PDF ↗</a> : <span className="text-xs text-muted">—</span>}</span>
              <span className="text-xs text-muted">{fmtDate(a.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate">Page {page} of {pages} · {total} applications</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40">Previous</button>
            <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded border border-line px-3 py-1 text-xs font-medium text-slate hover:bg-white/60 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      <AdminModal title="Add application" open={!!draft} onClose={() => setDraft(null)} onSave={submit} saving={create.isPending}>
        {draft && (
          <>
            {formError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</div>}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full name"><input className={inputCls} value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} /></Field>
              <Field label="Email"><input className={inputCls} type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ISD code"><input className={inputCls} value={draft.isdCode} onChange={(e) => setDraft({ ...draft, isdCode: e.target.value })} placeholder="+91" /></Field>
              <Field label="Phone"><input className={inputCls} value={draft.phoneNumber} onChange={(e) => setDraft({ ...draft, phoneNumber: e.target.value })} /></Field>
            </div>
            <Field label="Position"><input className={inputCls} value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value })} /></Field>
            <Field label="Cover letter"><textarea className={inputCls} rows={3} value={draft.coverLetter} onChange={(e) => setDraft({ ...draft, coverLetter: e.target.value })} /></Field>
            <Field label="Resume (PDF)"><input className={inputCls} type="file" accept="application/pdf" onChange={(e) => setDraft({ ...draft, resume: e.target.files?.[0] ?? null })} /></Field>
          </>
        )}
      </AdminModal>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminCareersPage() {
  const [tab, setTab] = useState<'openings' | 'applications'>('openings');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Careers</h1>
        <p className="mt-1 text-sm text-slate">Manage job openings shown on the careers page and review applications.</p>
      </div>

      <div className="flex gap-2">
        {(['openings', 'applications'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-indigo text-white' : 'bg-white/70 border border-line text-slate hover:bg-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'openings' ? <OpeningsTab /> : <ApplicationsTab />}
    </div>
  );
}
