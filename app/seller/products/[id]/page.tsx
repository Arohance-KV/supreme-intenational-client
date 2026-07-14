'use client';
import { use, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  useMyProduct,
  useUpdateProduct,
  useAddVariant,
  useUpdateVariant,
  useAdjustStock,
  useDeleteVariant,
} from '@/lib/seller/products';
import type { ProductVariant } from '@/lib/catalog';
import { useConfirm } from '@/components/ConfirmDialog';

// ---------- Variant row ----------

function VariantRow({
  variant,
  productId,
}: {
  variant: ProductVariant;
  productId: string;
}) {
  const { confirm } = useConfirm();
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    sku: variant.sku,
    price: variant.price,
    originalPrice: variant.originalPrice,
    moq: variant.moq,
  });

  const updateVariant = useUpdateVariant(productId);
  const adjustStock = useAdjustStock(productId);
  const deleteVariant = useDeleteVariant(productId);

  const handleSave = () => {
    updateVariant.mutate(
      { variantId: variant._id, body: fields },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleAdjust = (delta: number) => {
    adjustStock.mutate({ variantId: variant._id, delta });
  };

  const handleDelete = async () => {
    if (await confirm({ title: 'Delete variant', message: 'Delete this variant?', confirmLabel: 'Delete', tone: 'danger' })) {
      deleteVariant.mutate(variant._id);
    }
  };

  const mutError =
    updateVariant.error ?? adjustStock.error ?? deleteVariant.error;

  return (
    <tr className="border-b border-zinc-100 text-sm">
      <td className="px-3 py-2 text-zinc-700">
        {editing ? (
          <input
            id={`sku-${variant._id}`}
            aria-label="SKU"
            value={fields.sku}
            onChange={(e) => setFields({ ...fields, sku: e.target.value })}
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
          />
        ) : (
          variant.sku
        )}
      </td>
      <td className="px-3 py-2 text-zinc-700">
        {editing ? (
          <input
            id={`price-${variant._id}`}
            aria-label="Price"
            type="number"
            min={0}
            value={fields.price}
            onChange={(e) => setFields({ ...fields, price: Number(e.target.value) })}
            className="w-24 rounded border border-zinc-300 px-2 py-1 text-sm"
          />
        ) : (
          `₹${variant.price.toLocaleString()}`
        )}
      </td>
      <td className="px-3 py-2 text-zinc-700">
        {editing ? (
          <input
            id={`original-price-${variant._id}`}
            aria-label="Original Price"
            type="number"
            min={0}
            value={fields.originalPrice}
            onChange={(e) => setFields({ ...fields, originalPrice: Number(e.target.value) })}
            className="w-24 rounded border border-zinc-300 px-2 py-1 text-sm"
          />
        ) : (
          `₹${variant.originalPrice.toLocaleString()}`
        )}
      </td>
      <td className="px-3 py-2 text-zinc-700">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleAdjust(-1)}
            disabled={adjustStock.isPending}
            aria-label="Decrease stock by 1"
            className="rounded border border-zinc-200 px-1.5 py-0.5 text-xs hover:bg-zinc-50 disabled:opacity-60"
          >
            −
          </button>
          <span className="w-10 text-center">{variant.stock}</span>
          <button
            onClick={() => handleAdjust(1)}
            disabled={adjustStock.isPending}
            aria-label="Increase stock by 1"
            className="rounded border border-zinc-200 px-1.5 py-0.5 text-xs hover:bg-zinc-50 disabled:opacity-60"
          >
            +
          </button>
        </div>
      </td>
      <td className="px-3 py-2 text-zinc-700">
        {editing ? (
          <input
            id={`moq-${variant._id}`}
            aria-label="MOQ"
            type="number"
            min={1}
            value={fields.moq}
            onChange={(e) => setFields({ ...fields, moq: Number(e.target.value) })}
            className="w-20 rounded border border-zinc-300 px-2 py-1 text-sm"
          />
        ) : (
          variant.moq
        )}
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={updateVariant.isPending}
                className="rounded bg-blue-600 px-2 py-1 text-xs text-white disabled:opacity-60"
              >
                {updateVariant.isPending ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleteVariant.isPending}
            className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
        {mutError && (
          <p className="mt-1 text-xs text-red-600">
            {mutError instanceof ApiError ? mutError.message : 'Error'}
          </p>
        )}
      </td>
    </tr>
  );
}

// ---------- Add variant form ----------

