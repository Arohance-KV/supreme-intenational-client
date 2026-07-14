'use client';

import { use, useState, useRef } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import {
  useAdminProduct,
  useUpdateProduct,
  useCreateVariant,
  useBulkCreateVariants,
  useUpdateVariant,
  useAdjustStock,
  useDeleteVariant,
  useSetFlashSale,
  uploadAdminImage,
  type AdminProductDetail,
  type UpdateProductBody,
  type UpdateVariantBody,
  type FlashSaleBody,
} from '@/lib/admin/products';
import { useAttributes } from '@/lib/admin/taxonomy';
import { StatusChip } from '@/components/admin/StatusChip';
import { useConfirm } from '@/components/ConfirmDialog';
import type { ProductVariant } from '@/lib/catalog';

// ── Helpers ───────────────────────────────────────────────────────────────────

function inr(n: unknown): string {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
}

// ── Flash-sale row (inline expand) ────────────────────────────────────────────

function FlashSaleEditor({
  variant,
  productId,
  slug,
}: {
  variant: ProductVariant;
  productId: string;
  slug: string;
}) {
  const setFlashSale = useSetFlashSale(productId, slug);
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<FlashSaleBody>({
    flashSalePrice: variant.flashSalePrice ?? null,
    flashSaleEndsAt: variant.flashSaleEndsAt ?? null,
  });

  const handleSave = () => {
    setFlashSale.mutate(
      { variantId: variant._id, body: fields },
      { onSuccess: () => setOpen(false) },
    );
  };

  const handleClear = () => {
    setFlashSale.mutate(
      { variantId: variant._id, body: { flashSalePrice: null, flashSaleEndsAt: null } },
      { onSuccess: () => setOpen(false) },
    );
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-violet-600 hover:underline"
      >
        {variant.flashSalePrice != null ? `Flash: ${inr(variant.flashSalePrice)}` : 'Flash sale'}
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-1 rounded border border-violet-200 bg-violet-50 p-2 text-xs">
      <div className="flex items-center gap-2">
        <label className="w-16 text-slate">Price</label>
        <input
          type="number"
          min={0}
          value={fields.flashSalePrice ?? ''}
          onChange={(e) =>
            setFields({ ...fields, flashSalePrice: e.target.value ? Number(e.target.value) : null })
          }
          className="w-24 rounded border border-line px-1.5 py-0.5 text-xs"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="w-16 text-slate">Ends at</label>
        <input
          type="datetime-local"
          value={fields.flashSaleEndsAt ? fields.flashSaleEndsAt.slice(0, 16) : ''}
          onChange={(e) =>
            setFields({
              ...fields,
              flashSaleEndsAt: e.target.value ? new Date(e.target.value).toISOString() : null,
            })
          }
          className="rounded border border-line px-1.5 py-0.5 text-xs"
        />
      </div>
      {setFlashSale.error && (
        <p className="text-red-600">
          {setFlashSale.error instanceof ApiError ? setFlashSale.error.message : 'Error'}
        </p>
      )}
      <div className="flex gap-1 pt-1">
        <button
          onClick={handleSave}
          disabled={setFlashSale.isPending}
          className="rounded bg-violet-600 px-2 py-0.5 text-xs text-white disabled:opacity-60"
        >
          Save
        </button>
        <button
          onClick={handleClear}
          disabled={setFlashSale.isPending}
          className="rounded border border-line px-2 py-0.5 text-xs text-slate"
        >
          Clear
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded border border-line px-2 py-0.5 text-xs text-slate"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Variant row ────────────────────────────────────────────────────────────────

function VariantRow({
  variant,
  productId,
  slug,
}: {
  variant: ProductVariant;
  productId: string;
  slug: string;
}) {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState<UpdateVariantBody>({
    sku: variant.sku,
    price: variant.price,
    originalPrice: variant.originalPrice,
    moq: variant.moq,
    images: variant.images,
    isActive: variant.isActive,
  });

  const updateVariant = useUpdateVariant(productId, slug);
  const adjustStock = useAdjustStock(productId, slug);
  const deleteVariant = useDeleteVariant(productId, slug);
  const { confirm } = useConfirm();

  const handleSave = () => {
    updateVariant.mutate(
      { variantId: variant._id, body: fields },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleDelete = async () => {
    if (!(await confirm({ title: 'Delete variant', message: `Delete variant ${variant.sku || variant._id}?`, confirmLabel: 'Delete', tone: 'danger' }))) return;
    deleteVariant.mutate(variant._id);
  };

  const attrLabel = Array.isArray(variant.attributes) && variant.attributes.length
    ? variant.attributes.map((a) => `${a.attributeName}: ${a.valueLabel}`).join(', ')
    : '—';

  const mutError =
    updateVariant.error ?? adjustStock.error ?? deleteVariant.error;

  return (
    <>
    <tr className={`text-sm align-top ${editing ? '' : 'border-b border-line'}`}>
      {/* SKU */}
      <td className="px-3 py-2 text-slate">
        {editing ? (
          <input
            aria-label="SKU"
            value={fields.sku ?? ''}
            onChange={(e) => setFields({ ...fields, sku: e.target.value })}
            className="w-full rounded border border-line px-2 py-1 text-sm"
          />
        ) : (
          <div className="flex items-center gap-2">
            {variant.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={variant.images[0]} alt="" className="h-8 w-8 flex-none rounded border border-line object-cover" />
            ) : (
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded border border-dashed border-line text-[9px] text-muted">img</span>
            )}
            <span className="font-jbmono text-xs">{variant.sku || '—'}</span>
          </div>
        )}
      </td>

      {/* Attributes */}
      <td className="px-3 py-2 text-xs text-slate">{attrLabel}</td>

      {/* Price */}
      <td className="px-3 py-2 text-slate">
        {editing ? (
          <input
            aria-label="Price"
            type="number"
            min={0}
            value={fields.price ?? 0}
            onChange={(e) => setFields({ ...fields, price: Number(e.target.value) })}
            className="w-24 rounded border border-line px-2 py-1 text-sm"
          />
        ) : (
          inr(variant.price)
        )}
      </td>

      {/* Original price */}
      <td className="px-3 py-2 text-slate">
        {editing ? (
          <input
            aria-label="Original Price"
            type="number"
            min={0}
            value={fields.originalPrice ?? 0}
            onChange={(e) => setFields({ ...fields, originalPrice: Number(e.target.value) })}
            className="w-24 rounded border border-line px-2 py-1 text-sm"
          />
        ) : (
          inr(variant.originalPrice)
        )}
      </td>

      {/* Stock */}
      <td className="px-3 py-2 text-slate">
        <div className="flex items-center gap-1">
          <button
            onClick={() => adjustStock.mutate({ variantId: variant._id, delta: -1 })}
            disabled={adjustStock.isPending}
            aria-label="Decrease stock by 1"
            className="rounded border border-line px-1.5 py-0.5 text-xs hover:bg-white/60 disabled:opacity-60"
          >
            −
          </button>
          <span className="w-10 text-center">{typeof variant.stock === 'number' ? variant.stock : '—'}</span>
          <button
            onClick={() => adjustStock.mutate({ variantId: variant._id, delta: 1 })}
            disabled={adjustStock.isPending}
            aria-label="Increase stock by 1"
            className="rounded border border-line px-1.5 py-0.5 text-xs hover:bg-white/60 disabled:opacity-60"
          >
            +
          </button>
        </div>
      </td>

      {/* MOQ */}
      <td className="px-3 py-2 text-slate">
        {editing ? (
          <input
            aria-label="MOQ"
            type="number"
            min={1}
            value={fields.moq ?? 1}
            onChange={(e) => setFields({ ...fields, moq: Number(e.target.value) })}
            className="w-20 rounded border border-line px-2 py-1 text-sm"
          />
        ) : (
          variant.moq
        )}
      </td>

      {/* Active */}
      <td className="px-3 py-2">
        {editing ? (
          <select
            value={fields.isActive ? 'true' : 'false'}
            onChange={(e) => setFields({ ...fields, isActive: e.target.value === 'true' })}
            className="rounded border border-line px-1.5 py-0.5 text-xs"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        ) : (
          <StatusChip
            status={variant.isActive ? 'active' : 'inactive'}
            label={variant.isActive ? 'Active' : 'Inactive'}
          />
        )}
      </td>

      {/* Flash sale */}
      <td className="px-3 py-2">
        <FlashSaleEditor variant={variant} productId={productId} slug={slug} />
      </td>

      {/* Actions */}
      <td className="px-3 py-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={updateVariant.isPending}
                  className="rounded bg-blue-600 px-2 py-1 text-xs text-white disabled:opacity-60"
                >
                  {updateVariant.isPending ? '…' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded border border-line px-2 py-1 text-xs text-slate hover:bg-white/60"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="rounded border border-line px-2 py-1 text-xs text-slate hover:bg-white/60"
              >
                Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleteVariant.isPending}
              className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Del
            </button>
          </div>
          {mutError && (
            <p className="text-xs text-red-600">
              {mutError instanceof ApiError ? mutError.message : 'Error'}
            </p>
          )}
        </div>
      </td>
    </tr>
    {editing && (
      <tr className="border-b border-line">
        <td colSpan={9} className="px-3 pb-3">
          <p className="mb-2 text-xs font-medium text-slate">Variant images</p>
          <ImageManager
            images={fields.images ?? []}
            folder="variants"
            onUpdate={(imgs) => setFields({ ...fields, images: imgs })}
          />
        </td>
      </tr>
    )}
    </>
  );
}

// ── Add variant form ───────────────────────────────────────────────────────────

// Value chips for picking attribute values. `multi` toggles between single-value
// (single variant) and multi-value (bulk combinations) selection per attribute.
function AttributeValuePicker({
  attributes,
  isSelected,
  onToggle,
}: {
  attributes: ReturnType<typeof useAttributes>['data'];
  isSelected: (attrId: string, valueId: string) => boolean;
  onToggle: (attrId: string, valueId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {(attributes ?? []).map((attr) => (
        <div key={attr._id}>
          <p className="mb-1.5 text-xs font-medium text-slate">
            {attr.name}
            {attr.unit ? ` (${attr.unit})` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {attr.values
              .filter((v) => v.isActive)
              .map((val) => {
                const selected = isSelected(attr._id, val._id);
                return (
                  <button
                    key={val._id}
                    type="button"
                    onClick={() => onToggle(attr._id, val._id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      selected
                        ? 'border-indigo bg-indigo text-white'
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
  );
}

const inputCls = 'w-full rounded border border-line px-2 py-1 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20';

function AddVariantForm({ productId, slug }: { productId: string; slug: string }) {
  const { data: allAttributes = [], isLoading: attrLoading } = useAttributes();
  const createVariant = useCreateVariant(productId, slug);
  const bulkCreate = useBulkCreateVariants(productId, slug);

  // Only attributes that are active and have at least one active value are usable.
  const attributes = allAttributes.filter(
    (a) => a.isActive && a.values.some((v) => v.isActive),
  );

  const [mode, setMode] = useState<'single' | 'bulk' | null>(null);

  // Single mode: one value per attribute, plus pricing.
  const [singleValues, setSingleValues] = useState<Record<string, string>>({});
  const [single, setSingle] = useState({ sku: '', price: 0, originalPrice: 0, stock: 0, moq: 1 });
  const [singleImages, setSingleImages] = useState<string[]>([]);

  // Bulk mode: a set of values per attribute → server creates all combinations.
  const [bulkValues, setBulkValues] = useState<Record<string, Set<string>>>({});
  const [bulk, setBulk] = useState({ defaultPrice: 0, defaultOriginalPrice: 0, defaultStock: 0, defaultMoq: 1 });

  const reset = () => {
    setMode(null);
    setSingleValues({});
    setSingle({ sku: '', price: 0, originalPrice: 0, stock: 0, moq: 1 });
    setSingleImages([]);
    setBulkValues({});
    setBulk({ defaultPrice: 0, defaultOriginalPrice: 0, defaultStock: 0, defaultMoq: 1 });
  };

  // Number of variants bulk mode will create = product of selected counts per attribute.
  const bulkCombinations = Object.values(bulkValues)
    .filter((s) => s.size > 0)
    .reduce((acc, s) => acc * s.size, 1);
  const hasBulkSelection = Object.values(bulkValues).some((s) => s.size > 0);

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const attrs = Object.entries(singleValues)
      .filter(([, valueId]) => !!valueId)
      .map(([attributeId, valueId]) => ({ attributeId, valueId }));
    if (attrs.length === 0) return;
    createVariant.mutate({ ...single, images: singleImages, attributes: attrs }, { onSuccess: reset });
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const attrs = Object.entries(bulkValues)
      .filter(([, set]) => set.size > 0)
      .map(([attributeId, set]) => ({ attributeId, valueIds: Array.from(set) }));
    if (attrs.length === 0) return;
    bulkCreate.mutate({ ...bulk, attributes: attrs }, { onSuccess: reset });
  };

  // Mode picker (collapsed state)
  if (mode === null) {
    return (
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => setMode('single')}
          className="rounded bg-gradient-to-br from-indigo to-indigo2 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          + Add variant
        </button>
        <button
          onClick={() => setMode('bulk')}
          className="rounded border border-line px-3 py-1.5 text-xs font-medium text-slate hover:bg-white/60"
        >
          Bulk create
        </button>
      </div>
    );
  }

  if (!attrLoading && attributes.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        No usable attributes yet. Go to{' '}
        <Link href="/admin/catalog/attributes" className="font-semibold underline">
          Attributes
        </Link>{' '}
        and add some (with values) first.{' '}
        <button onClick={reset} className="ml-1 underline">
          Cancel
        </button>
      </div>
    );
  }

  const mutError = mode === 'single' ? createVariant.error : bulkCreate.error;
  const submitting = mode === 'single' ? createVariant.isPending : bulkCreate.isPending;

  return (
    <form
      onSubmit={mode === 'single' ? handleSingleSubmit : handleBulkSubmit}
      className="mt-4 space-y-4 rounded-[20px] border border-dashed border-line p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">
          {mode === 'single' ? 'Add single variant' : 'Bulk create variants'}
        </p>
        {mode === 'bulk' && hasBulkSelection && (
          <span className="rounded-full bg-indigo px-3 py-1 text-xs font-semibold text-white">
            {bulkCombinations} variant{bulkCombinations !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {mode === 'bulk' && (
        <p className="text-xs text-muted">
          Select multiple values per attribute — every combination is created automatically.
        </p>
      )}

      <AttributeValuePicker
        attributes={attributes}
        isSelected={(attrId, valueId) =>
          mode === 'single'
            ? singleValues[attrId] === valueId
            : bulkValues[attrId]?.has(valueId) ?? false
        }
        onToggle={(attrId, valueId) => {
          if (mode === 'single') {
            setSingleValues((prev) => ({
              ...prev,
              [attrId]: prev[attrId] === valueId ? '' : valueId,
            }));
          } else {
            setBulkValues((prev) => {
              const set = new Set(prev[attrId] ?? []);
              if (set.has(valueId)) set.delete(valueId);
              else set.add(valueId);
              return { ...prev, [attrId]: set };
            });
          }
        }}
      />

      {mode === 'single' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          <div>
            <label htmlFor="nv-sku" className="mb-1 block text-xs text-slate">SKU</label>
            <input
              id="nv-sku"
              value={single.sku}
              onChange={(e) => setSingle({ ...single, sku: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="nv-price" className="mb-1 block text-xs text-slate">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              id="nv-price"
              type="number"
              min={0}
              required
              value={single.price}
              onChange={(e) => setSingle({ ...single, price: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="nv-orig" className="mb-1 block text-xs text-slate">
              Original price <span className="text-red-500">*</span>
            </label>
            <input
              id="nv-orig"
              type="number"
              min={0}
              required
              value={single.originalPrice}
              onChange={(e) => setSingle({ ...single, originalPrice: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="nv-stock" className="mb-1 block text-xs text-slate">Stock</label>
            <input
              id="nv-stock"
              type="number"
              min={0}
              value={single.stock}
              onChange={(e) => setSingle({ ...single, stock: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="nv-moq" className="mb-1 block text-xs text-slate">MOQ</label>
            <input
              id="nv-moq"
              type="number"
              min={1}
              value={single.moq}
              onChange={(e) => setSingle({ ...single, moq: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor="bv-price" className="mb-1 block text-xs text-slate">
              Default price <span className="text-red-500">*</span>
            </label>
            <input
              id="bv-price"
              type="number"
              min={1}
              required
              value={bulk.defaultPrice}
              onChange={(e) => setBulk({ ...bulk, defaultPrice: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="bv-orig" className="mb-1 block text-xs text-slate">
              Default original price <span className="text-red-500">*</span>
            </label>
            <input
              id="bv-orig"
              type="number"
              min={1}
              required
              value={bulk.defaultOriginalPrice}
              onChange={(e) => setBulk({ ...bulk, defaultOriginalPrice: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="bv-stock" className="mb-1 block text-xs text-slate">Default stock</label>
            <input
              id="bv-stock"
              type="number"
              min={0}
              value={bulk.defaultStock}
              onChange={(e) => setBulk({ ...bulk, defaultStock: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="bv-moq" className="mb-1 block text-xs text-slate">Default MOQ</label>
            <input
              id="bv-moq"
              type="number"
              min={1}
              value={bulk.defaultMoq}
              onChange={(e) => setBulk({ ...bulk, defaultMoq: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
        </div>
      )}

      {mode === 'single' && (
        <div>
          <label className="mb-1 block text-xs text-slate">Images (optional)</label>
          <ImageManager images={singleImages} folder="variants" onUpdate={setSingleImages} />
        </div>
      )}

      {mode === 'bulk' && (
        <p className="text-xs text-muted">
          SKUs are auto-generated. Default MOQ applies to every variant — edit any row afterwards to set individual prices or images.
        </p>
      )}

      {mutError && (
        <p className="text-xs text-red-600">
          {mutError instanceof ApiError ? mutError.message : 'Failed to create variant(s)'}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || (mode === 'bulk' && !hasBulkSelection)}
          className="rounded bg-gradient-to-br from-indigo to-indigo2 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60 hover:opacity-90"
        >
          {submitting
            ? 'Creating…'
            : mode === 'single'
              ? 'Add variant'
              : `Create ${hasBulkSelection ? bulkCombinations : ''} variant${bulkCombinations !== 1 ? 's' : ''}`}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded border border-line px-3 py-1.5 text-xs text-slate hover:bg-white/60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Image manager ──────────────────────────────────────────────────────────────

function ImageManager({
  images,
  onUpdate,
  folder = 'products',
}: {
  images: string[];
  onUpdate: (imgs: string[]) => void;
  folder?: 'products' | 'variants';
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadAdminImage(file, folder);
      onUpdate([...images, url]);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeImage = (url: string) => {
    onUpdate(images.filter((i) => i !== url));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((url) => (
          <div key={url} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="product"
              className="h-20 w-20 rounded border border-line object-cover"
            />
            <button
              onClick={() => removeImage(url)}
              className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white group-hover:flex"
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <p className="text-xs text-muted">No images yet.</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="text-xs text-slate file:mr-2 file:rounded file:border-0 file:bg-black/5 file:px-3 file:py-1 file:text-xs file:font-medium file:text-slate hover:file:bg-black/10"
        />
        {uploading && <span className="text-xs text-muted">Uploading…</span>}
      </div>
      {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
    </div>
  );
}

// ── Product core fields form ───────────────────────────────────────────────────

function ProductEditForm({
  product,
  productId,
  slug,
}: {
  product: AdminProductDetail;
  productId: string;
  slug: string;
}) {
  const updateProduct = useUpdateProduct(productId, slug);
  const [fields, setFields] = useState<UpdateProductBody>({
    name: product.name,
    description: product.description,
    details: product.details,
    materials: product.materials,
    shipping: product.shipping,
    images: product.images,
    badge: product.badge,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    rating: product.rating,
    totalReviews: product.totalReviews,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProduct.mutate(fields);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="p-name" className="mb-1 block text-sm font-medium text-slate">
            Name
          </label>
          <input
            id="p-name"
            required
            value={fields.name ?? ''}
            onChange={(e) => setFields({ ...fields, name: e.target.value })}
            className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate">Slug (immutable)</label>
          <input
            readOnly
            value={product.slug}
            className="w-full rounded border border-line bg-white/50 px-3 py-2 text-sm text-muted"
          />
        </div>
      </div>

      <div>
        <label htmlFor="p-description" className="mb-1 block text-sm font-medium text-slate">
          Description
        </label>
        <textarea
          id="p-description"
          rows={3}
          value={fields.description ?? ''}
          onChange={(e) => setFields({ ...fields, description: e.target.value })}
          className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="p-details" className="mb-1 block text-sm font-medium text-slate">
            Details
          </label>
          <textarea
            id="p-details"
            rows={2}
            value={fields.details ?? ''}
            onChange={(e) => setFields({ ...fields, details: e.target.value })}
            className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label htmlFor="p-materials" className="mb-1 block text-sm font-medium text-slate">
            Materials
          </label>
          <input
            id="p-materials"
            value={fields.materials ?? ''}
            onChange={(e) => setFields({ ...fields, materials: e.target.value })}
            className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="p-shipping" className="mb-1 block text-sm font-medium text-slate">
          Shipping
        </label>
        <input
          id="p-shipping"
          value={fields.shipping ?? ''}
          onChange={(e) => setFields({ ...fields, shipping: e.target.value })}
          className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {/* Badge */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="p-badge-label" className="mb-1 block text-sm font-medium text-slate">
            Badge label
          </label>
          <input
            id="p-badge-label"
            value={fields.badge?.label ?? ''}
            onChange={(e) => {
              const label = e.target.value;
              setFields({
                ...fields,
                badge: label
                  ? { label, variant: fields.badge?.variant ?? 'primary' }
                  : null,
              });
            }}
            className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="e.g. New arrival"
          />
        </div>
        <div>
          <label htmlFor="p-badge-variant" className="mb-1 block text-sm font-medium text-slate">
            Badge variant
          </label>
          <select
            id="p-badge-variant"
            value={fields.badge?.variant ?? 'primary'}
            onChange={(e) =>
              setFields({
                ...fields,
                badge: fields.badge
                  ? { ...fields.badge, variant: e.target.value as 'primary' | 'accent' }
                  : null,
              })
            }
            className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="primary">Primary</option>
            <option value="accent">Accent</option>
          </select>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-slate">
          <input
            type="checkbox"
            checked={!!fields.isFeatured}
            onChange={(e) => setFields({ ...fields, isFeatured: e.target.checked })}
            className="rounded"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-slate">
          <input
            type="checkbox"
            checked={!!fields.isActive}
            onChange={(e) => setFields({ ...fields, isActive: e.target.checked })}
            className="rounded"
          />
          Active
        </label>
      </div>

      {/* Ratings (manual override) */}
      <div className="rounded-xl border border-line bg-white/40 p-4">
        <p className="text-sm font-medium text-ink">Ratings (manual override)</p>
        <p className="mb-3 mt-0.5 text-xs text-muted">
          Seed or adjust the displayed rating. Writing actual reviews in the Reviews tab recomputes these automatically.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="p-rating" className="mb-1 block text-xs text-slate">
              Rating (0–5)
            </label>
            <input
              id="p-rating"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={fields.rating ?? 0}
              onChange={(e) => setFields({ ...fields, rating: Math.min(5, Math.max(0, Number(e.target.value))) })}
              className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div>
            <label htmlFor="p-total-reviews" className="mb-1 block text-xs text-slate">
              Review count
            </label>
            <input
              id="p-total-reviews"
              type="number"
              min={0}
              value={fields.totalReviews ?? 0}
              onChange={(e) => setFields({ ...fields, totalReviews: Math.max(0, Math.floor(Number(e.target.value))) })}
              className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate">Images</p>
        <ImageManager
          images={fields.images ?? []}
          onUpdate={(imgs) => setFields({ ...fields, images: imgs })}
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
        <p className="text-sm text-green-600">Saved successfully.</p>
      )}

      <button
        type="submit"
        disabled={updateProduct.isPending}
        className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:opacity-90 transition-colors"
      >
        {updateProduct.isPending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

// ── Variants section ───────────────────────────────────────────────────────────

function VariantsSection({
  variants,
  productId,
  slug,
}: {
  variants: ProductVariant[];
  productId: string;
  slug: string;
}) {
  return (
    <section className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5">
      <h2 className="mb-4 text-base font-semibold text-ink">
        Variants ({variants.length})
      </h2>

      {variants.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase text-slate">
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Attributes</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Orig Price</th>
                <th className="px-3 py-2 font-medium">Stock</th>
                <th className="px-3 py-2 font-medium">MOQ</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Flash</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                // Use v._id as stable key — never use array index
                <VariantRow key={v._id} variant={v} productId={productId} slug={slug} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate">No variants yet.</p>
      )}

      <AddVariantForm productId={productId} slug={slug} />
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // The [id] segment carries the SLUG (detail GET is by slug).
  // Create/update/delete use the real _id from the loaded product.
  const { id: slug } = use(params);

  const { data, isLoading, error } = useAdminProduct(slug);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-black/5" />
        <div className="h-64 animate-pulse rounded-[20px] bg-black/5" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error instanceof ApiError ? error.message : 'Failed to load product.'}
      </div>
    );
  }

  const { product, variants } = data;
  const productId = product._id;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate">
        <Link href="/admin/catalog/products" className="hover:underline">
          Products
        </Link>
        <span>/</span>
        <span className="text-ink font-medium truncate">{product.name}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{product.name}</h1>
          <p className="mt-1 text-xs text-muted font-jbmono">{product.slug}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusChip
            status={product.isActive ? 'active' : 'inactive'}
            label={product.isActive ? 'Active' : 'Inactive'}
          />
          {product.isFeatured && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              Featured
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-white/70 border border-line px-2 py-0.5 text-xs text-slate capitalize">
            {product.visibility}
          </span>
        </div>
      </div>

      {/* Core fields */}
      <section className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">Product details</h2>
        <ProductEditForm product={product} productId={productId} slug={slug} />
      </section>

      {/* Variants */}
      <VariantsSection variants={variants} productId={productId} slug={slug} />
    </div>
  );
}
