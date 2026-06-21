'use client';

import type { Submission } from '@/lib/seller/submissions';

const COLOR_MAP: Record<Submission['status'], string> = {
  draft: 'bg-zinc-100 text-zinc-600',
  submitted: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export function SubmissionStatusChip({ status }: { status: Submission['status'] }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${COLOR_MAP[status] ?? 'bg-zinc-100 text-zinc-600'}`}
    >
      {status}
    </span>
  );
}
