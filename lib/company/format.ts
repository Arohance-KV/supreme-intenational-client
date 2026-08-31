// Company formatting helpers now live in the shared lib/format.ts; re-exported
// here so existing `@/lib/company/format` imports keep working unchanged.
export { formatLakh, formatIN, formatDate, parsePointsInput, initials } from '@/lib/format';
