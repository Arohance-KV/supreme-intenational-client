'use client';

/**
 * Generic status pill used across the admin dashboard.
 * Covers: order, submission, payout, seller, and quotation statuses.
 */

const STATUS_CLASS_MAP: Record<string, string> = {
  // ── Order statuses ────────────────────────────────────────────────────────
  pending:     'bg-amber-100 text-amber-700',
  confirmed:   'bg-blue-100 text-blue-700',
  processing:  'bg-indigo-100 text-indigo-700',
  shipped:     'bg-violet-100 text-violet-700',
  delivered:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-700',
  refunded:    'bg-zinc-100 text-zinc-600',

  // ── Submission statuses ───────────────────────────────────────────────────
  draft:       'bg-zinc-100 text-zinc-600',
  submitted:   'bg-amber-100 text-amber-700',
  approved:    'bg-green-100 text-green-700',
  rejected:    'bg-red-100 text-red-700',

  // ── Payout statuses (seller payout: pending → settled | voided) ──────────
  // 'pending' already covered by the shared amber entry above
  settled:     'bg-green-100 text-green-700',
  voided:      'bg-zinc-100 text-zinc-500',
  // Legacy / alternative payout status names kept for compatibility
  requested:   'bg-amber-100 text-amber-700',
  paid:        'bg-green-100 text-green-700',
  failed:      'bg-red-100 text-red-700',
  on_hold:     'bg-orange-100 text-orange-700',

  // ── Seller account statuses ───────────────────────────────────────────────
  active:      'bg-green-100 text-green-700',
  inactive:    'bg-zinc-100 text-zinc-500',
  suspended:   'bg-red-100 text-red-700',
  pending_review: 'bg-amber-100 text-amber-700',

  // ── Support ticket statuses (open → answered → closed; seller reply reopens) ─
  // 'open' is shared with the quotation entry below
  answered:    'bg-indigo-100 text-indigo-700',
  closed:      'bg-zinc-100 text-zinc-500',

  // ── Quotation statuses ────────────────────────────────────────────────────
  open:        'bg-blue-100 text-blue-700',
  quoted:      'bg-indigo-100 text-indigo-700',
  accepted:    'bg-green-100 text-green-700',
  declined:    'bg-red-100 text-red-700',
  expired:     'bg-zinc-100 text-zinc-500',
};

const FALLBACK = 'bg-zinc-100 text-zinc-600';

export interface StatusChipProps {
  status: string;
  /** Optional display label; falls back to the raw status string */
  label?: string;
}

export function StatusChip({ status, label }: StatusChipProps) {
  const cls = STATUS_CLASS_MAP[status] ?? FALLBACK;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {label ?? status}
    </span>
  );
}
