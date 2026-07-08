'use client';

import { ReactNode } from 'react';

export const inputCls =
  'w-full rounded-[11px] border border-line bg-white/80 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate">{label}</span>
      {children}
    </label>
  );
}

export function AdminModal({
  title,
  open,
  onClose,
  onSave,
  saving,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-[rgba(22,23,58,.42)] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[560px] max-w-full max-h-[90vh] overflow-auto rounded-3xl border border-white/85 bg-white/95 backdrop-blur-2xl shadow-[0_40px_100px_rgba(22,23,58,.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div className="text-lg font-extrabold tracking-tight text-ink">{title}</div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(42,43,106,.07)] text-sm text-slate hover:bg-[rgba(42,43,106,.12)]">✕</button>
        </div>
        <div className="space-y-4 p-6">{children}</div>
        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-line bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate hover:bg-white">Cancel</button>
          <button onClick={onSave} disabled={saving} className="rounded-xl bg-gradient-to-br from-indigo to-indigo2 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(42,43,106,.28)] disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
