// Admin formatting helpers now live in the shared lib/format.ts; re-exported
// here so existing `@/lib/admin/format` imports keep working unchanged.
export { inr, fmtDate, fmtDateTime } from '@/lib/format';
