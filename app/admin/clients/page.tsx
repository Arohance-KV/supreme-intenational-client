'use client';

import { useState } from 'react';
import {
  useClientLogos,
  useSaveClientLogo,
  useDeleteClientLogo,
  type ClientLogo,
} from '@/lib/admin/content';
import { AdminModal, Field, inputCls } from '@/components/admin/AdminModal';

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';

type Draft = { id?: string; name: string; logoUrl: string; website: string; order: number; isActive: boolean };
const EMPTY: Draft = { name: '', logoUrl: '', website: '', order: 0, isActive: true };

export default function AdminClientsPage() {
  const { data, isPending, isError } = useClientLogos();
  const save = useSaveClientLogo();
  const del = useDeleteClientLogo();

  const [draft, setDraft] = useState<Draft | null>(null);
  const logos = data ?? [];

  const openNew = () => setDraft({ ...EMPTY });
  const openEdit = (c: ClientLogo) =>
    setDraft({ id: c._id, name: c.name, logoUrl: c.logoUrl, website: c.website, order: c.order, isActive: c.isActive });

  const submit = () => {
    if (!draft || !draft.name.trim()) return;
    save.mutate(draft, { onSuccess: () => setDraft(null) });
  };

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Clients &amp; Logos</h1>
          <p className="mt-1 text-sm text-slate">The logo wall shown on the marketing website.</p>
        </div>
        <button onClick={openNew} className="rounded-xl bg-gradient-to-br from-indigo to-indigo2 px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(42,43,106,.28)]">+ Add client</button>
      </div>

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load clients.</div>
      ) : isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className={`h-28 rounded-2xl animate-pulse ${GLASS}`} />)}
        </div>
      ) : !logos.length ? (
        <div className={`rounded-2xl p-10 text-center ${GLASS}`}><p className="text-sm text-muted">No client logos yet. Add your first one.</p></div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {logos.map((c) => (
            <div key={c._id} className={`relative flex flex-col items-center gap-2 rounded-2xl p-4 ${GLASS} ${c.isActive ? '' : 'opacity-60'}`}>
              <div className="flex h-14 w-full items-center justify-center">
                {c.logoUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={c.logoUrl} alt={c.name} className="max-h-14 max-w-full object-contain" />
                  : <span className="text-lg font-extrabold text-indigo">{c.name}</span>}
              </div>
              <span className="text-xs font-semibold text-ink truncate max-w-full">{c.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.isActive ? 'bg-[rgba(31,170,107,.12)] text-[#1a8f5a]' : 'bg-black/[.05] text-muted'}`}>{c.isActive ? 'Active' : 'Hidden'}</span>
              <div className="mt-1 flex gap-3 text-xs">
                <button onClick={() => openEdit(c)} className="text-indigo hover:underline">Edit</button>
                <button onClick={() => save.mutate({ id: c._id, isActive: !c.isActive })} className="text-slate hover:underline">{c.isActive ? 'Hide' : 'Show'}</button>
                <button onClick={() => del.mutate(c._id)} className="text-[#d8524d] hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal
        title={draft?.id ? 'Edit client' : 'Add client'}
        open={!!draft}
        onClose={() => setDraft(null)}
        onSave={submit}
        saving={save.isPending}
      >
        {draft && (
          <>
            <Field label="Client name"><input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. L&T Construction" /></Field>
            <Field label="Logo image URL"><input className={inputCls} value={draft.logoUrl} onChange={(e) => setDraft({ ...draft, logoUrl: e.target.value })} placeholder="https://…" /></Field>
            <Field label="Website (optional)"><input className={inputCls} value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} placeholder="https://…" /></Field>
            <div className="flex gap-4">
              <Field label="Order"><input type="number" className={inputCls} value={draft.order} onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) || 0 })} /></Field>
              <label className="flex items-end gap-2 pb-2.5 text-sm text-slate"><input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} /> Active on site</label>
            </div>
          </>
        )}
      </AdminModal>
    </main>
  );
}
