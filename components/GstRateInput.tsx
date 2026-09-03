'use client';

import { useState } from 'react';

/**
 * Controlled GST-rate input. GST is intentionally free-form 0–100 (not the old
 * fixed slabs), but a bare `<input type="number" min max>` doesn't actually stop
 * a typed `500` or `-3` (min/max only guard the spinner arrows) and snaps a
 * cleared field to 0 because `Number('') === 0`.
 *
 * This holds the raw text locally so the field can be empty mid-edit, only
 * commits in-range finite numbers to the parent, and on blur clamps to [0,100]
 * (falling back to the previous value when the text is empty or non-finite).
 */
function clampGst(n: number): number {
  return Math.min(100, Math.max(0, n));
}

export function GstRateInput({
  value,
  onChange,
  id,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  id?: string;
  className?: string;
}) {
  const [raw, setRaw] = useState<string>(String(value));

  // Re-sync the local text when the committed `value` changes from the outside
  // (async load, form reset) using React's render-phase "adjust state on prop
  // change" pattern, never clobbers in-progress typing, since it only fires
  // when `value` itself changes, not on every keystroke.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setRaw(String(value));
  }

  const commit = () => {
    const n = Number(raw);
    if (raw.trim() === '' || !Number.isFinite(n)) {
      setRaw(String(value)); // reject: restore previous committed value
      return;
    }
    const clamped = clampGst(n);
    setRaw(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  return (
    <input
      id={id}
      type="number"
      min={0}
      max={100}
      step="any"
      value={raw}
      onChange={(e) => {
        const next = e.target.value;
        setRaw(next);
        // Keep the parent current for valid, in-range input; never coerce empty
        // or out-of-range text (that's handled on blur).
        const n = Number(next);
        if (next.trim() !== '' && Number.isFinite(n) && n >= 0 && n <= 100) {
          onChange(n);
        }
      }}
      onBlur={commit}
      className={className}
    />
  );
}
