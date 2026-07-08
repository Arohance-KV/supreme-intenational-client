'use client';

import { use, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import {
  useBlog,
  useCreateBlog,
  useUpdateBlog,
  type CreateBlogBody,
  type UpdateBlogBody,
} from '@/lib/admin/blogs';
import { uploadAdminImage } from '@/lib/admin/products';

// ── Helpers ───────────────────────────────────────────────────────────────────

function blankForm(): CreateBlogBody {
  return {
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    tags: [],
    isPublished: false,
  };
}

/** Serialise comma-separated tags input to string[] */
function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Serialise string[] tags to comma-separated display value */
function joinTags(tags: string[]): string {
  return tags.join(', ');
}

// ── Cover image uploader ──────────────────────────────────────────────────────

function CoverImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputCls =
    'w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-line';

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      // Reuse the shared uploadAdminImage helper (field: 'file', folder: 'products')
      // There is no 'blogs' folder configured on the server upload handler, so
      // we use 'products' as the closest available folder — this is a known
      // limitation; the server upload endpoint would need a 'blogs' folder added
      // to accept it explicitly. For now 'products' is accepted and works fine.
      const url = await uploadAdminImage(file, 'products');
      onChange(url);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Cover"
            className="h-28 w-auto max-w-xs rounded border border-line object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
            aria-label="Remove cover image"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={uploading}
          className="text-xs text-slate file:mr-2 file:rounded file:border-0 file:bg-black/5 file:px-3 file:py-1 file:text-xs file:font-medium file:text-slate hover:file:bg-black/10"
        />
        {uploading && <span className="text-xs text-muted">Uploading…</span>}
      </div>
      <div>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="or paste image URL"
          className={inputCls}
        />
      </div>
      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
    </div>
  );
}

// ── Create form ───────────────────────────────────────────────────────────────

