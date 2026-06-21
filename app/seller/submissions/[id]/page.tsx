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

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: s, isLoading } = useSubmission(id);
  const submit = useSubmitSubmission(id);
  const revise = useReviseSubmission(id);
  const update = useUpdateSubmission(id);

  if (isLoading || !s) {
    return <main className="max-w-2xl mx-auto px-4 py-8 text-sm text-zinc-500">Loading…</main>;
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
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">{s.name}</h1>
        <SubmissionStatusChip status={s.status} />
      </div>

      {errorMessage && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => submit.mutate()}
              disabled={submit.isPending}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {submit.isPending ? 'Submitting…' : 'Submit for review'}
            </button>
            <Link
              href="/seller/submissions/new"
              className="text-sm text-zinc-500 hover:underline"
            >
              Create another
            </Link>
          </div>
        </div>
      )}

      {s.status === 'submitted' && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Your submission is under review. We will notify you once a decision has been made.
        </div>
      )}

      {s.status === 'rejected' && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 space-y-2">
          <p className="font-medium">Submission rejected</p>
          {s.rejectionReason && <p>{s.rejectionReason}</p>}
          <button
            onClick={() => revise.mutate()}
            disabled={revise.isPending}
            className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
          >
            {revise.isPending ? 'Reverting…' : 'Revise'}
          </button>
        </div>
      )}

      {s.status === 'approved' && (
        <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <p className="font-medium mb-1">Approved</p>
          <Link href="/seller/products" className="text-green-800 underline hover:no-underline">
            Manage this product →
          </Link>
        </div>
      )}

      {s.status !== 'draft' && (
        <div className="rounded border border-zinc-200 p-3 bg-white">
          <p className="text-sm font-semibold mb-2">Variants ({s.variants.length})</p>
          {s.variants.length === 0 && (
            <p className="text-xs text-zinc-400">No variants.</p>
          )}
          {s.variants.map((v, i) => (
            <div key={i} className="text-sm text-zinc-600 border-b border-zinc-100 py-1 last:border-0">
              <span className="font-mono text-xs">{v.sku}</span>
              {' · '}₹{v.price}
              {' · '}stock {v.stock}
              {' · '}MOQ {v.moq}
              {v.attributes.length > 0 &&
                ' · ' + v.attributes.map((a) => `${a.name}: ${a.value}`).join(', ')}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-zinc-400">
        Created {new Date(s.createdAt).toLocaleString()}
      </div>
    </main>
  );
}
