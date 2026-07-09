'use client';

// A polished two-series bar chart for the admin dashboards — stacked or grouped — with a
// y-axis + recessive gridlines, a legend, a per-bucket hover tooltip, and (stacked only) a
// selective total label. Single reusable component; the pages just map their data to
// { label, a, b } and pick a mode. No charting dependency — pure CSS, design-system tokens.

export interface SeriesPoint {
  label: string;
  a: number;
  b: number;
}

export interface SeriesDef {
  label: string;
  gradient: string; // vertical bar fill
  swatch: string; // solid legend/tooltip dot
}

const fmt = (n: number) => n.toLocaleString('en-IN');

// A "nice" gridline step (~4 intervals) for integer count data — floored at 1 so ticks are
// always whole numbers (avoids fractional labels that round to duplicates like 0,1,1,2).
function niceStep(range: number): number {
  const rough = Math.max(range, 1) / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const n = rough / pow;
  const s = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return Math.max(1, s * pow);
}

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${Math.round(n)}`);

function Legend({ a, b }: { a: SeriesDef; b: SeriesDef }) {
  return (
    <div className="flex items-center gap-4 text-[11px] text-slate">
      {[a, b].map((s) => (
        <span key={s.label} className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: s.swatch }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

export default function SeriesBarChart({
  points,
  a,
  b,
  mode,
  height = 210,
}: {
  points: SeriesPoint[];
  a: SeriesDef;
  b: SeriesDef;
  mode: 'stacked' | 'grouped';
  height?: number;
}) {
  if (points.length === 0) {
    return (
      <div className="flex items-center justify-center text-[13px] text-muted" style={{ height }}>
        No data for this period.
      </div>
    );
  }

  // Stacked scales to the tallest total; grouped to the tallest single value.
  const peak = mode === 'stacked'
    ? Math.max(...points.map((p) => p.a + p.b))
    : Math.max(...points.map((p) => Math.max(p.a, p.b)));
  const headroom = Math.max(peak, 1) / 0.82; // room so labels/tooltips clear the top bar
  const step = niceStep(headroom);
  const top = Math.ceil(headroom / step) * step;
  const ticks: number[] = [];
  for (let t = 0; t <= top + 1e-9; t += step) ticks.push(t);

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Legend a={a} b={b} />
      </div>

      <div className="relative pl-9" style={{ height }}>
        {/* gridlines + y-axis ticks */}
        {ticks.map((t) => (
          <div key={t} className="absolute left-9 right-0" style={{ bottom: `${(t / top) * 100}%` }}>
            <span className="absolute -left-9 -translate-y-1/2 text-[10px] text-muted" style={{ fontFamily: 'var(--font-jbmono)' }}>
              {compact(t)}
            </span>
            <div style={{ borderTop: t === 0 ? '1px solid var(--color-line)' : '1px dashed rgba(42,43,106,.10)' }} />
          </div>
        ))}

        {/* bars */}
        <div className="absolute inset-0 left-9 flex items-end justify-around gap-2">
          {points.map((p) => {
            const total = p.a + p.b;
            const segs = [
              { def: a, val: p.a },
              { def: b, val: p.b },
            ];
            return (
              <div key={p.label} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                {/* tooltip */}
                <div
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-2 text-left opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
                  style={{ background: '#1c1d44' }}
                >
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-white/50" style={{ fontFamily: 'var(--font-jbmono)' }}>
                    {p.label}
                  </span>
                  {segs.map((s) => (
                    <span key={s.def.label} className="flex items-center gap-1.5 text-[12px] text-white">
                      <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: s.def.swatch }} />
                      {s.def.label}: <strong>{fmt(s.val)}</strong>
                    </span>
                  ))}
                  {mode === 'stacked' && (
                    <span className="mt-1 block border-t border-white/15 pt-1 text-[12px] text-white">
                      Total: <strong>{fmt(total)}</strong>
                    </span>
                  )}
                </div>

                {mode === 'stacked' ? (
                  <>
                    {total > 0 && (
                      <span className="mb-1.5 text-[11px] font-bold text-ink opacity-80 transition-opacity group-hover:opacity-100">
                        {compact(total)}
                      </span>
                    )}
                    <div className="flex w-full max-w-[46px] flex-col gap-[2px]" style={{ height: `${(total / top) * 100}%` }}>
                      {segs.filter((s) => s.val > 0).map((s, i, arr) => (
                        <div
                          key={s.def.label}
                          className="w-full transition-all duration-150 group-hover:brightness-110"
                          style={{
                            height: `${(s.val / total) * 100}%`,
                            background: s.def.gradient,
                            borderRadius: `${i === 0 ? '8px 8px' : '0 0'} ${i === arr.length - 1 ? '2px 2px' : '0 0'}`,
                          }}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-end justify-center gap-1.5">
                    {segs.map((s) => (
                      <div
                        key={s.def.label}
                        className="w-[40%] max-w-[22px] shadow-[0_4px_12px_rgba(42,43,106,.16)] transition-all duration-150 group-hover:brightness-110"
                        style={{
                          height: `${Math.max((s.val / top) * 100, s.val > 0 ? 1.5 : 0)}%`,
                          background: s.def.gradient,
                          borderRadius: '6px 6px 2px 2px',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* x-axis labels aligned under the columns */}
      <div className="mt-2 flex justify-around gap-2 pl-9">
        {points.map((p) => (
          <span key={p.label} className="flex-1 truncate text-center text-[11px] font-medium text-slate" style={{ fontFamily: 'var(--font-jbmono)' }}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Shared 3M / 6M / 12M period toggle — drives the existing `months` query param.
const MONTH_OPTS = [3, 6, 12] as const;
export function MonthsFilter({ months, onChange }: { months: number; onChange: (m: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {MONTH_OPTS.map((m) => {
        const active = months === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors"
            style={
              active
                ? { color: '#fff', background: 'linear-gradient(135deg,#2a2b6a,#3a3c98)' }
                : { color: 'var(--color-slate)', background: 'rgba(255,255,255,.7)', border: '1px solid var(--color-line)' }
            }
          >
            {m}M
          </button>
        );
      })}
    </div>
  );
}
