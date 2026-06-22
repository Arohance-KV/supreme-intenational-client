// Shared formatting helpers for admin pages.
// Keep this file free of React imports — pure TS utilities only.

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
