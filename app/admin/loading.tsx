// Instant fallback for admin tab-to-tab navigation. The AdminShell (sidebar/header)
// persists across routes, so this only fills the content area, Next shows it the
// moment a link is clicked and streams the real page in behind it, instead of
// blocking on the (sometimes cold) serverless RSC fetch. ponytail: shared spinner, no per-page skeletons.
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
