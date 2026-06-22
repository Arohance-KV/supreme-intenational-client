'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';
import { uploadSubmissionImage, type SubmissionInput } from '@/lib/seller/submissions';

interface Cat { _id: string; name: string; }

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

  const [name, setName] = useState(initial?.name ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [details, setDetails] = useState(initial?.details ?? '');
  const [materials, setMaterials] = useState(initial?.materials ?? '');
  const [shipping, setShipping] = useState(initial?.shipping ?? '');
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<LocalVariant[]>(toLocalVariants(initial));
  const [uploadError, setUploadError] = useState<string | null>(null);

  const updateVariant = (key: string, patch: Partial<LocalVariant>) =>
    setVariants((vs) => vs.map((v) => (v._key === key ? { ...v, ...patch } : v)));

  const removeVariant = (key: string) =>
    setVariants((vs) => (vs.length > 1 ? vs.filter((v) => v._key !== key) : vs));

  const updateAttr = (vKey: string, aKey: string, patch: Partial<LocalAttr>) =>
    setVariants((vs) => vs.map((v) => v._key === vKey
      ? { ...v, attributes: v.attributes.map((a) => (a._key === aKey ? { ...a, ...patch } : a)) }
      : v));

  const addAttr = (vKey: string) =>
    setVariants((vs) => vs.map((v) => v._key === vKey
      ? { ...v, attributes: [...v.attributes, { _key: uid(), name: '', value: '' }] }
      : v));

  const removeAttr = (vKey: string, aKey: string) =>
    setVariants((vs) => vs.map((v) => v._key === vKey
      ? { ...v, attributes: v.attributes.filter((a) => a._key !== aKey) }
      : v));

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
        attributes: v.attributes.map((a) => ({ name: a.name, value: a.value })),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="sub-name" className="block text-sm font-medium mb-1">Product name</label>
        <input
          id="sub-name"
          required
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="sub-category" className="block text-sm font-medium mb-1">Category</label>
        <select
          id="sub-category"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">Select category…</option>
          {cats.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sub-description" className="block text-sm font-medium mb-1">Description</label>
        <textarea
          id="sub-description"
          placeholder="Short product description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="sub-details" className="block text-sm font-medium mb-1">Details</label>
        <textarea
          id="sub-details"
          placeholder="Full product details / specifications"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="sub-materials" className="block text-sm font-medium mb-1">Materials</label>
          <input
            id="sub-materials"
            placeholder="e.g. 100% cotton"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="sub-shipping" className="block text-sm font-medium mb-1">Shipping</label>
          <input
            id="sub-shipping"
            placeholder="e.g. Ships in 5–7 days"
            value={shipping}
            onChange={(e) => setShipping(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="submission-image-upload" className="block text-sm font-medium mb-1">
          Images
        </label>
        <input
          id="submission-image-upload"
          type="file"
          accept="image/*"
          onChange={onUpload}
        />
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((url) => (
            <span key={url} className="text-xs text-zinc-500 truncate max-w-[8rem]">
              {url.split('/').pop()}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold">Variants</p>
        {variants.map((v, i) => (
          <div key={v._key} className="rounded border border-zinc-200 p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-zinc-500">Variant {i + 1}</span>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(v._key)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove variant
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                aria-label={`Variant ${i + 1} SKU`}
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariant(v._key, { sku: e.target.value })}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              />
              <input
                type="number"
                min={0}
                aria-label={`Variant ${i + 1} price`}
                placeholder="Price"
                value={v.price}
                onChange={(e) => updateVariant(v._key, { price: Number(e.target.value) })}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              />
              <input
                type="number"
                min={0}
                aria-label={`Variant ${i + 1} original price`}
                placeholder="Original price"
                value={v.originalPrice}
                onChange={(e) => updateVariant(v._key, { originalPrice: Number(e.target.value) })}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              />
              <input
                type="number"
                min={0}
                aria-label={`Variant ${i + 1} stock`}
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => updateVariant(v._key, { stock: Number(e.target.value) })}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              />
              <input
                type="number"
                min={1}
                aria-label={`Variant ${i + 1} MOQ`}
                placeholder="MOQ"
                value={v.moq}
                onChange={(e) => updateVariant(v._key, { moq: Number(e.target.value) })}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </div>
            {v.attributes.map((a) => (
              <div key={a._key} className="grid grid-cols-2 gap-2 items-center">
                <input
                  aria-label="Attribute name"
                  placeholder="Attribute (e.g. Color)"
                  value={a.name}
                  onChange={(e) => updateAttr(v._key, a._key, { name: e.target.value })}
                  className="rounded border border-zinc-300 px-2 py-1 text-sm"
                />
                <div className="flex gap-1 items-center">
                  <input
                    aria-label="Attribute value"
                    placeholder="Value (e.g. Red)"
                    value={a.value}
                    onChange={(e) => updateAttr(v._key, a._key, { value: e.target.value })}
                    className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttr(v._key, a._key)}
                    className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addAttr(v._key)}
              className="text-xs text-blue-600"
            >
              + attribute
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setVariants((vs) => [...vs, emptyVariant()])}
          className="text-sm text-blue-600"
        >
          + add variant
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
