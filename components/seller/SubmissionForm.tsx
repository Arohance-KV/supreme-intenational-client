'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';
import { uploadSubmissionImage, type DraftVariant, type SubmissionInput } from '@/lib/seller/submissions';

interface Cat { _id: string; name: string; }

const emptyVariant = (): DraftVariant => ({
  sku: '', price: 0, originalPrice: 0, stock: 0, moq: 1, attributes: [],
});

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
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<DraftVariant[]>(
    initial?.variants && initial.variants.length > 0 ? initial.variants : [emptyVariant()],
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const updateVariant = (i: number, patch: Partial<DraftVariant>) =>
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  const removeVariant = (i: number) =>
    setVariants((vs) => vs.length > 1 ? vs.filter((_, idx) => idx !== i) : vs);

  const removeAttribute = (variantIdx: number, attrIdx: number) =>
    updateVariant(variantIdx, {
      attributes: variants[variantIdx].attributes.filter((_, xi) => xi !== attrIdx),
    });

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
    // reset so same file can be re-selected
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, categoryId, images, variants });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        required
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
      />
      <select
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
          <div key={i} className="rounded border border-zinc-200 p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-zinc-500">Variant {i + 1}</span>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove variant
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariant(i, { sku: e.target.value })}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              />
              <input
                type="number"
                min={0}
                placeholder="Price"
                value={v.price}
                onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              />
              <input
                type="number"
                min={0}
                placeholder="Original price"
                value={v.originalPrice}
                onChange={(e) => updateVariant(i, { originalPrice: Number(e.target.value) })}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              />
              <input
                type="number"
                min={0}
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              />
              <input
                type="number"
                min={1}
                placeholder="MOQ"
                value={v.moq}
                onChange={(e) => updateVariant(i, { moq: Number(e.target.value) })}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </div>
            {v.attributes.map((a, ai) => (
              <div key={ai} className="grid grid-cols-2 gap-2 items-center">
                <input
                  placeholder="Attribute (e.g. Color)"
                  value={a.name}
                  onChange={(e) =>
                    updateVariant(i, {
                      attributes: v.attributes.map((x, xi) =>
                        xi === ai ? { ...x, name: e.target.value } : x
                      ),
                    })
                  }
                  className="rounded border border-zinc-300 px-2 py-1 text-sm"
                />
                <div className="flex gap-1 items-center">
                  <input
                    placeholder="Value (e.g. Red)"
                    value={a.value}
                    onChange={(e) =>
                      updateVariant(i, {
                        attributes: v.attributes.map((x, xi) =>
                          xi === ai ? { ...x, value: e.target.value } : x
                        ),
                      })
                    }
                    className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttribute(i, ai)}
                    className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                updateVariant(i, { attributes: [...v.attributes, { name: '', value: '' }] })
              }
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
