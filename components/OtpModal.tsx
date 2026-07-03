'use client';
import { useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api';
import { useRequestOtp, useVerifyOtp, type VerifyOtpResult } from '@/lib/otp';

interface OtpModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: (result: VerifyOtpResult) => void;
  /** The email to use for OTP. Typically the logged-in user's email or an entered email. */
  email: string;
}

export default function OtpModal({ open, onClose, onVerified, email }: OtpModalProps) {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [code, setCode] = useState('');
  const [requestError, setRequestError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const requestMutation = useRequestOtp();
  const verifyMutation = useVerifyOtp();
  const dialogRef = useRef<HTMLDivElement>(null);

  // L3: dialog a11y — Esc to close, autofocus, and a Tab focus trap so keyboard/AT users
  // can't escape the modal into the page behind it (WCAG 2.4.3 / 4.1.2).
  useEffect(() => {
    if (!open) return;
    const focusables = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, input, [href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute('disabled'));

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, step, onClose]);

  if (!open) return null;

  const handleSend = async () => {
    setRequestError(null);
    try {
      await requestMutation.mutateAsync({ email });
      setStep('verify');
    } catch (err) {
      setRequestError(
        err instanceof ApiError ? err.message : 'Failed to send OTP. Please try again.',
      );
    }
  };

  const handleVerify = async () => {
    setVerifyError(null);
    try {
      const result = await verifyMutation.mutateAsync({ email, code });
      onVerified(result);
      onClose();
    } catch (err) {
      setVerifyError(
        err instanceof ApiError ? err.message : 'Verification failed. Please try again.',
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="otp-modal-title"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="otp-modal-title" className="mb-1 text-lg font-semibold text-zinc-900">Verify your identity</h2>
        <p className="mb-5 text-sm text-zinc-500">
          {step === 'request'
            ? `We'll send a 6-digit code to ${email}.`
            : `Enter the 6-digit code sent to ${email}.`}
        </p>

        {step === 'request' && (
          <div className="flex flex-col gap-3">
            {requestError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{requestError}</p>
            )}
            <button
              onClick={handleSend}
              disabled={requestMutation.isPending}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {requestMutation.isPending ? 'Sending…' : 'Send OTP'}
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {verifyError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{verifyError}</p>
            )}
            <button
              onClick={handleVerify}
              disabled={code.length !== 6 || verifyMutation.isPending}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {verifyMutation.isPending ? 'Verifying…' : 'Verify'}
            </button>
            <button
              onClick={() => { setStep('request'); setCode(''); setVerifyError(null); }}
              className="text-sm text-blue-600 hover:underline"
            >
              Resend code
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
