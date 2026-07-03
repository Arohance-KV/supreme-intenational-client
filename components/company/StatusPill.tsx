type Variant = 'green' | 'grey' | 'amber';

const VARIANT_CLASS: Record<Variant, string> = {
  green: 'bg-[rgba(31,170,107,.12)] text-[#1a8f5a]',
  grey: 'bg-[rgba(91,93,122,.12)] text-slate',
  amber: 'bg-[rgba(224,163,59,.16)] text-[#b5801e]',
};

// Maps a raw status string (any casing) to a display variant. Extend as new
// statuses are introduced by Tasks 15-19; unknown statuses fall back to grey.
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

  shipped: 'grey',
  hidden: 'grey',
  closed: 'grey',
  draft: 'grey',
  inactive: 'grey',
  expired: 'grey',
  cancelled: 'grey',
  deactivated: 'grey',
  viewed: 'grey',
  archived: 'grey',

  pending: 'amber',
  processing: 'amber',
  'follow-up': 'amber',
  followup: 'amber',
  new: 'amber',
  submitted: 'amber',
  quoted: 'amber',
  invited: 'amber',
  generated: 'amber',
  sent: 'amber',
  in_progress: 'amber',
  refunded: 'amber',
};

export function StatusPill({ status }: { status: string }) {
  const variant = STATUS_VARIANT[status.toLowerCase()] ?? 'grey';
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${VARIANT_CLASS[variant]}`}
    >
      {status}
    </span>
  );
}
