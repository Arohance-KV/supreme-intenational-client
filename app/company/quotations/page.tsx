'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '@/components/company/PageHeader';
import { Card } from '@/components/company/Card';
import { StatusPill } from '@/components/company/StatusPill';
import {
  useCompanyQuotations,
  useCompanyEnquiries,
  useRaiseEnquiry,
  type CompanyQuotation,
  type Enquiry,
} from '@/lib/company/quotations';
import { formatIN, formatDate } from '@/lib/company/format';
import { ApiError } from '@/lib/api';

function EnvelopeIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
      <path d="m3 5.5 7 5.5 7-5.5" />
    </svg>
  );
}

function QuotationRow({ quotation }: { quotation: CompanyQuotation }) {
  const itemCount = quotation.items.length;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 text-[13px] last:border-0">
      <div className="min-w-0">
        <p className="truncate text-[14px] font-bold text-ink">
          {itemCount} item{itemCount === 1 ? '' : 's'}
        </p>
        <p className="font-jbmono mt-1 truncate text-[12px] text-muted">
          {quotation.quotationNumber} · ₹{formatIN(quotation.total)}
        </p>
        <p className="mt-0.5 text-[11px] text-muted">{formatDate(quotation.createdAt)}</p>
      </div>
      <div className="flex flex-none items-center gap-3">
        <StatusPill status={quotation.status} />
        <a
          href={quotation.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="whitespace-nowrap text-[12px] font-bold text-indigo hover:underline"
        >
          View →
        </a>
      </div>
    </div>
  );
}

function EnquiryRow({ enquiry }: { enquiry: Enquiry }) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-5 py-4 text-[13px] last:border-0">
      <span
        className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px]"
        style={{ background: 'rgba(23,155,142,.12)', color: 'var(--color-accent)' }}
      >
        <EnvelopeIcon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-ink">{enquiry.subject}</p>
        <p className="mt-0.5 truncate text-[11px] capitalize text-muted">{enquiry.type}</p>
      </div>
      <div className="flex flex-none flex-col items-end gap-1">
        <StatusPill status={enquiry.status} />
        <span className="text-[11px] text-muted">{formatDate(enquiry.createdAt)}</span>
      </div>
    </div>
  );
}

function RaiseEnquiryModal({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const raiseEnquiry = useRaiseEnquiry();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    dialogRef.current?.querySelector<HTMLElement>('input')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    try {
      await raiseEnquiry.mutateAsync({
        subject: subject.trim(),
        message: message.trim() || undefined,
      });
      onSubmitted();
    } catch {
      // Surfaced inline below via raiseEnquiry.isError.
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
        aria-labelledby="raise-enquiry-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="raise-enquiry-title" className="text-[17px] font-bold text-ink">
          Raise Enquiry
        </h2>
        <p className="mt-1 text-[12px] text-muted">
          Send a merchandising enquiry to Supreme — bulk orders, custom branding, or anything
          else you need.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <div>
            <label htmlFor="re-subject" className="mb-1 block text-[12px] font-semibold text-slate">
              Subject
            </label>
            <input
              id="re-subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Bulk order for onboarding kits"
              className="w-full rounded-lg border border-line px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>
          <div>
            <label htmlFor="re-message" className="mb-1 block text-[12px] font-semibold text-slate">
              Message (optional)
            </label>
            <textarea
              id="re-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe what you need — quantities, timelines, branding…"
              className="w-full resize-none rounded-lg border border-line px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>

          {raiseEnquiry.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-[#d8524d]">
              {raiseEnquiry.error instanceof ApiError
                ? raiseEnquiry.error.message
                : 'Could not send the enquiry. Please try again.'}
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
              disabled={raiseEnquiry.isPending || !subject.trim()}
              className="rounded-lg px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#2a2b6a,#3a3c98)' }}
            >
              {raiseEnquiry.isPending ? 'Sending…' : 'Send Enquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CompanyQuotationsPage() {
  const quotationsQuery = useCompanyQuotations();
  const enquiriesQuery = useCompanyEnquiries();
  const [showRaise, setShowRaise] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);

  const quotations = useMemo(() => quotationsQuery.data?.items ?? [], [quotationsQuery.data]);
  const enquiries = useMemo(() => enquiriesQuery.data?.items ?? [], [enquiriesQuery.data]);

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-7">
      <PageHeader
        title="Quotations & Enquiries"
        subtitle="Bulk quotations and merchandising enquiries raised by your company."
        right={
          <button
            type="button"
            onClick={() => setShowRaise(true)}
            className="whitespace-nowrap rounded-xl px-4 py-[11px] text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg,#2a2b6a,#3a3c98)',
              boxShadow: '0 8px 20px rgba(42,43,106,.28)',
            }}
          >
            ＋ Raise Enquiry
          </button>
        }
      />

      {enquirySent && (
        <div
          className="mb-6 flex items-center justify-between gap-4 text-[13px] font-semibold text-[#1a8f5a]"
          style={{
            padding: '13px 16px',
            borderRadius: 14,
            background: 'rgba(31,170,107,.08)',
            border: '1px solid rgba(31,170,107,.25)',
          }}
        >
          <span>Your enquiry has been sent to Supreme. We&rsquo;ll be in touch soon.</span>
          <button
            type="button"
            onClick={() => setEnquirySent(false)}
            aria-label="Dismiss"
            className="text-[12px] font-bold text-[#1a8f5a] hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[14px] font-bold text-ink">Your quotations</h2>
          </div>

          {quotationsQuery.isError && (
            <p className="p-6 text-[13px] text-muted">Could not load quotations.</p>
          )}
          {quotationsQuery.isLoading && !quotationsQuery.data && (
            <p className="p-6 text-[13px] text-muted">Loading…</p>
          )}
          {!quotationsQuery.isLoading && !quotationsQuery.isError && quotations.length === 0 && (
            <p className="p-10 text-center text-[13px] text-muted">
              No quotations yet. Quotations raised for your company will appear here.
            </p>
          )}
          {quotations.length > 0 && (
            <div>
              {quotations.map((q) => (
                <QuotationRow key={q._id} quotation={q} />
              ))}
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[14px] font-bold text-ink">Merchandising enquiries</h2>
          </div>

          {enquiriesQuery.isError && (
            <p className="p-6 text-[13px] text-muted">Could not load enquiries.</p>
          )}
          {enquiriesQuery.isLoading && !enquiriesQuery.data && (
            <p className="p-6 text-[13px] text-muted">Loading…</p>
          )}
          {!enquiriesQuery.isLoading && !enquiriesQuery.isError && enquiries.length === 0 && (
            <p className="p-10 text-center text-[13px] text-muted">
              No enquiries yet. Raise one to get in touch with Supreme.
            </p>
          )}
          {enquiries.length > 0 && (
            <div>
              {enquiries.map((e) => (
                <EnquiryRow key={e._id} enquiry={e} />
              ))}
            </div>
          )}
        </Card>
      </div>

      {showRaise && (
        <RaiseEnquiryModal
          onClose={() => setShowRaise(false)}
          onSubmitted={() => {
            setShowRaise(false);
            setEnquirySent(true);
          }}
        />
      )}
    </div>
  );
}