function AddVariantForm({ productId }: { productId: string }) {
  const addVariant = useAddVariant(productId);
  const [form, setForm] = useState({
    sku: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    moq: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVariant.mutate(form as Record<string, unknown>, {
      onSuccess: () =>
        setForm({ sku: '', price: 0, originalPrice: 0, stock: 0, moq: 1 }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded border border-dashed border-zinc-300 p-4">
      <p className="mb-3 text-sm font-medium text-zinc-700">Add variant</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
        <div>
          <label htmlFor="new-sku" className="mb-1 block text-xs text-zinc-600">
            SKU
          </label>
          <input
            id="new-sku"
            required
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label htmlFor="new-price" className="mb-1 block text-xs text-zinc-600">
            Price
          </label>
          <input
            id="new-price"
            type="number"
            min={0}
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label htmlFor="new-original-price" className="mb-1 block text-xs text-zinc-600">
            Original price
          </label>
          <input
            id="new-original-price"
            type="number"
            min={0}
            value={form.originalPrice}
            onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label htmlFor="new-stock" className="mb-1 block text-xs text-zinc-600">
            Stock
          </label>
          <input
            id="new-stock"
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label htmlFor="new-moq" className="mb-1 block text-xs text-zinc-600">
            MOQ
          </label>
          <input
            id="new-moq"
            type="number"
            min={1}
            value={form.moq}
            onChange={(e) => setForm({ ...form, moq: Number(e.target.value) })}
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
      </div>
      {addVariant.error && (
        <p className="mt-2 text-xs text-red-600">
          {addVariant.error instanceof ApiError ? addVariant.error.message : 'Failed to add variant'}
        </p>
      )}
      <button
        type="submit"
        disabled={addVariant.isPending}
        className="mt-3 rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
      >
        {addVariant.isPending ? 'Adding…' : 'Add variant'}
      </button>
    </form>
  );
}

// ---------- Main page ----------

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useMyProduct(id);
  const updateProduct = useUpdateProduct(id);

  const [fields, setFields] = useState<{
    name: string;
    description: string;
    details: string;
    materials: string;
    shipping: string;
    category: string;
  } | null>(null);

  // Initialise edit fields from loaded data (once)
  if (data && !fields) {
    const p = data.product;
    setFields({
      name: p.name,
      description: p.description,
      details: p.details,
      materials: p.materials,
      shipping: p.shipping,
      category: p.category ?? '',
    });
  }

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-sm text-red-600">
          {error instanceof ApiError ? error.message : 'Failed to load product.'}
        </p>
      </main>
    );
  }

  const { product, variants } = data;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields) return;
    updateProduct.mutate(fields as Record<string, unknown>);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900">{product.name}</h1>

      {/* ── Section 1: Editable product fields ── */}
      <section className="rounded border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-800">Product details</h2>
        {fields && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="product-name" className="mb-1 block text-sm font-medium text-zinc-700">
                Name
              </label>
              <input
                id="product-name"
                required
                value={fields.name}
                onChange={(e) => setFields({ ...fields, name: e.target.value })}
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="product-description" className="mb-1 block text-sm font-medium text-zinc-700">
                Description
              </label>
              <textarea
                id="product-description"
                rows={3}
                value={fields.description}
                onChange={(e) => setFields({ ...fields, description: e.target.value })}
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="product-details" className="mb-1 block text-sm font-medium text-zinc-700">
                Details
              </label>
              <textarea
                id="product-details"
                rows={2}
                value={fields.details}
                onChange={(e) => setFields({ ...fields, details: e.target.value })}
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="product-materials" className="mb-1 block text-sm font-medium text-zinc-700">
                Materials
              </label>
              <input
                id="product-materials"
                value={fields.materials}
                onChange={(e) => setFields({ ...fields, materials: e.target.value })}
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="product-shipping" className="mb-1 block text-sm font-medium text-zinc-700">
                Shipping
              </label>
              <input
                id="product-shipping"
                value={fields.shipping}
                onChange={(e) => setFields({ ...fields, shipping: e.target.value })}
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="product-category" className="mb-1 block text-sm font-medium text-zinc-700">
                Category
              </label>
              <input
                id="product-category"
                value={fields.category}
                onChange={(e) => setFields({ ...fields, category: e.target.value })}
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>

            {updateProduct.error && (
              <p className="text-sm text-red-600">
                {updateProduct.error instanceof ApiError
                  ? updateProduct.error.message
                  : 'Save failed.'}
              </p>
            )}
            {updateProduct.isSuccess && (
              <p className="text-sm text-green-600">Saved.</p>
            )}

            <button
              type="submit"
              disabled={updateProduct.isPending}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {updateProduct.isPending ? 'Saving…' : 'Save'}
            </button>
          </form>
        )}
      </section>

      {/* ── Section 2: Variants ── */}
      <section className="rounded border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-800">
          Variants ({variants.length})
        </h2>

        {variants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
                  <th className="px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium">Original Price</th>
                  <th className="px-3 py-2 font-medium">Stock</th>
                  <th className="px-3 py-2 font-medium">MOQ</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <VariantRow key={v._id} variant={v} productId={id} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No variants yet.</p>
        )}

        <AddVariantForm productId={id} />
      </section>
    </main>
  );
}
