'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

// Dashboards manage their own chrome — no marketing pop-ups there.
const HIDE = ['/admin', '/seller', '/employee', '/company'];

interface Popup {
  _id: string; title: string; message: string; imageUrl: string;
  ctaLabel: string; ctaUrl: string; trigger: 'immediate' | 'after_delay' | 'exit_intent'; delaySeconds: number;
}

const dismissKey = (id: string) => `popup-dismissed-${id}`;

// Fetches the active marketing pop-up and shows it once per browser (dismissal
// remembered in localStorage), honouring the admin-chosen trigger.
export default function SitePopupHost() {
  const pathname = usePathname();
  const hidden = HIDE.some((h) => pathname === h || pathname.startsWith(h + '/'));

  const [popup, setPopup] = useState<Popup | null>(null);
  const [visible, setVisible] = useState(false);

  // Load the top active pop-up (skip if already dismissed).
  useEffect(() => {
    if (hidden) return;
    let cancelled = false;
    apiFetch<Popup[]>('/content/popups/active')
      .then((list) => {
        const p = list?.[0];
        if (cancelled || !p || localStorage.getItem(dismissKey(p._id)) != null) return;
        setPopup(p);
        // 'immediate' resolves here (a promise callback, not a synchronous effect body).
        if (p.trigger === 'immediate') setVisible(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [hidden, pathname]);

  // Delay / exit-intent triggers — both fire from async callbacks, never synchronously.
  useEffect(() => {
    if (!popup) return;
    if (popup.trigger === 'after_delay') {
      const t = setTimeout(() => setVisible(true), Math.max(0, popup.delaySeconds) * 1000);
      return () => clearTimeout(t);
    }
    if (popup.trigger === 'exit_intent') {
      const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) setVisible(true); };
      document.addEventListener('mouseout', onLeave);
      return () => document.removeEventListener('mouseout', onLeave);
    }
  }, [popup]);

  if (!popup || !visible) return null;

  const close = () => {
    localStorage.setItem(dismissKey(popup._id), '1');
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 font-display" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[rgba(22,23,58,.5)] backdrop-blur-sm" onClick={close} />
      <div className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-3xl border border-white/85 bg-white shadow-[0_40px_100px_rgba(22,23,58,.4)]">
        <button onClick={close} aria-label="Close" className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-sm text-slate backdrop-blur hover:bg-black/20">✕</button>
        {popup.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={popup.imageUrl} alt="" className="h-44 w-full object-cover" />
        )}
        <div className="p-7 text-center">
          <h2 className="mb-2 text-[22px] font-extrabold tracking-[-.02em] text-ink">{popup.title}</h2>
          {popup.message && <p className="mb-6 text-[15px] leading-[1.6] text-slate">{popup.message}</p>}
          {popup.ctaLabel && popup.ctaUrl && (
            <Link
              href={popup.ctaUrl}
              onClick={close}
              className="inline-block rounded-[14px] bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-7 py-[13px] text-[15px] font-semibold text-white no-underline shadow-[0_12px_30px_rgba(42,43,106,.32)]"
            >
              {popup.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
