// Global fallback for any route without its own loading.tsx. Kept layout-agnostic
// on purpose: a product-grid skeleton mismatched every non-products page.
export default function Loading() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#eef0f8]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(20,155,142,.16),transparent_60%),radial-gradient(50%_45%_at_0%_6%,rgba(58,60,152,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />
      <div
        className="relative z-[1] h-12 w-12 animate-spin rounded-full border-[3px] border-white/50 border-t-[#149b8e]"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
