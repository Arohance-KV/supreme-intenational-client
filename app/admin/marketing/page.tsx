'use client';

import { useState } from 'react';
import {
  usePopups,
  useSavePopup,
  useDeletePopup,
  type SitePopup,
  type PopupTrigger,
} from '@/lib/admin/content';
import { AdminModal, Field, inputCls } from '@/components/admin/AdminModal';
import { fmtDate } from '@/lib/admin/format';

const GLASS = 'border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';

const TRIGGER_LABEL: Record<PopupTrigger, string> = {
  immediate: 'On page load',
  after_delay: 'After a delay',
  exit_intent: 'On exit intent',
};

type Draft = {
  id?: string; title: string; message: string; imageUrl: string; ctaLabel: string; ctaUrl: string;
  trigger: PopupTrigger; delaySeconds: number; isActive: boolean; startAt: string; endAt: string;
};
const EMPTY: Draft = { title: '', message: '', imageUrl: '', ctaLabel: '', ctaUrl: '', trigger: 'after_delay', delaySeconds: 20, isActive: false, startAt: '', endAt: '' };

function toDateInput(v: string | null): string {
  return v ? new Date(v).toISOString().slice(0, 10) : '';
}

export default function AdminMarketingPage() {
  const { data, isPending, isError } = usePopups();
  const save = useSavePopup();
  const del = useDeletePopup();

  const [draft, setDraft] = useState<Draft | null>(null);
  const items = data ?? [];

  const openEdit = (p: SitePopup) =>
    setDraft({
      id: p._id, title: p.title, message: p.message, imageUrl: p.imageUrl, ctaLabel: p.ctaLabel, ctaUrl: p.ctaUrl,
      trigger: p.trigger, delaySeconds: p.delaySeconds, isActive: p.isActive, startAt: toDateInput(p.startAt), endAt: toDateInput(p.endAt),
    });

  const submit = () => {
    if (!draft || !draft.title.trim()) return;
    const { startAt, endAt, ...rest } = draft;
    save.mutate({ ...rest, startAt: startAt || null, endAt: endAt || null }, { onSuccess: () => setDraft(null) });
  };

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Marketing</h1>
          <p className="mt-1 text-sm text-slate">Pop-ups shown automatically on the website — offers &amp; discounts.</p>
        </div>
        <button onClick={() => setDraft({ ...EMPTY })} className="rounded-xl bg-gradient-to-br from-indigo to-indigo2 px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(42,43,106,.28)]">+ New pop-up</button>
      </div>

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load pop-ups.</div>
      ) : isPending ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className={`h-20 rounded-2xl animate-pulse ${GLASS}`} />)}</div>
      ) : !items.length ? (
        <div className={`rounded-2xl p-10 text-center ${GLASS}`}><p className="text-sm text-muted">No pop-ups yet. Create one to promote an offer.</p></div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p._id} className={`flex items-center gap-4 rounded-2xl p-4 ${GLASS}`}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(42,43,106,.1)] text-lg text-indigo">📣</span>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-ink truncate">{p.title}</div>
                <div className="mt-0.5 text-xs text-muted">
                  {TRIGGER_LABEL[p.trigger]}{p.trigger === 'after_delay' ? ` (${p.delaySeconds}s)` : ''}
                  {(p.startAt || p.endAt) ? ` · ${fmtDate(p.startAt)} → ${p.endAt ? fmtDate(p.endAt) : '∞'}` : ''}
                </div>
              </div>
              <button
                onClick={() => save.mutate({ id: p._id, isActive: !p.isActive })}
                className="shrink-0"
                title={p.isActive ? 'Active — click to disable' : 'Inactive — click to enable'}
              >
                <span className="inline-flex h-[22px] w-[38px] items-center rounded-full p-0.5 transition-colors" style={{ background: p.isActive ? 'var(--c-accent, #149b8e)' : '#e6e7f2' }}>
                  <span className="h-[18px] w-[18px] rounded-full bg-white shadow transition-transform" style={{ transform: p.isActive ? 'translateX(16px)' : 'translateX(0)' }} />
                </span>
              </button>
              <div className="flex items-center gap-3 text-xs">
                <button onClick={() => openEdit(p)} className="text-indigo hover:underline">Edit</button>
                <button onClick={() => del.mutate(p._id)} className="text-[#d8524d] hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal
        title={draft?.id ? 'Edit pop-up' : 'New pop-up'}
        open={!!draft}
        onClose={() => setDraft(null)}
        onSave={submit}
        saving={save.isPending}
      >
        {draft && (
          <>
            <Field label="Title"><input className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Diwali 2026 — 15% off" /></Field>
            <Field label="Message"><textarea className={`${inputCls} h-20 resize-none`} value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} placeholder="Offer details shown in the pop-up…" /></Field>
            <Field label="Image URL (optional)"><input className={inputCls} value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="https://…" /></Field>
            <div className="flex gap-4">
              <Field label="Button label"><input className={inputCls} value={draft.ctaLabel} onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })} placeholder="Shop now" /></Field>
              <Field label="Button link"><input className={inputCls} value={draft.ctaUrl} onChange={(e) => setDraft({ ...draft, ctaUrl: e.target.value })} placeholder="/catalogue" /></Field>
            </div>
            <div className="flex gap-4">
              <Field label="Trigger">
                <select className={inputCls} value={draft.trigger} onChange={(e) => setDraft({ ...draft, trigger: e.target.value as PopupTrigger })}>
                  <option value="immediate">On page load</option>
                  <option value="after_delay">After a delay</option>
                  <option value="exit_intent">On exit intent</option>
                </select>
              </Field>
              {draft.trigger === 'after_delay' && (
                <Field label="Delay (seconds)"><input type="number" className={inputCls} value={draft.delaySeconds} onChange={(e) => setDraft({ ...draft, delaySeconds: Number(e.target.value) || 0 })} /></Field>
              )}
            </div>
            <div className="flex gap-4">
              <Field label="Start (optional)"><input type="date" className={inputCls} value={draft.startAt} onChange={(e) => setDraft({ ...draft, startAt: e.target.value })} /></Field>
              <Field label="End (optional)"><input type="date" className={inputCls} value={draft.endAt} onChange={(e) => setDraft({ ...draft, endAt: e.target.value })} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate"><input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} /> Active (shown on site)</label>
          </>
        )}
      </AdminModal>
    </main>
  );
}
