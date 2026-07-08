'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';
import { uploadSubmissionImage, type SubmissionInput } from '@/lib/seller/submissions';

interface Cat { _id: string; name: string; }

// ── Shared field styling (matches the app glass/indigo/teal design system) ─────
const field =
  'w-full rounded-[10px] border border-line bg-white/70 px-3 py-2.5 text-sm text-ink placeholder:text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15';
const labelCls = 'mb-1.5 block text-[13px] font-semibold text-slate';
const fieldLabel = 'mb-1 block text-[11px] font-medium uppercase tracking-[.04em] text-muted';
const card =
  'rounded-[18px] border border-white/80 bg-white/[.62] p-5 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]';
const sectionTitle = 'text-[15px] font-bold text-ink';

// Local-only variant/attribute shape carrying a stable `_key` for React list keys
// (array-index keys bleed state when a middle row is removed). `_key` is stripped
// before building the SubmissionInput sent to the server.
interface LocalAttr { _key: string; name: string; value: string; }
interface LocalVariant {
  _key: string;
  sku: string; price: number; originalPrice: number; stock: number; moq: number;
  attributes: LocalAttr[];
}

const uid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2);

const emptyVariant = (): LocalVariant => ({
  _key: uid(), sku: '', price: 0, originalPrice: 0, stock: 0, moq: 1, attributes: [],
});

function toLocalVariants(initial?: Partial<SubmissionInput>): LocalVariant[] {
  if (initial?.variants && initial.variants.length > 0) {
    return initial.variants.map((v) => ({
      _key: uid(),
      sku: v.sku, price: v.price, originalPrice: v.originalPrice, stock: v.stock, moq: v.moq,
      attributes: (v.attributes ?? []).map((a) => ({ _key: uid(), name: a.name, value: a.value })),
    }));
  }
  return [emptyVariant()];
}

const trimmed = (s: string): string | undefined => (s.trim() === '' ? undefined : s);
const norm = (s: string) => s.trim().toLowerCase();

// Global attribute taxonomy (public) — lets sellers pick existing attributes/values.
interface CatAttr { _id: string; name: string; values: { _id: string; label: string }[] }

