// Streams instantly on navigation so a product click feels immediate while the
// server component fetches the product. Mirrors the detail page's two-column layout
// (image panel left, info card right) so the swap to real content is seamless.
export default function Loading() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_0%_0%,rgba(58,60,152,.16),transparent_60%),radial-gradient(50%_45%_at_100%_6%,rgba(20,155,142,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />
      <div className="relative z-[1] mx-auto max-w-[1440px] px-4 pb-10 pt-5 sm:px-6 sm:pt-10 lg:px-8">
        {/* breadcrumb */}
        <div className="mb-4 h-4 w-52 animate-pulse rounded bg-white/60 sm:mb-6" />

        <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
          {/* image panel */}
          <div className="aspect-square w-full flex-1 animate-pulse rounded-[22px] bg-white/55 lg:max-w-[560px]" />

          {/* info card */}
          <div className="flex flex-1 flex-col gap-4 rounded-[22px] border border-white/80 bg-white/55 p-4 sm:p-7">
            <div className="h-3 w-24 animate-pulse rounded bg-white/70" />
            <div className="h-9 w-3/4 animate-pulse rounded-lg bg-white/70" />
            <div className="h-4 w-32 animate-pulse rounded bg-white/70" />
            <div className="mt-1 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-white/70" />
              <div className="h-3 w-11/12 animate-pulse rounded bg-white/70" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-white/70" />
            </div>
            <div className="mt-1 grid gap-3 border-t border-line pt-4 sm:grid-cols-3 sm:pt-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-white/70" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
