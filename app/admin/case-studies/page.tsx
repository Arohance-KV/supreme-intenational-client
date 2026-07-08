'use client';

import { useState } from 'react';
import {
  useCaseStudies,
  useSaveCaseStudy,
  useDeleteCaseStudy,
  type CaseStudy,
} from '@/lib/admin/content';
import { AdminModal, Field, inputCls } from '@/components/admin/AdminModal';

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';

type Draft = { id?: string; title: string; industry: string; result: string; summary: string; coverImage: string; order: number; isPublished: boolean };
const EMPTY: Draft = { title: '', industry: '', result: '', summary: '', coverImage: '', order: 0, isPublished: false };

export default function AdminCaseStudiesPage() {
  const { data, isPending, isError } = useCaseStudies();
  const save = useSaveCaseStudy();
  const del = useDeleteCaseStudy();

  const [draft, setDraft] = useState<Draft | null>(null);
  const items = data ?? [];

  const openEdit = (c: CaseStudy) =>
    setDraft({ id: c._id, title: c.title, industry: c.industry, result: c.result, summary: c.summary, coverImage: c.coverImage, order: c.order, isPublished: c.isPublished });

  const submit = () => {
    if (!draft || !draft.title.trim()) return;
    save.mutate(draft, { onSuccess: () => setDraft(null) });
  };

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Case Studies</h1>
          <p className="mt-1 text-sm text-slate">Success stories shown on the website.</p>
        </div>
        <button onClick={() => setDraft({ ...EMPTY })} className="rounded-xl bg-gradient-to-br from-indigo to-indigo2 px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(42,43,106,.28)]">+ New case study</button>
      </div>

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load case studies.</div>
      ) : isPending ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className={`h-20 rounded-2xl animate-pulse ${GLASS}`} />)}</div>
      ) : !items.length ? (
        <div className={`rounded-2xl p-10 text-center ${GLASS}`}><p className="text-sm text-muted">No case studies yet.</p></div>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c._id} className={`flex items-center gap-4 rounded-2xl p-4 ${GLASS}`}>
              <span
                className="h-12 w-12 shrink-0 rounded-xl bg-cover bg-center"
                style={{ background: c.coverImage ? `center/cover no-repeat url('${c.coverImage}')` : 'repeating-linear-gradient(135deg,rgba(42,43,106,.07) 0 8px,rgba(42,43,106,.02) 8px 16px),linear-gradient(135deg,#e6eaf6,#dde2f1)' }}
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-ink truncate">{c.title}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs">
                  {c.industry && <span className="font-jbmono uppercase tracking-[.06em] text-accent">{c.industry}</span>}
                  {c.result && <span className="text-muted truncate">· {c.result}</span>}
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${c.isPublished ? 'bg-[rgba(31,170,107,.12)] text-[#1a8f5a]' : 'bg-black/[.05] text-muted'}`}>{c.isPublished ? 'Published' : 'Draft'}</span>
              <div className="flex items-center gap-3 text-xs">
                <button onClick={() => save.mutate({ id: c._id, isPublished: !c.isPublished })} className="rounded-[9px] bg-black/[.04] px-3 py-1.5 font-semibold text-slate hover:bg-black/[.07]">{c.isPublished ? 'Unpublish' : 'Publish'}</button>
                <button onClick={() => openEdit(c)} className="text-indigo hover:underline">Edit</button>
                <button onClick={() => del.mutate(c._id)} className="text-[#d8524d] hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal
        title={draft?.id ? 'Edit case study' : 'New case study'}
        open={!!draft}
        onClose={() => setDraft(null)}
        onSave={submit}
        saving={save.isPending}
      >
        {draft && (
          <>
            <Field label="Title"><input className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. 10,000 onboarding kits in 3 weeks" /></Field>
            <div className="flex gap-4">
              <Field label="Industry"><input className={inputCls} value={draft.industry} onChange={(e) => setDraft({ ...draft, industry: e.target.value })} placeholder="e.g. IT & Software" /></Field>
              <Field label="Order"><input type="number" className={inputCls} value={draft.order} onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) || 0 })} /></Field>
            </div>
            <Field label="Headline result"><input className={inputCls} value={draft.result} onChange={(e) => setDraft({ ...draft, result: e.target.value })} placeholder="e.g. Delivered nationwide in 3 weeks" /></Field>
            <Field label="Cover image URL"><input className={inputCls} value={draft.coverImage} onChange={(e) => setDraft({ ...draft, coverImage: e.target.value })} placeholder="https://…" /></Field>
            <Field label="Summary"><textarea className={`${inputCls} h-24 resize-none`} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} placeholder="Short description of the engagement and outcome…" /></Field>
            <label className="flex items-center gap-2 text-sm text-slate"><input type="checkbox" checked={draft.isPublished} onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })} /> Published on site</label>
          </>
        )}
      </AdminModal>
    </main>
  );
}
