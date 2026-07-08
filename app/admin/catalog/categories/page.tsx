'use client';

import { Suspense, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  type AdminCategory,
  type CreateCategoryBody,
  type UpdateCategoryBody,
} from '@/lib/admin/taxonomy';
import { StatusChip } from '@/components/admin/StatusChip';

// ── Create form ───────────────────────────────────────────────────────────────

function CreateCategoryForm({ onClose }: { onClose: () => void }) {
  const createCategory = useCreateCategory();
  const [form, setForm] = useState<CreateCategoryBody>({
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateCategoryBody = {
      name: form.name,
      ...(form.slug?.trim() ? { slug: form.slug.trim() } : {}),
      ...(form.description?.trim() ? { description: form.description.trim() } : {}),
      ...(typeof form.displayOrder === 'number' ? { displayOrder: form.displayOrder } : {}),
    };
    createCategory.mutate(payload, { onSuccess: onClose });
  };

  return (
    <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-ink">New category</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="e.g. Safety Equipment"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">
            Slug <span className="text-muted">(auto-generated if blank)</span>
          </label>
          <input
            value={form.slug ?? ''}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full rounded border border-line px-3 py-2 text-sm font-jbmono focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="e.g. safety-equipment"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">Description</label>
          <textarea
            rows={2}
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">Display order</label>
          <input
            type="number"
            min={0}
            value={form.displayOrder ?? 0}
            onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
            className="w-24 rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {createCategory.error && (
          <p className="text-sm text-red-600">
            {createCategory.error instanceof ApiError
              ? createCategory.error.message
              : 'Failed to create category'}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={createCategory.isPending}
            className="rounded bg-gradient-to-br from-indigo to-indigo2 text-white px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:opacity-90 transition-colors"
          >
            {createCategory.isPending ? 'Creating…' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-line px-4 py-2 text-sm text-slate hover:bg-white/60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Edit row form (inline) ────────────────────────────────────────────────────

function EditCategoryRow({
  category,
  onClose,
}: {
  category: AdminCategory;
  onClose: () => void;
}) {
  const updateCategory = useUpdateCategory();
  const [form, setForm] = useState<UpdateCategoryBody>({
    name: category.name,
    description: category.description ?? '',
    displayOrder: category.displayOrder ?? 0,
    isActive: category.isActive,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCategory.mutate(
      { id: category._id, body: form },
      { onSuccess: onClose },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-[1fr_160px_100px_80px_140px] items-start gap-4 border-b border-line bg-white/50 px-5 py-3"
    >
      <div className="space-y-1">
        <input
          required
          value={form.name ?? ''}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded border border-line px-2 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="Name"
        />
        <input
          value={form.description ?? ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded border border-line px-2 py-1.5 text-xs text-slate focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="Description"
        />
      </div>

      <span className="pt-2 text-xs text-muted font-jbmono">{category.slug}</span>

      <div className="pt-1">
        <input
          type="number"
          min={0}
          value={form.displayOrder ?? 0}
          onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
          className="w-16 rounded border border-line px-2 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="pt-2">
        <label className="flex items-center gap-1.5 text-xs text-slate">
          <input
            type="checkbox"
            checked={form.isActive ?? true}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="rounded border-line"
          />
          Active
        </label>
      </div>

      <div className="flex flex-col gap-1 pt-1">
        {updateCategory.error && (
          <p className="text-xs text-red-600">
            {updateCategory.error instanceof ApiError
              ? updateCategory.error.message
              : 'Update failed'}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={updateCategory.isPending}
            className="rounded bg-gradient-to-br from-indigo to-indigo2 text-white px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60 hover:opacity-90"
          >
            {updateCategory.isPending ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-line px-3 py-1.5 text-xs text-slate hover:bg-white/60"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Category row ──────────────────────────────────────────────────────────────

function CategoryRow({ category }: { category: AdminCategory }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <EditCategoryRow category={category} onClose={() => setEditing(false)} />;
  }

  return (
    <div className="grid grid-cols-[1fr_160px_100px_80px_140px] items-center gap-4 border-b border-line px-5 py-3 hover:bg-white/50 transition-colors">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{category.name}</p>
        {category.description ? (
          <p className="truncate text-xs text-muted">{category.description}</p>
        ) : null}
      </div>

      <span className="truncate text-xs font-jbmono text-slate">{category.slug}</span>

      <span className="text-sm text-slate">{category.displayOrder ?? 0}</span>

      <StatusChip
        status={category.isActive === false ? 'inactive' : 'active'}
        label={category.isActive === false ? 'Inactive' : 'Active'}
      />

      <button
        onClick={() => setEditing(true)}
        className="w-fit rounded border border-line px-3 py-1 text-xs text-slate hover:bg-white/60"
      >
        Edit
      </button>
    </div>
  );
}

// ── Inner list (no useSearchParams — no Suspense wrapper needed, but kept for consistency) ──

function CategoriesTable() {
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading, isError, error } = useCategories();

  const categories = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate">
          {!isLoading && !isError ? `${categories.length} categories` : ''}
        </p>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="rounded bg-gradient-to-br from-indigo to-indigo2 text-white px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-colors"
        >
          {showCreate ? '✕ Cancel' : '+ New category'}
        </button>
      </div>

      {showCreate && (
        <CreateCategoryForm onClose={() => setShowCreate(false)} />
      )}

      {isLoading && (
        <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] divide-y divide-line">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 w-40 rounded bg-black/5" />
              <div className="h-4 w-32 rounded bg-black/5" />
              <div className="h-4 w-8 rounded bg-black/5" />
              <div className="h-5 w-16 rounded-full bg-black/5" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : 'Failed to load categories. Please try refreshing.'}
        </div>
      )}

      {!isLoading && !isError && categories.length === 0 && (
        <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-10 text-center">
          <p className="text-sm text-slate">No categories yet. Create one above.</p>
        </div>
      )}

      {!isLoading && !isError && categories.length > 0 && (
        <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] overflow-hidden">
          <div className="grid grid-cols-[1fr_160px_100px_80px_140px] gap-4 bg-white/50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate">
            <span>Name</span>
            <span>Slug</span>
            <span>Order</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {categories.map((cat) => (
            <CategoryRow key={cat._id} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Categories</h1>
        <p className="mt-1 text-sm text-slate">Manage product taxonomy categories</p>
      </div>
      <Suspense
        fallback={
          <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-8 text-center text-sm text-slate animate-pulse">
            Loading categories…
          </div>
        }
      >
        <CategoriesTable />
      </Suspense>
    </div>
  );
}
