// Streams instantly on navigation so the page never feels frozen while the
// server component fetches products.
export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 h-8 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full lg:w-64 shrink-0">
            <div className="h-96 animate-pulse rounded-lg bg-zinc-200" />
          </aside>
          <main className="flex-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-lg bg-zinc-200" />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
