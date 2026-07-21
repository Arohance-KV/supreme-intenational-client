// Shared className constants for the employee portal (design-system utilities).
// ponytail: plain strings, not components — upgrade to components only if
// logic (not just classes) starts repeating.

export const glass =
  'bg-white/60 border border-white/85 backdrop-blur-[14px] backdrop-saturate-150 shadow-[0_12px_44px_rgba(34,36,90,.08)]';

export const primaryBtn =
  'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] text-white font-semibold rounded-[13px] shadow-[0_8px_22px_rgba(42,43,106,.3)] transition-shadow hover:shadow-[0_10px_28px_rgba(42,43,106,.4)] disabled:opacity-50 disabled:cursor-not-allowed';

export const secondaryBtn =
  'bg-white/60 text-indigo border border-white/85 font-semibold rounded-[13px] backdrop-blur-[8px] transition-colors hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed';

export const input =
  'w-full bg-white/65 border border-line rounded-[13px] px-3.5 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-indigo transition-colors';

export const label = 'block text-sm font-medium text-slate mb-1.5';

export const eyebrow =
  'font-jbmono text-[11px] uppercase tracking-[.14em] text-accent';

export const pageWrap =
  'mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 font-display';

export const errorBanner =
  'p-3 rounded-[13px] bg-[rgba(224,82,77,.1)] border border-[rgba(224,82,77,.3)] text-[#e0524d] text-sm';

// Pill classes per order/wallet status, mapped to DS status palette.
const STATUS_PILL: Record<string, string> = {
  pending:    'bg-[rgba(224,163,59,.14)] text-[#b5801e] border border-[rgba(224,163,59,.3)]',
  confirmed:  'bg-[rgba(42,43,106,.1)] text-indigo border border-[rgba(42,43,106,.2)]',
  processing: 'bg-[rgba(42,43,106,.1)] text-indigo border border-[rgba(42,43,106,.2)]',
  shipped:    'bg-[rgba(23,155,142,.12)] text-accent border border-[rgba(23,155,142,.25)]',
  delivered:  'bg-[rgba(31,170,107,.12)] text-[#1a8f5a] border border-[rgba(31,170,107,.25)]',
  cancelled:  'bg-[rgba(224,82,77,.1)] text-[#e0524d] border border-[rgba(224,82,77,.3)]',
  refunded:   'bg-white/60 text-muted border border-line',
};

export function statusPill(status: string): string {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-0.5 font-jbmono text-[10px] uppercase tracking-[.08em] font-medium capitalize';
  return `${base} ${STATUS_PILL[status] ?? STATUS_PILL.refunded}`;
}
