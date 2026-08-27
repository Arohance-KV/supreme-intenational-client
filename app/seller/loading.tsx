// Instant fallback for seller tab-to-tab navigation — see app/admin/loading.tsx.
// ponytail: shared spinner, no per-page skeletons.
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div
        className="h-11 w-11 animate-spin rounded-full border-[3px] border-black/10 border-t-[#149b8e]"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
