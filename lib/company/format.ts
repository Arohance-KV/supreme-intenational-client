// Shared formatting helpers for company pages.
// Keep this file free of React imports — pure TS utilities only.

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

/** Initials for an avatar, e.g. "Priya Sharma" -> "PS", "Ravi" -> "R". */
export function initials(name: unknown): string {
  if (typeof name !== 'string' || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + second).toUpperCase();
}
