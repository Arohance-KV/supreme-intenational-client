'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Animated replacement for window.confirm / window.alert. A single provider (mounted
// in app/providers.tsx) renders the dialog; useConfirm() exposes promise-based
// confirm()/alert() so call sites stay imperative: `if (!(await confirm({...}))) return;`.

type Tone = 'default' | 'danger';

export interface ConfirmOptions {
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
}

interface AlertOptions {
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  tone?: Tone;
}

interface DialogState extends ConfirmOptions {
  mode: 'confirm' | 'alert';
  resolve: (value: boolean) => void;
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  alert: (opts: AlertOptions) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmProvider>');
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setState({ mode: 'confirm', ...opts, resolve })),
    [],
  );
  const alert = useCallback(
    (opts: AlertOptions) =>
      new Promise<void>((resolve) => setState({ mode: 'alert', ...opts, resolve: () => resolve() })),
    [],
  );

  const close = useCallback((value: boolean) => {
    setState((s) => {
      s?.resolve(value);
      return null;
    });
  }, []);

  // Focus the confirm button and wire Escape (cancel) / Enter (confirm) while open.
  useEffect(() => {
    if (!state) return;
    confirmBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(false); }
      else if (e.key === 'Enter') { e.preventDefault(); close(true); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [state, close]);

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      {state && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-display animate-overlay-in bg-[rgba(22,23,58,.45)] backdrop-blur-[3px]"
          onClick={(e) => { if (e.target === e.currentTarget) close(false); }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={state.title ?? 'Confirm'}
            className="w-full max-w-sm animate-dialog-in rounded-[20px] border border-white/85 bg-white p-6 shadow-[0_40px_100px_rgba(22,23,58,.35)]"
          >
            {state.title && (
              <h2 className="mb-1.5 text-[17px] font-extrabold tracking-[-.01em] text-ink">{state.title}</h2>
            )}
            <div className="text-[13.5px] leading-[1.55] text-slate whitespace-pre-line">{state.message}</div>

            <div className="mt-6 flex justify-end gap-2.5">
              {state.mode === 'confirm' && (
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="rounded-[11px] border border-line px-4 py-2.5 text-[13px] font-semibold text-slate transition-colors hover:bg-[#f6f7fb]"
                >
                  {state.cancelLabel ?? 'Cancel'}
                </button>
              )}
              <button
                ref={confirmBtnRef}
                type="button"
                onClick={() => close(true)}
                className={`rounded-[11px] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-opacity hover:opacity-90 ${
                  state.tone === 'danger'
                    ? 'bg-[linear-gradient(135deg,#e0524d,#c0413c)]'
                    : 'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)]'
                }`}
              >
                {state.confirmLabel ?? (state.mode === 'alert' ? 'OK' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </ConfirmContext.Provider>
  );
}
