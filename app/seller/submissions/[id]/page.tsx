'use client';
import { use } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import {
  useSubmission,
  useSubmitSubmission,
  useReviseSubmission,
  useUpdateSubmission,
  type SubmissionInput,
} from '@/lib/seller/submissions';
import { SubmissionStatusChip } from '@/components/seller/SubmissionStatusChip';
import { SubmissionForm } from '@/components/seller/SubmissionForm';

const card =
  'rounded-[18px] border border-white/80 bg-white/[.62] p-5 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]';

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: s, isLoading } = useSubmission(id);
  const submit = useSubmitSubmission(id);
  const revise = useReviseSubmission(id);
  const update = useUpdateSubmission(id);

  if (isLoading || !s) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8 sm:py-7">
        <div className="h-64 animate-pulse rounded-[18px] bg-white/55" />
      </div>
    );
  }

  const mutationError = (submit.isError && submit.error)
    || (revise.isError && revise.error)
    || (update.isError && update.error);
  const errorMessage = mutationError instanceof ApiError
    ? mutationError.message
    : mutationError instanceof Error
      ? mutationError.message
      : null;

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-6 py-6 sm:px-8 sm:py-7">
      <div>
        <Link
          href="/seller/submissions"
          className="mb-2 inline-block text-[13px] font-medium text-slate no-underline hover:text-ink"
        >
          ← Submissions
        </Link>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[26px] font-extrabold tracking-[-.02em] text-ink">{s.name}</h1>
          <SubmissionStatusChip status={s.status} />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-[14px] border border-[rgba(216,82,77,.25)] bg-[rgba(216,82,77,.08)] px-4 py-3 text-sm text-[#d8524d]">
          {errorMessage}
        </div>
      )}

      {s.status === 'draft' && (
        <div className="space-y-4">
          <SubmissionForm
            initial={s}
            submitLabel="Save changes"
            submitting={update.isPending}
            onSubmit={(input: SubmissionInput) => update.mutate(input)}
          />
          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={() => submit.mutate()}
              disabled={submit.isPending}
              className="rounded-xl bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-[18px] py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(42,43,106,.28)] disabled:opacity-60"
            >
              {submit.isPending ? 'Submitting…' : 'Submit for review'}
            </button>
            <Link
              href="/seller/submissions/new"
              className="text-sm font-medium text-slate no-underline hover:text-ink hover:underline"
            >
              Create another
            </Link>
          </div>
        </div>
      )}

      {s.status === 'submitted' && (
        <div className="rounded-[14px] border border-[rgba(217,119,6,.25)] bg-[rgba(217,119,6,.08)] px-4 py-3 text-sm text-amber-700">
          Your submission is under review. We will notify you once a decision has been made.
        </div>
      )}

      {s.status === 'rejected' && (
        <div className="space-y-2 rounded-[14px] border border-[rgba(216,82,77,.25)] bg-[rgba(216,82,77,.08)] px-4 py-3 text-sm text-[#d8524d]">
          <p className="font-semibold">Submission rejected</p>
          {s.rejectionReason && <p>{s.rejectionReason}</p>}
          <button
            onClick={() => revise.mutate()}
            disabled={revise.isPending}
            className="rounded-[10px] bg-[#d8524d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#c4463f] disabled:opacity-60"
          >
            {revise.isPending ? 'Reverting…' : 'Revise'}
          </button>
        </div>
      )}

      {s.status === 'approved' && (
        <div className="rounded-[14px] border border-[rgba(26,143,90,.25)] bg-[rgba(31,170,107,.1)] px-4 py-3 text-sm text-[#1a8f5a]">
          <p className="mb-1 font-semibold">Approved</p>
          <Link href="/seller/products" className="font-medium text-[#176054] underline hover:no-underline">
            Manage this product →
          </Link>
        </div>
      )}

      {s.status !== 'draft' && (
        <div className={card}>
          <p className="mb-3 text-[15px] font-bold text-ink">Variants ({s.variants.length})</p>
          {s.variants.length === 0 && (
            <p className="text-xs text-muted">No variants.</p>
          )}
          {s.variants.map((v, i) => (
            <div key={i} className="border-b border-line py-2 text-sm text-slate last:border-0">
              <span className="font-jbmono text-xs text-ink">{v.sku}</span>
              {' · '}₹{v.price}
              {' · '}stock {v.stock}
              {' · '}MOQ {v.moq}
              {v.attributes.length > 0 &&
                ' · ' + v.attributes.map((a) => `${a.name}: ${a.value}`).join(', ')}
            </div>
          ))}
        </div>
      )}

      <div className="font-jbmono text-[11px] text-muted">
        Created {new Date(s.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