function CreateBlogForm() {
  const router = useRouter();
  const createBlog = useCreateBlog();
  const [form, setForm] = useState<CreateBlogBody>(blankForm());
  const [tagsRaw, setTagsRaw] = useState('');

  const inputCls =
    'w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-line';
  const labelCls = 'mb-1 block text-sm font-medium text-slate';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CreateBlogBody = {
      ...form,
      tags: parseTags(tagsRaw),
      coverImage: form.coverImage || undefined,
      excerpt: form.excerpt || undefined,
      content: form.content || undefined,
    };
    createBlog.mutate(payload, {
      onSuccess: (blog) => {
        router.replace(`/admin/blogs/${blog._id}`);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label htmlFor="b-title" className={labelCls}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="b-title"
          required
          maxLength={200}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Post title"
          className={inputCls}
        />
        <p className="mt-0.5 text-xs text-muted">Slug is auto-generated from the title.</p>
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="b-excerpt" className={labelCls}>
          Excerpt
          <span className="ml-1 font-normal text-muted">(max 500 chars, optional)</span>
        </label>
        <textarea
          id="b-excerpt"
          rows={2}
          maxLength={500}
          value={form.excerpt ?? ''}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          placeholder="Short summary shown in listing"
          className={inputCls}
        />
      </div>

      {/* Content — plain textarea (rich-text editor deferred: YAGNI) */}
      <div>
        <label htmlFor="b-content" className={labelCls}>
          Content
          <span className="ml-1 font-normal text-muted">(plain text / HTML, optional)</span>
        </label>
        <textarea
          id="b-content"
          rows={12}
          value={form.content ?? ''}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Write the post body here…"
          className={`${inputCls} font-mono text-xs`}
        />
      </div>

      {/* Cover image */}
      <div>
        <p className={labelCls}>Cover image</p>
        <CoverImageField
          value={form.coverImage ?? ''}
          onChange={(url) => setForm({ ...form, coverImage: url })}
        />
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="b-tags" className={labelCls}>
          Tags
          <span className="ml-1 font-normal text-muted">(comma-separated, optional)</span>
        </label>
        <input
          id="b-tags"
          type="text"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="e.g. news, product, update"
          className={inputCls}
        />
      </div>

      {/* Published */}
      <div>
        <label className="flex items-center gap-2 text-sm text-slate">
          <input
            type="checkbox"
            checked={!!form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            className="rounded"
          />
          Publish immediately
        </label>
      </div>

      {/* Error */}
      {createBlog.error && (
        <p className="text-sm text-red-600">
          {createBlog.error instanceof ApiError ? createBlog.error.message : 'Create failed.'}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={createBlog.isPending}
          className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-colors"
        >
          {createBlog.isPending ? 'Creating…' : 'Create blog'}
        </button>
        <Link
          href="/admin/blogs"
          className="rounded border border-line px-4 py-2 text-sm text-slate hover:bg-white/60 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

// ── Edit form ─────────────────────────────────────────────────────────────────

function EditBlogForm({ blogId }: { blogId: string }) {
  const { data: blog, isLoading, error } = useBlog(blogId);
  const updateBlog = useUpdateBlog(blogId);

  // Local form state — initialised once blog loads
  const [initialised, setInitialised] = useState(false);
  const [form, setForm] = useState<UpdateBlogBody>({});
  const [tagsRaw, setTagsRaw] = useState('');

  // Populate form when blog data arrives
  useEffect(() => {
    if (blog && !initialised) {
      setForm({
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        coverImage: blog.coverImage,
        tags: blog.tags,
        isPublished: blog.isPublished,
      });
      setTagsRaw(joinTags(blog.tags ?? []));
      setInitialised(true);
    }
  }, [blog, initialised]);

  const inputCls =
    'w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-line';
  const labelCls = 'mb-1 block text-sm font-medium text-slate';

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-1/2 rounded bg-black/5" />
        <div className="h-32 rounded bg-black/5" />
        <div className="h-64 rounded bg-black/5" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error instanceof ApiError ? error.message : 'Failed to load blog.'}
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: UpdateBlogBody = {
      ...form,
      tags: parseTags(tagsRaw),
      coverImage: form.coverImage || undefined,
      excerpt: form.excerpt || undefined,
      content: form.content || undefined,
    };
    updateBlog.mutate(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label htmlFor="b-title" className={labelCls}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="b-title"
          required
          maxLength={200}
          value={form.title ?? ''}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputCls}
        />
      </div>

      {/* Slug — read-only (server regenerates on title change) */}
      <div>
        <label className={labelCls}>Slug (auto-updated on title change)</label>
        <input
          readOnly
          value={blog.slug}
          className="w-full rounded border border-line bg-white/50 px-3 py-2 font-mono text-sm text-muted"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="b-excerpt" className={labelCls}>
          Excerpt
          <span className="ml-1 font-normal text-muted">(max 500 chars)</span>
        </label>
        <textarea
          id="b-excerpt"
          rows={2}
          maxLength={500}
          value={form.excerpt ?? ''}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className={inputCls}
        />
      </div>

      {/* Content */}
      <div>
        <label htmlFor="b-content" className={labelCls}>
          Content
          <span className="ml-1 font-normal text-muted">(plain text / HTML)</span>
        </label>
        <textarea
          id="b-content"
          rows={14}
          value={form.content ?? ''}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className={`${inputCls} font-mono text-xs`}
        />
      </div>

      {/* Cover image */}
      <div>
        <p className={labelCls}>Cover image</p>
        <CoverImageField
          value={form.coverImage ?? ''}
          onChange={(url) => setForm({ ...form, coverImage: url })}
        />
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="b-tags" className={labelCls}>
          Tags
          <span className="ml-1 font-normal text-muted">(comma-separated)</span>
        </label>
        <input
          id="b-tags"
          type="text"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="e.g. news, product, update"
          className={inputCls}
        />
      </div>

      {/* Published */}
      <div>
        <label className="flex items-center gap-2 text-sm text-slate">
          <input
            type="checkbox"
            checked={!!form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            className="rounded"
          />
          Published
        </label>
      </div>

      {/* Feedback */}
      {updateBlog.error && (
        <p className="text-sm text-red-600">
          {updateBlog.error instanceof ApiError ? updateBlog.error.message : 'Save failed.'}
        </p>
      )}
      {updateBlog.isSuccess && (
        <p className="text-sm text-green-600">Saved successfully.</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={updateBlog.isPending}
          className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-colors"
        >
          {updateBlog.isPending ? 'Saving…' : 'Save changes'}
        </button>
        <Link
          href="/admin/blogs"
          className="rounded border border-line px-4 py-2 text-sm text-slate hover:bg-white/60 transition-colors"
        >
          Back to list
        </Link>
      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminBlogEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isCreate = id === 'new';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate">
        <Link href="/admin/blogs" className="hover:underline">
          Blogs
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">
          {isCreate ? 'New blog' : 'Edit blog'}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-ink">
        {isCreate ? 'New blog' : 'Edit blog'}
      </h1>

      <section className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_12px_34px_rgba(34,36,90,.08)] p-6">
        {isCreate ? (
          <CreateBlogForm />
        ) : (
          <EditBlogForm blogId={id} />
        )}
      </section>
    </div>
  );
}
