'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import {
  useBlogs,
  useDeleteBlog,
  type AdminBlog,
} from '@/lib/admin/blogs';
import { StatusChip } from '@/components/admin/StatusChip';
import { fmtDate } from '@/lib/admin/format';
import { useConfirm } from '@/components/ConfirmDialog';

// ── Blog row ──────────────────────────────────────────────────────────────────

function BlogRow({ blog }: { blog: AdminBlog }) {
  const deleteBlog = useDeleteBlog();
  const { confirm } = useConfirm();

  async function handleDelete() {
    if (!(await confirm({ title: 'Delete blog', message: `Delete blog "${blog.title}"? This cannot be undone.`, confirmLabel: 'Delete', tone: 'danger' }))) return;
    deleteBlog.mutate(blog._id);
  }

  return (
    <div className="grid grid-cols-[1fr_120px_120px_100px_140px] items-center gap-3 border-b border-line px-5 py-3 hover:bg-white/50 transition-colors">
      {/* Title + slug */}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{blog.title}</p>
        <p className="truncate font-mono text-xs text-muted">{blog.slug}</p>
      </div>

      {/* Status */}
      <StatusChip
        status={blog.isPublished ? 'active' : 'inactive'}
        label={blog.isPublished ? 'Published' : 'Draft'}
      />

      {/* Published at */}
      <span className="text-xs text-slate">{fmtDate(blog.publishedAt)}</span>

      {/* Created */}
      <span className="text-xs text-slate">{fmtDate(blog.createdAt)}</span>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/blogs/${blog._id}`}
          className="rounded border border-line px-3 py-1 text-xs text-slate hover:bg-white/60 transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleteBlog.isPending}
          className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
        >
          {deleteBlog.isPending ? '…' : 'Delete'}
        </button>
        {deleteBlog.error && (
          <span className="text-xs text-red-600">
            {deleteBlog.error instanceof ApiError ? deleteBlog.error.message : 'Error'}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Inner table (needs Suspense boundary for any future useSearchParams usage) ─

function BlogsTable() {
  const { data, isLoading, isError, error } = useBlogs(1);

  const list = data?.blogs ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate">
          {data
            ? `${typeof data.pagination?.total === 'number' ? data.pagination.total.toLocaleString('en-IN') : list.length} blog${list.length !== 1 ? 's' : ''}`
            : ''}
        </p>
        <Link
          href="/admin/blogs/new"
          className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-colors"
        >
          + New blog
        </Link>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] divide-y divide-line">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 flex-1 rounded bg-black/5" />
              <div className="h-5 w-20 rounded-full bg-black/5" />
              <div className="h-4 w-24 rounded bg-black/5" />
              <div className="h-4 w-20 rounded bg-black/5" />
              <div className="h-6 w-24 rounded bg-black/5" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError
            ? error.message
            : 'Failed to load blogs. Please try refreshing.'}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && list.length === 0 && (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] p-10 text-center">
          <p className="text-sm text-slate">No blogs yet. Create your first one above.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && list.length > 0 && (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_120px_100px_140px] gap-3 bg-white/50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate">
            <span>Title / Slug</span>
            <span>Status</span>
            <span>Published</span>
            <span>Created</span>
            <span>Actions</span>
          </div>
          {list.map((b) => (
            <BlogRow key={b._id} blog={b} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminBlogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Blogs</h1>
        <p className="mt-1 text-sm text-slate">
          Create and manage blog posts
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] p-8 text-center text-sm text-slate animate-pulse">
            Loading blogs…
          </div>
        }
      >
        <BlogsTable />
      </Suspense>
    </div>
  );
}
