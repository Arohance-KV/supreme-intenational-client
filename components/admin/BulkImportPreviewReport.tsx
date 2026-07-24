'use client';

import type { ImportPreview } from '@/lib/admin/bulkImport';

const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-slate';
const errorBoxCls =
  'rounded-xl border border-[rgba(224,82,77,.25)] bg-[rgba(224,82,77,.08)] px-4 py-2.5 text-sm text-[#e0524d]';

type ImageEntry = { filename: string; url: string };

// Step-3 (Preview) body for BulkImportWizard: create/update counts, the admin-only
// taxonomy-auto-create confirm, the image match summary, the drag-assign grid, and the row
// error list. Pulled out of BulkImportWizard.tsx purely to keep that file under the wizard's
// ~300-line ponytail budget — this has no state of its own, it's a straight render of props.
export default function BulkImportPreviewReport({
  mode,
  preview,
  previewing,
  previewError,
  autoCreateTaxonomy,
  onAutoCreateTaxonomyChange,
  unmatchedImages,
  productsWithoutImage,
  onDropOnProduct,
}: {
  mode: 'admin' | 'seller';
  preview: ImportPreview | null;
  previewing: boolean;
  previewError: string | null;
  autoCreateTaxonomy: boolean;
  onAutoCreateTaxonomyChange: (v: boolean) => void;
  unmatchedImages: ImageEntry[];
  productsWithoutImage: string[];
  onDropOnProduct: (e: React.DragEvent<HTMLDivElement>, handle: string) => void;
}) {
  if (previewing) return <p className="text-sm text-muted">Running dry-run preview…</p>;
  if (previewError) return <p className={errorBoxCls}>{previewError}</p>;
  if (!preview) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-white/70 p-4">
          <p className={labelCls}>Will create</p>
          <p className="text-lg font-bold text-ink">
            {preview.create.products} products{' '}
            <span className="text-sm font-normal text-muted">/ {preview.create.variants} variants</span>
          </p>
        </div>
        {mode === 'admin' && (
          <div className="rounded-xl border border-line bg-white/70 p-4">
            <p className={labelCls}>Will update</p>
            <p className="text-lg font-bold text-ink">
              {preview.update.products} products{' '}
              <span className="text-sm font-normal text-muted">/ {preview.update.variants} variants</span>
            </p>
          </div>
        )}
      </div>

      {mode === 'admin' && (preview.newCategories.length > 0 || preview.newAttributeValues.length > 0) && (
        <label className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate">
          <input
            type="checkbox"
            checked={autoCreateTaxonomy}
            onChange={(e) => onAutoCreateTaxonomyChange(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <strong className="text-ink">Auto-create new taxonomy</strong> — this import introduces
            {preview.newCategories.length > 0 && (
              <>
                {' '}
                {preview.newCategories.length} new categor{preview.newCategories.length === 1 ? 'y' : 'ies'} (
                {preview.newCategories.join(', ')})
              </>
            )}
            {preview.newCategories.length > 0 && preview.newAttributeValues.length > 0 && ' and'}
            {preview.newAttributeValues.length > 0 && (
              <>
                {' '}
                {preview.newAttributeValues.length} new attribute value{preview.newAttributeValues.length === 1 ? '' : 's'} (
                {preview.newAttributeValues.map((v) => `${v.attribute}: ${v.value}`).join(', ')})
              </>
            )}
            . Check to create them automatically — otherwise those rows will fail.
          </span>
        </label>
      )}

      <div className="rounded-xl border border-line bg-white/70 p-4 text-sm text-slate">
        <p className={labelCls}>Images</p>
        <p>
          {preview.images.matched} matched · {unmatchedImages.length} unassigned · {productsWithoutImage.length} product
          {productsWithoutImage.length === 1 ? '' : 's'} without a photo
        </p>
      </div>

      {(unmatchedImages.length > 0 || productsWithoutImage.length > 0) && (
        <div className="rounded-xl border border-line bg-white/60 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate">
            Drag an unassigned photo onto a product
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {unmatchedImages.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.filename}
                src={img.url}
                alt={img.filename}
                title={img.filename}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(img))}
                className="h-16 w-16 cursor-grab rounded-lg border border-line object-cover"
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {productsWithoutImage.map((handle) => (
              <div
                key={handle}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDropOnProduct(e, handle)}
                className="rounded-lg border border-dashed border-line px-3 py-2 text-xs text-slate"
              >
                {handle}
              </div>
            ))}
          </div>
        </div>
      )}

      {preview.errors.length > 0 && (
        <div className={errorBoxCls}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide">
            {preview.errors.length} row error{preview.errors.length === 1 ? '' : 's'}
          </p>
          <ul className="max-h-32 space-y-1 overflow-y-auto text-xs">
            {preview.errors.map((err, i) => (
              <li key={i}>
                Row {err.row}: {err.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
