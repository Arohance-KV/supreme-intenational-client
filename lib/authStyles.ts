// Shared design-system auth-page styles (see DESIGN_SYSTEM.md). Single source
// so the auth pages (login, signup, company/login, seller/login, seller/apply,
// admin/login) don't each re-declare byte-identical strings.
//
// `input`, `label` and `errorBanner` are also re-exported from
// components/employee/ui.ts so the employee portal shares the exact same values
// instead of keeping a divergent copy.

export const mesh =
  'bg-[radial-gradient(60%_50%_at_12%_8%,rgba(74,76,201,.20),transparent_60%),radial-gradient(52%_46%_at_92%_12%,rgba(19,184,159,.18),transparent_60%),radial-gradient(46%_42%_at_78%_92%,rgba(124,77,210,.14),transparent_62%),linear-gradient(180deg,#eceefb,#f4f1f8,#e9f1f3)]';

export const card =
  'w-full max-w-md rounded-[24px] p-8 bg-white/60 border border-white/85 backdrop-blur-[14px] backdrop-saturate-150 shadow-[0_12px_44px_rgba(34,36,90,.08)]';

export const input =
  'w-full bg-white/65 border border-line rounded-[13px] px-3.5 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-indigo transition-colors';

export const label = 'block text-sm font-medium text-slate mb-1.5';

export const primaryBtn =
  'w-full rounded-[13px] py-3 bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] text-white text-sm font-semibold shadow-[0_8px_22px_rgba(42,43,106,.3)] transition-shadow hover:shadow-[0_10px_28px_rgba(42,43,106,.4)] disabled:opacity-50 disabled:cursor-not-allowed';

// Base error banner (no margin). Pages that need top margin compose
// `mb-4 ${errorBanner}` at the call site, matching the original per-page strings.
export const errorBanner =
  'p-3 rounded-[13px] bg-[rgba(224,82,77,.1)] border border-[rgba(224,82,77,.3)] text-[#e0524d] text-sm';
