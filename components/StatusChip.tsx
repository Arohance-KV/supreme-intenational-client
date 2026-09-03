'use client';

/**
 * Single shared status pill for every portal. Historically the same
 * status→color idea was re-implemented five times with genuinely different
 * visual systems (Tailwind palette vs. bespoke rgba tokens, different padding,
 * weight, casing and label rules). Those systems render differently, so rather
 * than flatten them (which would silently change colors) each is preserved
 * verbatim behind a `tone` prop. Output is byte-identical to the originals.
 *
 *  tone="admin"        : admin dashboard (Tailwind palette, label = status.replace(/_/g,' '))
 *  tone="company"      : company portal (bespoke rgba variants, case-insensitive key)
 *  tone="seller"       : seller submission chip (draft/submitted/approved/rejected + custom labels)
 *  tone="employee"     : employee order/wallet status pill (jbmono, uppercase)
 *  tone="sellerAccount": seller dashboard account-status chip
 */

export type StatusTone = 'admin' | 'company' | 'seller' | 'employee' | 'sellerAccount';

// ── admin ───────────────────────────────────────────────────────────────────
const ADMIN_MAP: Record<string, string> = {
  // Order statuses
  pending:     'bg-amber-100 text-amber-700',
  confirmed:   'bg-blue-100 text-blue-700',
  processing:  'bg-indigo-100 text-indigo-700',
  shipped:     'bg-violet-100 text-violet-700',
  delivered:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-700',
  refunded:    'bg-zinc-100 text-zinc-600',
  // Submission statuses
  draft:       'bg-zinc-100 text-zinc-600',
  submitted:   'bg-amber-100 text-amber-700',
  approved:    'bg-green-100 text-green-700',
  rejected:    'bg-red-100 text-red-700',
  // Payout statuses
  settled:     'bg-green-100 text-green-700',
  voided:      'bg-zinc-100 text-zinc-500',
  requested:   'bg-amber-100 text-amber-700',
  paid:        'bg-green-100 text-green-700',
  failed:      'bg-red-100 text-red-700',
  on_hold:     'bg-orange-100 text-orange-700',
  // Seller account statuses
  active:      'bg-green-100 text-green-700',
  inactive:    'bg-zinc-100 text-zinc-500',
  suspended:   'bg-red-100 text-red-700',
  pending_review: 'bg-amber-100 text-amber-700',
  // Support ticket statuses
  answered:    'bg-indigo-100 text-indigo-700',
  closed:      'bg-zinc-100 text-zinc-500',
  // Quotation statuses
  open:        'bg-blue-100 text-blue-700',
  quoted:      'bg-indigo-100 text-indigo-700',
  accepted:    'bg-green-100 text-green-700',
  declined:    'bg-red-100 text-red-700',
  expired:     'bg-zinc-100 text-zinc-500',
  pending_approval: 'bg-amber-100 text-amber-700',
};
const ADMIN_FALLBACK = 'bg-zinc-100 text-zinc-600';

// ── company ───────────────────────────────────────────────────────────────────
type CompanyVariant = 'green' | 'indigo' | 'teal' | 'amber' | 'slate';
const COMPANY_VARIANT_CLASS: Record<CompanyVariant, string> = {
  green: 'bg-[rgba(31,170,107,.12)] text-[#1a8f5a]',
  indigo: 'bg-[rgba(42,43,106,.1)] text-[#2a2b6a]',
  teal: 'bg-[rgba(23,155,142,.12)] text-[#127d72]',
  amber: 'bg-[rgba(224,163,59,.16)] text-[#b5801e]',
  slate: 'bg-[rgba(91,93,122,.12)] text-[#5b5d7a]',
};
const COMPANY_STATUS_VARIANT: Record<string, CompanyVariant> = {
  delivered: 'green',
  active: 'green',
  approved: 'green',
  accepted: 'green',
  paid: 'green',
  settled: 'green',
  converted: 'green',
  resolved: 'green',
  confirmed: 'green',

  shipped: 'indigo',
  new: 'indigo',

  processing: 'teal',

  pending: 'amber',
  'pending approval': 'amber',
  'pending review': 'amber',
  'follow-up': 'amber',
  followup: 'amber',
  submitted: 'amber',
  quoted: 'amber',
  invited: 'amber',
  generated: 'amber',
  sent: 'amber',
  in_progress: 'amber',
  refunded: 'amber',

  hidden: 'slate',
  closed: 'slate',
  cancelled: 'slate',
  draft: 'slate',
  inactive: 'slate',
  expired: 'slate',
  deactivated: 'slate',
  viewed: 'slate',
  archived: 'slate',
};

