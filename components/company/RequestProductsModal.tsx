'use client';

import { useEffect, useRef, useState } from 'react';
import { useRequestProducts } from '@/lib/company/products';
import { ApiError } from '@/lib/api';

// Shared "Request more products" dialog, used from the Store Products page and the
// Quotations & Enquiries page.
export function RequestProductsModal({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const requestProducts = useRequestProducts();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    dialogRef.current?.querySelector<HTMLElement>('textarea')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestProducts.mutateAsync({
        subject: subject.trim() || undefined,
        message: message.trim() || undefined,
        image: image ?? undefined,
      });
      onSubmitted();
    } catch {
      // Surfaced inline below via requestProducts.isError.
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-products-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="request-products-title" className="text-[17px] font-bold text-ink">
          Request more products
        </h2>
        <p className="mt-1 text-[12px] text-muted">
          Tell Supreme what you&rsquo;d like to see in your store. We&rsquo;ll curate and add it
          from the catalogue.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <div>
            <label htmlFor="rp-subject" className="mb-1 block text-[12px] font-semibold text-slate">
              Subject (optional)
            </label>
            <input
              id="rp-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. More apparel options"
              className="w-full rounded-lg border border-line px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>
          <div>
            <label htmlFor="rp-message" className="mb-1 block text-[12px] font-semibold text-slate">
              Message
            </label>
            <textarea
              id="rp-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the products or categories you'd like added…"
              className="w-full resize-none rounded-lg border border-line px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>
          <div>
            <label htmlFor="rp-image" className="mb-1 block text-[12px] font-semibold text-slate">
              Reference image (optional)
            </label>
            <input
              id="rp-image"
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-line px-3 py-2 text-[12px] text-slate file:mr-3 file:rounded-md file:border-0 file:bg-[#f0f1f8] file:px-3 file:py-1.5 file:text-[12px] file:font-semibold file:text-indigo"
            />
            {image && (
              <p className="mt-1 text-[11px] text-muted">
                {image.name} · {(image.size / 1024).toFixed(0)} KB
              </p>
            )}
          </div>

          {requestProducts.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-[#d8524d]">
              {requestProducts.error instanceof ApiError
                ? requestProducts.error.message
                : 'Could not send the request. Please try again.'}
            </p>
          )}

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-slate transition-colors hover:bg-[#f6f7fb]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requestProducts.isPending}
              className="rounded-lg px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#2a2b6a,#3a3c98)' }}
            >
              {requestProducts.isPending ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
