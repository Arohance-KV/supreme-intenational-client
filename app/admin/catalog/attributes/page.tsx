'use client';

import { Suspense, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  useAttributes,
  useCreateAttribute,
  useUpdateAttribute,
  useAddAttributeValue,
  useUpdateAttributeValue,
  useRemoveAttributeValue,
  type AdminAttribute,
  type AttributeValue,
  type CreateAttributeBody,
  type UpdateAttributeBody,
  type AddAttributeValueBody,
  type UpdateAttributeValueBody,
} from '@/lib/admin/taxonomy';
import { useConfirm } from '@/components/ConfirmDialog';

// ── Create attribute form ─────────────────────────────────────────────────────

function CreateAttributeForm({ onClose }: { onClose: () => void }) {
  const createAttribute = useCreateAttribute();
  const [form, setForm] = useState<CreateAttributeBody>({ name: '', slug: '', unit: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateAttributeBody = {
      name: form.name,
      ...(form.slug?.trim() ? { slug: form.slug.trim() } : {}),
      ...(form.unit?.trim() ? { unit: form.unit.trim() } : {}),
    };
    createAttribute.mutate(payload, { onSuccess: onClose });
  };

  return (
    <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-ink">New attribute</h3>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="e.g. Color"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">
            Slug <span className="text-muted">(auto-generated)</span>
          </label>
          <input
            value={form.slug ?? ''}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="rounded border border-line px-3 py-2 text-sm font-jbmono focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="e.g. color"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">Unit</label>
          <input
            value={form.unit ?? ''}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="e.g. kg"
          />
        </div>

        <div className="flex flex-col gap-1">
          {createAttribute.error && (
            <p className="text-xs text-red-600">
              {createAttribute.error instanceof ApiError
                ? createAttribute.error.message
                : 'Failed to create attribute'}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createAttribute.isPending}
              className="rounded bg-gradient-to-br from-indigo to-indigo2 text-white px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:opacity-90 transition-colors"
            >
              {createAttribute.isPending ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-line px-4 py-2 text-sm text-slate hover:bg-white/60"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Inline edit attribute name/unit ──────────────────────────────────────────

function EditAttributeInline({
  attribute,
  onClose,
}: {
  attribute: AdminAttribute;
  onClose: () => void;
}) {
  const updateAttribute = useUpdateAttribute();
  const [form, setForm] = useState<UpdateAttributeBody>({
    name: attribute.name,
    unit: attribute.unit ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAttribute.mutate(
      { id: attribute._id, body: form },
      { onSuccess: onClose },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate">Name</label>
        <input
          required
          value={form.name ?? ''}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded border border-line px-2 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate">Unit</label>
        <input
          value={form.unit ?? ''}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          className="w-20 rounded border border-line px-2 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
      {updateAttribute.error && (
        <p className="self-end text-xs text-red-600">
          {updateAttribute.error instanceof ApiError
            ? updateAttribute.error.message
            : 'Update failed'}
        </p>
      )}
      <div className="flex gap-2 self-end">
        <button
          type="submit"
          disabled={updateAttribute.isPending}
          className="rounded bg-gradient-to-br from-indigo to-indigo2 text-white px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60 hover:opacity-90"
        >
          {updateAttribute.isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-line px-3 py-1.5 text-xs text-slate hover:bg-white/60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Add value form ────────────────────────────────────────────────────────────

function AddValueForm({
  attributeId,
  onClose,
}: {
  attributeId: string;
  onClose: () => void;
}) {
  const addValue = useAddAttributeValue();
  const [form, setForm] = useState<AddAttributeValueBody>({ label: '', slug: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AddAttributeValueBody = {
      label: form.label,
      ...(form.slug?.trim() ? { slug: form.slug.trim() } : {}),
    };
    addValue.mutate({ id: attributeId, body: payload }, { onSuccess: onClose });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate">
          Label <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="rounded border border-line px-2 py-1.5 text-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="e.g. Red"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate">
          Slug <span className="text-muted">(auto)</span>
        </label>
        <input
          value={form.slug ?? ''}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="rounded border border-line px-2 py-1.5 text-xs font-jbmono focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="e.g. red"
        />
      </div>
      {addValue.error && (
        <p className="self-end text-xs text-red-600">
          {addValue.error instanceof ApiError ? addValue.error.message : 'Add failed'}
        </p>
      )}
      <div className="flex gap-1.5 self-end">
        <button
          type="submit"
          disabled={addValue.isPending}
          className="rounded bg-gradient-to-br from-indigo to-indigo2 text-white px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60 hover:opacity-90"
        >
          {addValue.isPending ? '…' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-line px-3 py-1.5 text-xs text-slate hover:bg-white/60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Edit value form ───────────────────────────────────────────────────────────

function EditValueForm({
  attributeId,
  value,
  onClose,
}: {
  attributeId: string;
  value: AttributeValue;
  onClose: () => void;
}) {
  const updateValue = useUpdateAttributeValue();
  const [form, setForm] = useState<UpdateAttributeValueBody>({
    label: value.label,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateValue.mutate(
      { id: attributeId, valueId: value._id, body: form },
      { onSuccess: onClose },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <input
        required
        value={form.label ?? ''}
        onChange={(e) => setForm({ ...form, label: e.target.value })}
        className="rounded border border-line px-2 py-1 text-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        placeholder="Label"
      />
      {updateValue.error && (
        <p className="text-xs text-red-600">
          {updateValue.error instanceof ApiError ? updateValue.error.message : 'Update failed'}
        </p>
      )}
      <div className="flex gap-1">
        <button
          type="submit"
          disabled={updateValue.isPending}
          className="rounded bg-gradient-to-br from-indigo to-indigo2 text-white px-2 py-1 text-xs font-medium text-white disabled:opacity-60"
        >
          {updateValue.isPending ? '…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-line px-2 py-1 text-xs text-slate hover:bg-white/60"
        >
          ✕
        </button>
      </div>
    </form>
  );
}

// ── Single value chip ─────────────────────────────────────────────────────────

function ValueChip({
  attributeId,
  value,
}: {
  attributeId: string;
  value: AttributeValue;
}) {
  const { confirm, alert } = useConfirm();
  const [editing, setEditing] = useState(false);
  const removeValue = useRemoveAttributeValue();

  const handleRemove = async () => {
    if (!(await confirm({ title: 'Remove value', message: `Remove value "${value.label}"? This cannot be undone.`, confirmLabel: 'Remove', tone: 'danger' }))) return;
    removeValue.mutate(
      { id: attributeId, valueId: value._id },
      {
        onError: async (err) => {
          await alert({ message: err instanceof ApiError ? err.message : 'Failed to remove value' });
        },
      },
    );
  };

  if (editing) {
    return (
      <div className="inline-flex rounded border border-line bg-white/50 px-2 py-1">
        <EditValueForm
          attributeId={attributeId}
          value={value}
          onClose={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-line bg-white px-2 py-1 text-xs text-slate">
      <span className="font-medium">{value.label}</span>
      <span className="text-muted font-jbmono">{value.slug}</span>
      {value.isActive === false && (
        <span className="rounded bg-black/5 px-1 py-0.5 text-muted text-xs">off</span>
      )}
      <button
        onClick={() => setEditing(true)}
        className="ml-0.5 rounded p-0.5 text-muted hover:text-slate hover:bg-black/5"
        title="Edit value"
      >
        ✎
      </button>
      <button
        onClick={handleRemove}
        disabled={removeValue.isPending}
        className="rounded p-0.5 text-muted hover:text-red-600 hover:bg-red-50 disabled:opacity-40"
        title="Remove value"
      >
        ✕
      </button>
    </span>
  );
}

// ── Attribute card ────────────────────────────────────────────────────────────

function AttributeCard({ attribute }: { attribute: AdminAttribute }) {
  const [editingAttr, setEditingAttr] = useState(false);
  const [addingValue, setAddingValue] = useState(false);

  const values = attribute.values ?? [];

  return (
    <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          {editingAttr ? (
            <EditAttributeInline attribute={attribute} onClose={() => setEditingAttr(false)} />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">{attribute.name}</span>
                {attribute.unit ? (
                  <span className="rounded bg-black/5 px-1.5 py-0.5 text-xs text-slate">
                    {attribute.unit}
                  </span>
                ) : null}
                {attribute.isActive === false && (
                  <span className="rounded bg-black/5 px-1.5 py-0.5 text-xs text-muted">
                    inactive
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted font-jbmono">{attribute.slug}</p>
            </>
          )}
        </div>
        {!editingAttr && (
          <button
            onClick={() => setEditingAttr(true)}
            className="shrink-0 rounded border border-line px-3 py-1 text-xs text-slate hover:bg-white/60"
          >
            Edit
          </button>
        )}
      </div>

      {/* Values */}
      <div className="flex flex-wrap gap-2">
        {values.length === 0 && (
          <p className="text-xs text-muted italic">No values yet.</p>
        )}
        {values.map((v) => (
          <ValueChip key={v._id} attributeId={attribute._id} value={v} />
        ))}
      </div>

      {/* Add value */}
      {addingValue ? (
        <AddValueForm
          attributeId={attribute._id}
          onClose={() => setAddingValue(false)}
        />
      ) : (
        <button
          onClick={() => setAddingValue(true)}
          className="mt-3 rounded border border-dashed border-line px-3 py-1.5 text-xs text-slate hover:border-accent hover:text-slate transition-colors"
        >
          + Add value
        </button>
      )}
    </div>
  );
}

// ── Inner list ────────────────────────────────────────────────────────────────

function AttributesList() {
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading, isError, error } = useAttributes();

  const attributes = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate">
          {!isLoading && !isError ? `${attributes.length} attributes` : ''}
        </p>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="rounded bg-gradient-to-br from-indigo to-indigo2 text-white px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-colors"
        >
          {showCreate ? '✕ Cancel' : '+ New attribute'}
        </button>
      </div>

      {showCreate && <CreateAttributeForm onClose={() => setShowCreate(false)} />}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5 animate-pulse">
              <div className="mb-3 h-4 w-32 rounded bg-black/5" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded bg-black/5" />
                <div className="h-6 w-20 rounded bg-black/5" />
                <div className="h-6 w-14 rounded bg-black/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : 'Failed to load attributes. Please try refreshing.'}
        </div>
      )}

      {!isLoading && !isError && attributes.length === 0 && (
        <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-10 text-center">
          <p className="text-sm text-slate">No attributes yet. Create one above.</p>
        </div>
      )}

      {!isLoading && !isError && attributes.length > 0 && (
        <div className="space-y-3">
          {attributes.map((attr) => (
            <AttributeCard key={attr._id} attribute={attr} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminAttributesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Attributes</h1>
        <p className="mt-1 text-sm text-slate">Manage product attributes and their values</p>
      </div>
      <Suspense
        fallback={
          <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-8 text-center text-sm text-slate animate-pulse">
            Loading attributes…
          </div>
        }
      >
        <AttributesList />
      </Suspense>
    </div>
  );
}
