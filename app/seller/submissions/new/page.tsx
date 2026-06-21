'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';
import { useCreateSubmission, uploadSubmissionImage, type DraftVariant } from '@/lib/seller/submissions';

interface Cat { _id: string; name: string; }
const emptyVariant = (): DraftVariant => ({ sku: '', price: 0, originalPrice: 0, stock: 0, moq: 1, attributes: [] });

export default function NewSubmissionPage() {
  const router = useRouter();
  const create = useCreateSubmission();
  const { data: cats = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Cat[]>('/catalog/categories'),
    staleTime: 300_000,
  });

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<DraftVariant[]>([emptyVariant()]);
  const [error, setError] = useState<string | null>(null);

  const updateVariant = (i: number, patch: Partial<DraftVariant>) =>
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadSubmissionImage(file);
      setImages((p) => [...p, url]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const created = await create.mutateAsync({ name, categoryId, images, variants });
      router.push('/seller/submissions/' + created._id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create submission');
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-zinc-900 mb-6">New product submission</h1>
      <form onSubmit={onSubmit} className="space-y-5">
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
          <label className="block text-sm font-medium mb-1">Images</label>
          <input type="file" accept="image/*" onChange={onUpload} />
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
                <div key={ai} className="grid grid-cols-2 gap-2">
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
                    className="rounded border border-zinc-300 px-2 py-1 text-sm"
                  />
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

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={create.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {create.isPending ? 'Saving…' : 'Save draft'}
        </button>
      </form>
    </main>
  );
}
