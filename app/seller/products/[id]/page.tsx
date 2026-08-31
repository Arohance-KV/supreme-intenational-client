'use client';
import { use, useState } from 'react';
import Link from 'next/link';
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
import { GstRateInput } from '@/components/GstRateInput';

// Shared field styling — matches the admin catalogue edit page.
const inputCls =
  'w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';
const inputSm =
  'w-full rounded border border-line px-2 py-1 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';
const labelCls = 'mb-1 block text-sm font-medium text-slate';
const primaryBtn =
  'rounded-xl bg-[linear-gradient(135deg,#176054,#179b8e)] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(23,155,142,.3)] disabled:opacity-60';
const section =
  'rounded-[20px] border border-white/80 bg-white/90 shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5 sm:p-6';

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
    <tr className="border-b border-line text-sm last:border-0">
      <td className="px-3 py-2.5 text-slate">
        {editing ? (
          <input
            id={`sku-${variant._id}`}
            aria-label="SKU"
            value={fields.sku}
            onChange={(e) => setFields({ ...fields, sku: e.target.value })}
            className={inputSm}
          />
        ) : (
          <span className="font-jbmono text-xs">{variant.sku}</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-slate">
        {editing ? (
          <input
            id={`price-${variant._id}`}
            aria-label="Price"
            type="number"
            min={0}
            value={fields.price}
            onChange={(e) => setFields({ ...fields, price: Number(e.target.value) })}
            className={`w-24 ${inputSm}`}
          />
        ) : (
          `₹${variant.price.toLocaleString('en-IN')}`
        )}
      </td>
      <td className="px-3 py-2.5 text-slate">
        {editing ? (
          <input
            id={`original-price-${variant._id}`}
            aria-label="Original Price"
            type="number"
            min={0}
            value={fields.originalPrice}
            onChange={(e) => setFields({ ...fields, originalPrice: Number(e.target.value) })}
            className={`w-24 ${inputSm}`}
          />
        ) : (
          `₹${variant.originalPrice.toLocaleString('en-IN')}`
        )}
      </td>
      <td className="px-3 py-2.5 text-slate">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleAdjust(-1)}
            disabled={adjustStock.isPending}
            aria-label="Decrease stock by 1"
            className="rounded border border-line px-1.5 py-0.5 text-xs hover:bg-white/60 disabled:opacity-60"
          >
            −
          </button>
          <span className="w-10 text-center">{variant.stock}</span>
          <button
            onClick={() => handleAdjust(1)}
            disabled={adjustStock.isPending}
            aria-label="Increase stock by 1"
            className="rounded border border-line px-1.5 py-0.5 text-xs hover:bg-white/60 disabled:opacity-60"
          >
            +
          </button>
        </div>
      </td>
      <td className="px-3 py-2.5 text-slate">
        {editing ? (
          <input
            id={`moq-${variant._id}`}
            aria-label="MOQ"
            type="number"
            min={1}
            value={fields.moq}
            onChange={(e) => setFields({ ...fields, moq: Number(e.target.value) })}
            className={`w-20 ${inputSm}`}
          />
        ) : (
          variant.moq
        )}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={updateVariant.isPending}
                className="rounded-lg bg-[linear-gradient(135deg,#176054,#179b8e)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
              >
                {updateVariant.isPending ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded border border-line px-2.5 py-1 text-xs text-slate hover:bg-white/60"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="rounded border border-line px-2.5 py-1 text-xs text-slate hover:bg-white/60"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleteVariant.isPending}
            className="rounded border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
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
    <form onSubmit={handleSubmit} className="mt-4 rounded-[16px] border border-dashed border-line p-5">
      <p className="mb-3 text-sm font-semibold text-ink">Add variant</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        <div>
          <label htmlFor="new-sku" className="mb-1 block text-xs text-slate">
            SKU
          </label>
          <input
            id="new-sku"
            required
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className={inputSm}
          />
        </div>
        <div>
          <label htmlFor="new-price" className="mb-1 block text-xs text-slate">
            Price
          </label>
          <input
            id="new-price"
            type="number"
            min={0}
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className={inputSm}
          />
        </div>
        <div>
          <label htmlFor="new-original-price" className="mb-1 block text-xs text-slate">
            Original price
          </label>
          <input
            id="new-original-price"
            type="number"
            min={0}
            value={form.originalPrice}
            onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
            className={inputSm}
          />
        </div>
        <div>
          <label htmlFor="new-stock" className="mb-1 block text-xs text-slate">
            Stock
          </label>
          <input
            id="new-stock"
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className={inputSm}
          />
        </div>
        <div>
          <label htmlFor="new-moq" className="mb-1 block text-xs text-slate">
            MOQ
          </label>
          <input
            id="new-moq"
            type="number"
            min={1}
            value={form.moq}
            onChange={(e) => setForm({ ...form, moq: Number(e.target.value) })}
            className={inputSm}
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
        className="mt-3 rounded-lg bg-[linear-gradient(135deg,#176054,#179b8e)] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
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
    hsn: string;
    gstRate: number;
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
      hsn: p.hsn ?? '',
      gstRate: p.gstRate ?? 5,
    });
  }

  if (isLoading) {
    return (
      <div className="px-6 py-6 sm:px-8 sm:py-7">
        <div className="h-8 w-64 animate-pulse rounded bg-black/5" />
        <div className="mt-6 h-64 animate-pulse rounded-[20px] bg-black/5" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-6 py-6 sm:px-8 sm:py-7">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error instanceof ApiError ? error.message : 'Failed to load product.'}
        </div>
      </div>
    );
  }

  const { product, variants } = data;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields) return;
    updateProduct.mutate(fields as Record<string, unknown>);
  };

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-7">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate">
        <Link href="/seller/products" className="hover:underline">
          My Products
        </Link>
        <span>/</span>
        <span className="truncate font-medium text-ink">{product.name}</span>
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight text-ink">{product.name}</h1>

      {/* ── Section 1: Editable product fields ── */}
      <section className={section}>
        <h2 className="mb-4 text-base font-semibold text-ink">Product details</h2>
        {fields && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="product-name" className={labelCls}>
                  Name
                </label>
                <input
                  id="product-name"
                  required
                  value={fields.name}
                  onChange={(e) => setFields({ ...fields, name: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="product-category" className={labelCls}>
                  Category
                </label>
                <input
                  id="product-category"
                  value={fields.category}
                  onChange={(e) => setFields({ ...fields, category: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="product-description" className={labelCls}>
                Description
              </label>
              <textarea
                id="product-description"
                rows={3}
                value={fields.description}
                onChange={(e) => setFields({ ...fields, description: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="product-details" className={labelCls}>
                  Details
                </label>
                <textarea
                  id="product-details"
                  rows={2}
                  value={fields.details}
                  onChange={(e) => setFields({ ...fields, details: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="product-materials" className={labelCls}>
                  Materials
                </label>
                <input
                  id="product-materials"
                  value={fields.materials}
                  onChange={(e) => setFields({ ...fields, materials: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="product-shipping" className={labelCls}>
                Shipping
              </label>
              <input
                id="product-shipping"
                value={fields.shipping}
                onChange={(e) => setFields({ ...fields, shipping: e.target.value })}
                className={inputCls}
              />
            </div>

            {/* Tax */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="product-hsn" className={labelCls}>
                  HSN code
                </label>
                <input
                  id="product-hsn"
                  value={fields.hsn}
                  onChange={(e) => setFields({ ...fields, hsn: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="product-gstRate" className={labelCls}>
                  GST rate
                </label>
                <GstRateInput
                  id="product-gstRate"
                  value={fields.gstRate}
                  onChange={(gstRate) => setFields({ ...fields, gstRate })}
                  className={inputCls}
                />
              </div>
            </div>

            {updateProduct.error && (
              <p className="text-sm text-red-600">
                {updateProduct.error instanceof ApiError
                  ? updateProduct.error.message
                  : 'Save failed.'}
              </p>
            )}
            {updateProduct.isSuccess && (
              <p className="text-sm text-[#1a8f5a]">Saved successfully.</p>
            )}

            <button type="submit" disabled={updateProduct.isPending} className={primaryBtn}>
              {updateProduct.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        )}
      </section>

      {/* ── Section 2: Variants ── */}
      <section className={section}>
        <h2 className="mb-4 text-base font-semibold text-ink">
          Variants ({variants.length})
        </h2>

        {variants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase text-slate">
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
          <p className="text-sm text-slate">No variants yet.</p>
        )}

        <AddVariantForm productId={id} />
      </section>
    </div>
  );
}
