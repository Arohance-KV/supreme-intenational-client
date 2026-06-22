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

// ── Blog row ──────────────────────────────────────────────────────────────────

function BlogRow({ blog }: { blog: AdminBlog }) {
  const deleteBlog = useDeleteBlog();

  function handleDelete() {
    if (!confirm(`Delete blog "${blog.title}"? This cannot be undone.`)) return;
    deleteBlog.mutate(blog._id);
  }

  return (
    <div className="grid grid-cols-[1fr_120px_120px_100px_140px] items-center gap-3 border-b border-zinc-100 px-5 py-3 hover:bg-zinc-50 transition-colors">
      {/* Title + slug */}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900">{blog.title}</p>
        <p className="truncate font-mono text-xs text-zinc-400">{blog.slug}</p>
      </div>

      {/* Status */}
      <StatusChip
        status={blog.isPublished ? 'active' : 'inactive'}
        label={blog.isPublished ? 'Published' : 'Draft'}
      />

      {/* Published at */}
      <span className="text-xs text-zinc-500">{fmtDate(blog.publishedAt)}</span>

      {/* Created */}
      <span className="text-xs text-zinc-500">{fmtDate(blog.createdAt)}</span>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/blogs/${blog._id}`}
          className="rounded border border-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors"
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
        <p className="text-sm text-zinc-500">
          {data
            ? `${typeof data.pagination?.total === 'number' ? data.pagination.total.toLocaleString('en-IN') : list.length} blog${list.length !== 1 ? 's' : ''}`
            : ''}
        </p>
        <Link
          href="/admin/blogs/new"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          + New blog
        </Link>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 flex-1 rounded bg-zinc-200" />
              <div className="h-5 w-20 rounded-full bg-zinc-200" />
              <div className="h-4 w-24 rounded bg-zinc-200" />
              <div className="h-4 w-20 rounded bg-zinc-200" />
              <div className="h-6 w-24 rounded bg-zinc-200" />
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
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
          <p className="text-sm text-zinc-500">No blogs yet. Create your first one above.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && list.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_120px_100px_140px] gap-3 bg-zinc-50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
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
        <h1 className="text-2xl font-bold text-zinc-900">Blogs</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Create and manage blog posts
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 animate-pulse">
            Loading blogs…
          </div>
        }
      >
        <BlogsTable />
      </Suspense>
    </div>
  );
}
