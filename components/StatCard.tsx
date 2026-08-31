import type { ReactNode } from 'react';

/**
 * Glass KPI stat card used across the seller portal (dashboard + submissions).
 * Renders label / value / sub, with an optional `tone` class for the value.
 *
 * NOTE: this is intentionally distinct from components/company/StatCard.tsx,
 * which wraps the company <Card> (rounded-[20px], inline-style glass) and renders
 * a different DOM, and from the analytics KPI card (bg-white/90, no backdrop
 * blur, children-based). Those are separate visual designs, not this one.
 */
export function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: ReactNode;
  sub: string;
  tone?: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/80 bg-white/[.62] p-5 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]">
      <div className="font-jbmono mb-3 text-[10px] uppercase tracking-[.08em] text-muted">{label}</div>
      <div className={`text-[30px] font-extrabold tracking-[-.02em] ${tone ?? 'text-ink'}`}>{value}</div>
      <div className="mt-1.5 text-[11px] text-muted">{sub}</div>
    </div>
  );
}