// ── Variant attributes: chip picker for known taxonomy + custom escape hatch ───
// Mirrors the admin's chip picker for attributes that already exist. Anything not
// in the catalog is added as a free-text "custom" pair, flagged for admin review
// (shows as "Not in catalog" during approval).
function VariantAttributes({
  attributes, catalog, onToggleChip, onAddCustom, onUpdateCustom, onRemoveCustom,
}: {
  attributes: LocalAttr[];
  catalog: CatAttr[];
  onToggleChip: (name: string, value: string) => void;
  onAddCustom: () => void;
  onUpdateCustom: (key: string, patch: Partial<LocalAttr>) => void;
  onRemoveCustom: (key: string) => void;
}) {
  const catalogNames = new Set(catalog.map((c) => norm(c.name)));
  const custom = attributes.filter((a) => !catalogNames.has(norm(a.name)));
  const selectedValue = (attrName: string) =>
    attributes.find((a) => norm(a.name) === norm(attrName))?.value ?? '';

  return (
    <div className="space-y-3">
      {catalog.map((attr) => {
        const chosen = selectedValue(attr.name);
        return (
          <div key={attr._id}>
            <p className="mb-1.5 text-[12px] font-semibold text-slate">{attr.name}</p>
            <div className="flex flex-wrap gap-2">
              {attr.values.map((val) => {
                const active = norm(chosen) === norm(val.label);
                return (
                  <button
                    key={val._id}
                    type="button"
                    onClick={() => onToggleChip(attr.name, val.label)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? 'border-accent bg-accent text-white'
                        : 'border-line bg-white/70 text-slate hover:bg-white'
                    }`}
                  >
                    {val.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Custom attributes not in the taxonomy — admin reviews these */}
      {custom.length > 0 && (
        <div className="space-y-2 rounded-[10px] border border-dashed border-line bg-white/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[.04em] text-[#b5801e]">
            Custom — admin will review
          </p>
          {custom.map((a) => (
            <div key={a._key} className="flex items-center gap-2">
              <input
                aria-label="Custom attribute name"
                placeholder="Attribute (e.g. Finish)"
                value={a.name}
                onChange={(e) => onUpdateCustom(a._key, { name: e.target.value })}
                className={field}
              />
              <input
                aria-label="Custom attribute value"
                placeholder="Value (e.g. Matte)"
                value={a.value}
                onChange={(e) => onUpdateCustom(a._key, { value: e.target.value })}
                className={field}
              />
              <button
                type="button"
                onClick={() => onRemoveCustom(a._key)}
                aria-label="Remove custom attribute"
                className="flex-none text-muted hover:text-[#d8524d]"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAddCustom}
        className="text-xs font-semibold text-accent hover:underline"
      >
        + Custom attribute
      </button>
    </div>
  );
}

// ── Bulk add: multi-select values per attribute → every combination ────────────
// Mirrors the admin's bulk mode, but expands combinations client-side into the
// draft's variant list (there's no server bulk endpoint for submissions). Each
// generated variant stays individually editable afterwards. Taxonomy attributes
// only — custom attributes are a single-variant concern.
function BulkVariantPanel({
  catalog, onGenerate, onCancel,
}: {
  catalog: CatAttr[];
  onGenerate: (variants: LocalVariant[]) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [customAttrs, setCustomAttrs] = useState<{ _key: string; name: string; values: string[] }[]>([]);
  const [valueDraft, setValueDraft] = useState<Record<string, string>>({});
  const [defaults, setDefaults] = useState({ price: 0, originalPrice: 0, stock: 0, moq: 1 });

  const taxonomyGroups = catalog
    .map((a) => ({ name: a.name, values: [...(selected[a.name] ?? [])] }))
    .filter((g) => g.values.length > 0);
  const customGroups = customAttrs
    .map((c) => ({ name: c.name.trim(), values: c.values.filter((v) => v.trim()) }))
    .filter((g) => g.name && g.values.length > 0);
  const groups = [...taxonomyGroups, ...customGroups];
  const count = groups.length ? groups.reduce((n, g) => n * g.values.length, 1) : 0;

  const toggle = (name: string, label: string) =>
    setSelected((prev) => {
      const set = new Set(prev[name] ?? []);
      if (set.has(label)) set.delete(label);
      else set.add(label);
      return { ...prev, [name]: set };
    });

  const addCustomAttr = () => setCustomAttrs((a) => [...a, { _key: uid(), name: '', values: [] }]);
  const setCustomName = (key: string, name: string) =>
    setCustomAttrs((a) => a.map((c) => (c._key === key ? { ...c, name } : c)));
  const removeCustomAttr = (key: string) => setCustomAttrs((a) => a.filter((c) => c._key !== key));
  const addCustomValue = (key: string) => {
    const draft = (valueDraft[key] ?? '').trim();
    if (!draft) return;
    setCustomAttrs((a) =>
      a.map((c) =>
        c._key === key && !c.values.some((v) => norm(v) === norm(draft))
          ? { ...c, values: [...c.values, draft] }
          : c,
      ),
    );
    setValueDraft((d) => ({ ...d, [key]: '' }));
  };
  const removeCustomValue = (key: string, val: string) =>
    setCustomAttrs((a) => a.map((c) => (c._key === key ? { ...c, values: c.values.filter((v) => v !== val) } : c)));

  const generate = () => {
    if (count === 0) return;
    const combos = groups.reduce<{ name: string; value: string }[][]>(
      (acc, g) => acc.flatMap((combo) => g.values.map((value) => [...combo, { name: g.name, value }])),
      [[]],
    );
    onGenerate(
      combos.map((combo) => ({
        _key: uid(),
        sku: combo.map((c) => c.value).join('-').toUpperCase().replace(/\s+/g, '-'),
        price: defaults.price,
        originalPrice: defaults.originalPrice,
        stock: defaults.stock,
        moq: defaults.moq,
        attributes: combo.map((c) => ({ _key: uid(), name: c.name, value: c.value })),
      })),
    );
  };

  return (
    <div className="space-y-4 rounded-[14px] border border-dashed border-accent/40 bg-[rgba(20,155,142,.05)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-ink">Bulk add — select multiple values per attribute</p>
        {count > 0 && (
          <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white">
            {count} variant{count !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {catalog.length > 0 && (
        <div className="space-y-3">
          {catalog.map((attr) => (
            <div key={attr._id}>
              <p className="mb-1.5 text-[12px] font-semibold text-slate">{attr.name}</p>
              <div className="flex flex-wrap gap-2">
                {attr.values.map((val) => {
                  const active = selected[attr.name]?.has(val.label) ?? false;
                  return (
                    <button
                      key={val._id}
                      type="button"
                      onClick={() => toggle(attr.name, val.label)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? 'border-accent bg-accent text-white'
                          : 'border-line bg-white/70 text-slate hover:bg-white'
                      }`}
                    >
                      {val.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom attributes with multiple values — admin reviews each before go-live */}
      <div className="space-y-3 rounded-[10px] border border-dashed border-line bg-white/40 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[.04em] text-[#b5801e]">
          Custom attributes — admin will review
        </p>
        {customAttrs.map((c) => (
          <div key={c._key} className="space-y-2 rounded-[10px] border border-line bg-white/60 p-2.5">
            <div className="flex items-center gap-2">
              <input
                aria-label="Custom attribute name"
                placeholder="Attribute (e.g. Finish)"
                value={c.name}
                onChange={(e) => setCustomName(c._key, e.target.value)}
                className={field}
              />
              <button
                type="button"
                onClick={() => removeCustomAttr(c._key)}
                aria-label="Remove custom attribute"
                className="flex-none text-muted hover:text-[#d8524d]"
              >
                ✕
              </button>
            </div>
            {c.values.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {c.values.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-accent bg-accent px-3 py-1.5 text-xs font-medium text-white"
                  >
                    {v}
                    <button
                      type="button"
                      onClick={() => removeCustomValue(c._key, v)}
                      aria-label={`Remove value ${v}`}
                      className="text-white/80 hover:text-white"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                aria-label="Add value"
                placeholder="Add a value, press Enter"
                value={valueDraft[c._key] ?? ''}
                onChange={(e) => setValueDraft((d) => ({ ...d, [c._key]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomValue(c._key);
                  }
                }}
                className={field}
              />
              <button
                type="button"
                onClick={() => addCustomValue(c._key)}
                className="flex-none rounded-[9px] border border-[rgba(20,155,142,.25)] bg-[rgba(20,155,142,.08)] px-3 py-2 text-[12px] font-semibold text-accent hover:bg-[rgba(20,155,142,.14)]"
              >
                Add
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addCustomAttr}
          className="text-xs font-semibold text-accent hover:underline"
        >
          + Custom attribute
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-4">
        <div>
          <label htmlFor="bulk-price" className={fieldLabel}>Default price</label>
          <input id="bulk-price" type="number" min={0} value={defaults.price}
            onChange={(e) => setDefaults({ ...defaults, price: Number(e.target.value) })} className={field} />
        </div>
        <div>
          <label htmlFor="bulk-orig" className={fieldLabel}>Default orig. price</label>
          <input id="bulk-orig" type="number" min={0} value={defaults.originalPrice}
            onChange={(e) => setDefaults({ ...defaults, originalPrice: Number(e.target.value) })} className={field} />
        </div>
        <div>
          <label htmlFor="bulk-stock" className={fieldLabel}>Default stock</label>
          <input id="bulk-stock" type="number" min={0} value={defaults.stock}
            onChange={(e) => setDefaults({ ...defaults, stock: Number(e.target.value) })} className={field} />
        </div>
        <div>
          <label htmlFor="bulk-moq" className={fieldLabel}>Default MOQ</label>
          <input id="bulk-moq" type="number" min={1} value={defaults.moq}
            onChange={(e) => setDefaults({ ...defaults, moq: Number(e.target.value) })} className={field} />
        </div>
      </div>

      <p className="text-[11px] text-muted">
        SKUs are auto-generated from the selected values — edit any variant afterwards to adjust.
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={count === 0}
          className="rounded-[10px] bg-[linear-gradient(135deg,#176054,#179b8e)] px-4 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(23,155,142,.28)] disabled:opacity-50"
        >
          {count > 0 ? `Generate ${count} variant${count !== 1 ? 's' : ''}` : 'Select values'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[10px] border border-line px-4 py-2 text-xs font-semibold text-slate hover:bg-white/60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

interface Props {
  initial?: Partial<SubmissionInput>;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (input: SubmissionInput) => void;
}

export function SubmissionForm({ initial, submitting, submitLabel, onSubmit }: Props) {
  const { data: cats = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Cat[]>('/catalog/categories'),
    staleTime: 300_000,
  });

  const { data: attrCatalog = [] } = useQuery({
    queryKey: ['catalog-attributes'],
    queryFn: () => apiFetch<CatAttr[]>('/catalog/attributes'),
    staleTime: 300_000,
  });

  const [name, setName] = useState(initial?.name ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [details, setDetails] = useState(initial?.details ?? '');
  const [materials, setMaterials] = useState(initial?.materials ?? '');
  const [shipping, setShipping] = useState(initial?.shipping ?? '');
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<LocalVariant[]>(toLocalVariants(initial));
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Append bulk-generated variants, dropping any pristine placeholder rows so the
  // seller isn't left with a blank required-SKU variant blocking submission.
  const addBulk = (generated: LocalVariant[]) => {
    setVariants((prev) => {
      const kept = prev.filter(
        (v) => !(v.sku.trim() === '' && v.price === 0 && v.originalPrice === 0 && v.stock === 0 && v.attributes.length === 0),
      );
      return [...kept, ...generated];
    });
    setBulkOpen(false);
  };

  const updateVariant = (key: string, patch: Partial<LocalVariant>) =>
    setVariants((vs) => vs.map((v) => (v._key === key ? { ...v, ...patch } : v)));

  const removeVariant = (key: string) =>
    setVariants((vs) => (vs.length > 1 ? vs.filter((v) => v._key !== key) : vs));

  const setVariantAttrs = (vKey: string, next: (attrs: LocalAttr[]) => LocalAttr[]) =>
    setVariants((vs) => vs.map((v) => (v._key === vKey ? { ...v, attributes: next(v.attributes) } : v)));

  // Toggle a taxonomy chip: pick a value for an attribute (one value per attribute),
  // or click the active chip again to clear it.
  const toggleChip = (vKey: string, attrName: string, value: string) =>
    setVariantAttrs(vKey, (attrs) => {
      const existing = attrs.find((a) => norm(a.name) === norm(attrName));
      if (existing && norm(existing.value) === norm(value)) {
        return attrs.filter((a) => norm(a.name) !== norm(attrName));
      }
      if (existing) return attrs.map((a) => (norm(a.name) === norm(attrName) ? { ...a, name: attrName, value } : a));
      return [...attrs, { _key: uid(), name: attrName, value }];
    });

  const addCustomAttr = (vKey: string) =>
    setVariantAttrs(vKey, (attrs) => [...attrs, { _key: uid(), name: '', value: '' }]);

  const updateCustomAttr = (vKey: string, aKey: string, patch: Partial<LocalAttr>) =>
    setVariantAttrs(vKey, (attrs) => attrs.map((a) => (a._key === aKey ? { ...a, ...patch } : a)));

  const removeCustomAttr = (vKey: string, aKey: string) =>
    setVariantAttrs(vKey, (attrs) => attrs.filter((a) => a._key !== aKey));

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const url = await uploadSubmissionImage(file);
      setImages((p) => [...p, url]);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Upload failed');
    }
    e.target.value = ''; // reset so same file can be re-selected
  };

  const removeImage = (url: string) => setImages((p) => p.filter((u) => u !== url));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      categoryId,
      images,
      description: trimmed(description),
      details: trimmed(details),
      materials: trimmed(materials),
      shipping: trimmed(shipping),
      variants: variants.map((v) => ({
        sku: v.sku, price: v.price, originalPrice: v.originalPrice, stock: v.stock, moq: v.moq,
        // Drop half-filled custom rows so we never submit blank attribute pairs.
        attributes: v.attributes
          .filter((a) => a.name.trim() && a.value.trim())
          .map((a) => ({ name: a.name, value: a.value })),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Product basics ───────────────────────────────────────────────── */}
      <section className={card}>
        <h2 className={`${sectionTitle} mb-4`}>Product details</h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sub-name" className={labelCls}>
                Product name <span className="text-[#d8524d]">*</span>
              </label>
              <input
                id="sub-name"
                required
                placeholder="e.g. Handwoven cotton throw"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="sub-category" className={labelCls}>
                Category <span className="text-[#d8524d]">*</span>
              </label>
              <select
                id="sub-category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={field}
              >
                <option value="">Select category…</option>
                {cats.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="sub-description" className={labelCls}>Description</label>
            <textarea
              id="sub-description"
              rows={3}
              placeholder="Short product description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="sub-details" className={labelCls}>Details</label>
            <textarea
              id="sub-details"
              rows={4}
              placeholder="Full product details / specifications"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className={field}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sub-materials" className={labelCls}>Materials</label>
              <input
                id="sub-materials"
                placeholder="e.g. 100% cotton"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="sub-shipping" className={labelCls}>Shipping</label>
              <input
                id="sub-shipping"
                placeholder="e.g. Ships in 5–7 days"
                value={shipping}
                onChange={(e) => setShipping(e.target.value)}
                className={field}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Images ───────────────────────────────────────────────────────── */}
      <section className={card}>
        <h2 className={`${sectionTitle} mb-1`}>Images</h2>
        <p className="mb-4 text-[12px] text-muted">Upload one or more product photos.</p>
        <label
          htmlFor="submission-image-upload"
          className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-dashed border-line bg-white/50 px-4 py-2.5 text-sm font-semibold text-slate transition hover:border-accent hover:text-accent"
        >
          ＋ Add image
          <input
            id="submission-image-upload"
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
          />
        </label>
        {uploadError && <p className="mt-2 text-xs text-[#d8524d]">{uploadError}</p>}
        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {images.map((url) => (
              <span
                key={url}
                className="font-jbmono inline-flex max-w-[10rem] items-center gap-1.5 rounded-full border border-line bg-white/70 px-3 py-1 text-[11px] text-slate"
              >
                <span className="truncate">{url.split('/').pop()}</span>
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  aria-label="Remove image"
                  className="flex-none text-muted hover:text-[#d8524d]"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── Variants ─────────────────────────────────────────────────────── */}
      <section className={card}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className={sectionTitle}>Variants</h2>
            <p className="text-[12px] text-muted">Pricing, stock and attributes per SKU.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkOpen((o) => !o)}
              className={`rounded-[9px] border px-3 py-1.5 text-[12px] font-semibold ${
                bulkOpen
                  ? 'border-accent bg-accent text-white'
                  : 'border-line bg-white/60 text-slate hover:bg-white'
              }`}
            >
              Bulk add
            </button>
            <button
              type="button"
              onClick={() => setVariants((vs) => [...vs, emptyVariant()])}
              className="rounded-[9px] border border-[rgba(20,155,142,.25)] bg-[rgba(20,155,142,.08)] px-3 py-1.5 text-[12px] font-semibold text-accent hover:bg-[rgba(20,155,142,.14)]"
            >
              ＋ Add variant
            </button>
          </div>
        </div>

        {bulkOpen && (
          <div className="mb-4">
            <BulkVariantPanel
              catalog={attrCatalog}
              onGenerate={addBulk}
              onCancel={() => setBulkOpen(false)}
            />
          </div>
        )}

        <div className="space-y-4">
          {variants.map((v, i) => (
            <div key={v._key} className="rounded-[14px] border border-line bg-white/50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-jbmono text-[11px] font-bold uppercase tracking-[.05em] text-muted">
                  Variant {i + 1}
                </span>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(v._key)}
                    className="text-xs font-medium text-[#d8524d] hover:text-[#b8433e]"
                  >
                    Remove variant
                  </button>
                )}
              </div>

              {/* Labeled pricing/stock fields */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-5">
                <div>
                  <label htmlFor={`v-sku-${v._key}`} className={fieldLabel}>SKU</label>
                  <input
                    id={`v-sku-${v._key}`}
                    required
                    placeholder="ABC-001"
                    value={v.sku}
                    onChange={(e) => updateVariant(v._key, { sku: e.target.value })}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor={`v-price-${v._key}`} className={fieldLabel}>
                    Price <span className="text-[#d8524d]">*</span>
                  </label>
                  <input
                    id={`v-price-${v._key}`}
                    type="number"
                    min={0}
                    value={v.price}
                    onChange={(e) => updateVariant(v._key, { price: Number(e.target.value) })}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor={`v-orig-${v._key}`} className={fieldLabel}>
                    Original price <span className="text-[#d8524d]">*</span>
                  </label>
                  <input
                    id={`v-orig-${v._key}`}
                    type="number"
                    min={0}
                    value={v.originalPrice}
                    onChange={(e) => updateVariant(v._key, { originalPrice: Number(e.target.value) })}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor={`v-stock-${v._key}`} className={fieldLabel}>Stock</label>
                  <input
                    id={`v-stock-${v._key}`}
                    type="number"
                    min={0}
                    value={v.stock}
                    onChange={(e) => updateVariant(v._key, { stock: Number(e.target.value) })}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor={`v-moq-${v._key}`} className={fieldLabel}>MOQ</label>
                  <input
                    id={`v-moq-${v._key}`}
                    type="number"
                    min={1}
                    value={v.moq}
                    onChange={(e) => updateVariant(v._key, { moq: Number(e.target.value) })}
                    className={field}
                  />
                </div>
              </div>

              {/* Attributes */}
              <div className="border-t border-line pt-3">
                <p className={`${fieldLabel} mb-2`}>Attributes</p>
                <VariantAttributes
                  attributes={v.attributes}
                  catalog={attrCatalog}
                  onToggleChip={(nm, val) => toggleChip(v._key, nm, val)}
                  onAddCustom={() => addCustomAttr(v._key)}
                  onUpdateCustom={(aKey, patch) => updateCustomAttr(v._key, aKey, patch)}
                  onRemoveCustom={(aKey) => removeCustomAttr(v._key, aKey)}
                />
                {v.attributes.filter((a) => a.name.trim() && a.value.trim()).length === 0 && (
                  <p className="mt-2 text-[11px] text-[#b5801e]">
                    Add at least one attribute — required to submit this variant for review.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#176054,#179b8e)] px-[18px] py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(23,155,142,.3)] disabled:opacity-60"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
