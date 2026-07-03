import { Card } from './Card';

export function StatCard({
  label,
  value,
  sub,
  tone = 'text-ink',
}: {
  label: string;
  value: string;
  sub?: string;
  /** Text color class for the value, e.g. `text-accent` for a positive figure. */
  tone?: string;
}) {
  return (
    <Card className="rounded-[18px] p-5">
      <div
        className="mb-3 text-[10px] tracking-[.08em] uppercase text-muted"
        style={{ fontFamily: 'var(--font-jbmono)' }}
      >
        {label}
      </div>
      <div className={`text-[30px] font-extrabold tracking-[-.02em] ${tone}`}>{value}</div>
      {sub && <div className="mt-[5px] text-[11px] text-muted">{sub}</div>}
    </Card>
  );
}
