// Shared className constants for the employee portal (design-system utilities).
// ponytail: plain strings, not components, upgrade to components only if
// logic (not just classes) starts repeating.

// input/label/errorBanner are byte-identical to the shared auth styles, reused
// from lib/authStyles.ts rather than kept as a divergent copy.
export { input, label, errorBanner } from '@/lib/authStyles';

export const glass =
  'bg-white/60 border border-white/85 backdrop-blur-[14px] backdrop-saturate-150 shadow-[0_12px_44px_rgba(34,36,90,.08)]';

export const primaryBtn =
  'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] text-white font-semibold rounded-[13px] shadow-[0_8px_22px_rgba(42,43,106,.3)] transition-shadow hover:shadow-[0_10px_28px_rgba(42,43,106,.4)] disabled:opacity-50 disabled:cursor-not-allowed';

export const secondaryBtn =
  'bg-white/60 text-indigo border border-white/85 font-semibold rounded-[13px] backdrop-blur-[8px] transition-colors hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed';

export const eyebrow =
  'font-jbmono text-[11px] uppercase tracking-[.14em] text-accent';

export const pageWrap =
  'mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 font-display';

// Order/wallet status pill moved to the shared <StatusChip tone="employee" />
// (components/StatusChip.tsx) so the status→color map lives in one place.
