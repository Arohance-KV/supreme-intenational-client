'use client';

import type { Submission } from '@/lib/seller/submissions';

// Design-system status colors (mockup `badge()`): amber = pending review,
// green = approved/live, red = rejected, slate = draft.
const COLOR_MAP: Record<Submission['status'], string> = {
  draft: 'text-slate bg-[rgba(91,93,122,.12)]',
  submitted: 'text-[#b5801e] bg-[rgba(224,163,59,.16)]',
  approved: 'text-[#1a8f5a] bg-[rgba(31,170,107,.12)]',
  rejected: 'text-[#d8524d] bg-[rgba(224,82,77,.12)]',
};

const LABEL: Record<Submission['status'], string> = {
  draft: 'Draft',
  submitted: 'In review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function SubmissionStatusChip({ status }: { status: Submission['status'] }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${COLOR_MAP[status] ?? COLOR_MAP.draft}`}
    >
      {LABEL[status] ?? status}
    </span>
  );
}
