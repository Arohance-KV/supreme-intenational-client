'use client';
import Link from 'next/link';
import { useMySubmissions } from '@/lib/seller/submissions';
import { SubmissionStatusChip } from '@/components/seller/SubmissionStatusChip';

export default function SubmissionsPage() {
  const { data, isLoading } = useMySubmissions();
  const items = data?.items ?? [];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-zinc-900">My Submissions</h1>
        <Link
          href="/seller/submissions/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New submission
        </Link>
      </div>

      {isLoading && (
        <p className="text-sm text-zinc-500">Loading…</p>
      )}

      {!isLoading && items.length === 0 && (
        <div className="rounded border border-zinc-200 p-8 text-center">
          <p className="text-sm text-zinc-500 mb-3">No submissions yet.</p>
          <Link href="/seller/submissions/new" className="text-blue-600 hover:underline text-sm">
            Create your first submission
          </Link>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="divide-y divide-zinc-100 rounded border border-zinc-200 bg-white">
          {items.map((item) => (
            <Link
              key={item._id}
              href={`/seller/submissions/${item._id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <SubmissionStatusChip status={item.status} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
