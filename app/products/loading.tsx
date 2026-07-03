// Streams instantly on navigation so the page never feels frozen while the
// server component fetches products.
export default function Loading() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(20,155,142,.16),transparent_60%),radial-gradient(50%_45%_at_0%_6%,rgba(58,60,152,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />
      <div className="relative z-[1] mx-auto max-w-[1280px] px-[18px] py-10 sm:px-10">
        <div className="mb-6 h-8 w-40 animate-pulse rounded-xl bg-white/60" />
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-72">
            <div className="h-96 animate-pulse rounded-[20px] bg-white/55" />
          </aside>
          <main className="flex-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-[20px] bg-white/55" />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
