type Variant = 'green' | 'indigo' | 'teal' | 'amber' | 'slate';

const VARIANT_CLASS: Record<Variant, string> = {
  green: 'bg-[rgba(31,170,107,.12)] text-[#1a8f5a]',
  indigo: 'bg-[rgba(42,43,106,.1)] text-[#2a2b6a]',
  teal: 'bg-[rgba(23,155,142,.12)] text-[#127d72]',
  amber: 'bg-[rgba(224,163,59,.16)] text-[#b5801e]',
  slate: 'bg-[rgba(91,93,122,.12)] text-[#5b5d7a]',
};

// Maps a raw status string (any casing) to a display variant, per the exact
// color map in .superpowers/sdd/company-design-spec.md. Extend as new
// statuses are introduced; unknown statuses fall back to slate.
const STATUS_VARIANT: Record<string, Variant> = {
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

export function StatusPill({ status }: { status: string }) {
  const variant = STATUS_VARIANT[status.toLowerCase()] ?? 'slate';
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-[11px] py-1 text-[11px] font-bold capitalize ${VARIANT_CLASS[variant]}`}
    >
      {status}
    </span>
  );
}
