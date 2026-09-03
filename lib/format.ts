// Shared formatting helpers (single source of truth). Previously split between
// lib/admin/format.ts and lib/company/format.ts; those now re-export from here.
// Keep this file free of React imports: pure TS utilities only.

/** Format a number as an INR amount with the ₹ prefix, or return '—' */
export function inr(n: unknown): string {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
}

/** Format an ISO date string as a short local date (no time), or return '—' */
export function fmtDate(v: unknown): string {
  if (!v) return '—';
  try {
    return new Date(v as string).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/** Format an ISO date string as a short local date + time, or return '—' */
export function fmtDateTime(v: unknown): string {
  if (!v) return '—';
  try {
    return new Date(v as string).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

/**
 * Format a number in the Indian numbering system, shortening to lakhs (1,00,000)
 * once it crosses that threshold, e.g. 2980000 -> "29.8L", 45000 -> "45,000".
 */
export function formatLakh(n: unknown): string {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—';
  if (Math.abs(n) >= 100000) {
    return `${(n / 100000).toFixed(1)}L`;
  }
  return n.toLocaleString('en-IN');
}

/** Format a number with Indian thousands separators (2,98,000), or return '—'. */
export function formatIN(n: unknown): string {
  return typeof n === 'number' && !Number.isNaN(n) ? n.toLocaleString('en-IN') : '—';
}

/** Format an ISO date string as "12 Jul 2026", or return '—' if invalid/missing. */
export function formatDate(iso: unknown): string {
  if (typeof iso !== 'string' || !iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Parse a points/price input string into a non-negative integer, or `null` if the
 * input is blank, negative, or not a finite number. `Number('')` and `Number('  ')`
 * both evaluate to `0`, so blank input must be rejected explicitly before coercion.
 */
export function parsePointsInput(value: string): number | null {
  if (value.trim() === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

/** Initials for an avatar, e.g. "Priya Sharma" -> "PS", "Ravi" -> "R". */
export function initials(name: unknown): string {
  if (typeof name !== 'string' || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + second).toUpperCase();
}
