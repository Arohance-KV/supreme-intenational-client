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
    <Card className="p-5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[.08em] text-muted">
        {label}
      </div>
      <div className={`text-[28px] font-extrabold tracking-[-.02em] ${tone}`}>{value}</div>
      {sub && <div className="mt-1 text-[12px] text-muted">{sub}</div>}
    </Card>
  );
}