// ── seller submission ─────────────────────────────────────────────────────────
const SELLER_COLOR_MAP: Record<string, string> = {
  draft: 'text-slate bg-[rgba(91,93,122,.12)]',
  submitted: 'text-[#b5801e] bg-[rgba(224,163,59,.16)]',
  approved: 'text-[#1a8f5a] bg-[rgba(31,170,107,.12)]',
  rejected: 'text-[#d8524d] bg-[rgba(224,82,77,.12)]',
};
const SELLER_LABEL: Record<string, string> = {
  draft: 'Draft',
  submitted: 'In review',
  approved: 'Approved',
  rejected: 'Rejected',
};

// ── employee order/wallet pill ────────────────────────────────────────────────
const EMPLOYEE_MAP: Record<string, string> = {
  pending:    'bg-[rgba(224,163,59,.14)] text-[#b5801e] border border-[rgba(224,163,59,.3)]',
  confirmed:  'bg-[rgba(42,43,106,.1)] text-indigo border border-[rgba(42,43,106,.2)]',
  processing: 'bg-[rgba(42,43,106,.1)] text-indigo border border-[rgba(42,43,106,.2)]',
  shipped:    'bg-[rgba(23,155,142,.12)] text-accent border border-[rgba(23,155,142,.25)]',
  delivered:  'bg-[rgba(31,170,107,.12)] text-[#1a8f5a] border border-[rgba(31,170,107,.25)]',
  cancelled:  'bg-[rgba(224,82,77,.1)] text-[#e0524d] border border-[rgba(224,82,77,.3)]',
  refunded:   'bg-white/60 text-muted border border-line',
};

// ── seller dashboard account chip ─────────────────────────────────────────────
const SELLER_ACCOUNT_MAP: Record<string, string> = {
  pending: 'text-[#b5801e] bg-[rgba(224,163,59,.16)]',
  active: 'text-[#1a8f5a] bg-[rgba(31,170,107,.12)]',
  rejected: 'text-[#d8524d] bg-[rgba(224,82,77,.12)]',
  suspended: 'text-slate bg-[rgba(91,93,122,.12)]',
};

export interface StatusChipProps {
  status: string;
  /** Optional display label; behavior depends on tone (see below). */
  label?: string;
  /** Visual family; defaults to the admin dashboard styling. */
  tone?: StatusTone;
}

export function StatusChip({ status, label, tone = 'admin' }: StatusChipProps) {
  if (tone === 'company') {
    const variant = COMPANY_STATUS_VARIANT[status.toLowerCase()] ?? 'slate';
    return (
      <span
        className={`inline-flex items-center whitespace-nowrap rounded-full px-[11px] py-1 text-[11px] font-bold capitalize ${COMPANY_VARIANT_CLASS[variant]}`}
      >
        {status}
      </span>
    );
  }

  if (tone === 'seller') {
    return (
      <span
        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${SELLER_COLOR_MAP[status] ?? SELLER_COLOR_MAP.draft}`}
      >
        {SELLER_LABEL[status] ?? status}
      </span>
    );
  }

  if (tone === 'employee') {
    const base =
      'inline-flex items-center rounded-full px-2.5 py-0.5 font-jbmono text-[10px] uppercase tracking-[.08em] font-medium capitalize';
    return (
      <span className={`${base} ${EMPLOYEE_MAP[status] ?? EMPLOYEE_MAP.refunded}`}>{status}</span>
    );
  }

  if (tone === 'sellerAccount') {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${SELLER_ACCOUNT_MAP[status] ?? SELLER_ACCOUNT_MAP.suspended}`}
      >
        {status}
      </span>
    );
  }

  // tone === 'admin' (default)
  const cls = ADMIN_MAP[status] ?? ADMIN_FALLBACK;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {label ?? status.replace(/_/g, ' ')}
    </span>
  );
}
