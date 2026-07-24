'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ApiError } from '@/lib/api';
import BulkImportPreviewReport from './BulkImportPreviewReport';
import { useAttributes } from '@/lib/admin/taxonomy';
import { buildTargets, suggestMapping, applyMapping } from '@/lib/admin/importMapping';
import {
  parseSheet,
  previewImport,
  commitImportBatch,
  uploadFolder,
  downloadTemplate,
  type ImportPreview,
  type ImportResult,
} from '@/lib/admin/bulkImport';

type Mode = 'admin' | 'seller';
type Step = 'upload' | 'map' | 'preview' | 'commit';
type ImageEntry = { filename: string; url: string };
type SheetData = { headers: string[]; rows: Record<string, string>[] };

const BATCH_SIZE = 50;

const REQUIRED_TARGETS: { key: string; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price' },
];

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: 'upload', label: 'Upload' },
  { key: 'map', label: 'Map columns' },
  { key: 'preview', label: 'Preview' },
  { key: 'commit', label: 'Import' },
];

const fieldCls =
  'w-full rounded-xl border border-line bg-white/70 px-3.5 py-2.5 text-sm text-ink transition-colors focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-slate';
const fileInputCls =
  'text-xs text-slate file:mr-2 file:rounded-[9px] file:border-0 file:bg-black/5 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate hover:file:bg-black/10';
const primaryBtnCls =
  'rounded-xl bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(42,43,106,.3)] transition-shadow hover:shadow-[0_10px_28px_rgba(42,43,106,.4)] disabled:opacity-50 disabled:pointer-events-none';
const secondaryBtnCls =
  'rounded-xl border border-line bg-white/80 px-5 py-2.5 text-sm font-semibold text-indigo transition-colors hover:bg-white disabled:opacity-50';
const errorBoxCls =
  'rounded-xl border border-[rgba(224,82,77,.25)] bg-[rgba(224,82,77,.08)] px-4 py-2.5 text-sm text-[#e0524d]';
const progressBarCls = 'h-2 w-full overflow-hidden rounded-full bg-[rgba(42,43,106,.08)]';
const progressFillCls = 'h-full rounded-full bg-gradient-to-r from-indigo to-indigo2 transition-[width]';

// Group mapped rows by their Handle (falling back to Name, then a per-row unique key so two
// blank-handle/blank-name rows never accidentally merge) — mirrors the server's own
// `slugify(handle || name)` grouping key exactly (product-import.service.ts groupRows), so a
// row this client considers "grouped with X" is exactly the group the server will build too.
// Whole groups are then packed into ~BATCH_SIZE-row chunks: a product's variant rows must
// never be split across two commit batches.
function chunkByHandle(rows: Record<string, string>[]): Record<string, string>[][] {
  const order: string[] = [];
  const groups = new Map<string, Record<string, string>[]>();
  rows.forEach((row, i) => {
    const raw = (row.handle || row.name || '').trim().toLowerCase();
    const key = raw || `__row_${i}`;
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(row);
  });

  const batches: Record<string, string>[][] = [];
  let current: Record<string, string>[] = [];
  for (const key of order) {
    const group = groups.get(key)!;
    if (current.length > 0 && current.length + group.length > BATCH_SIZE) {
      batches.push(current);
      current = [];
    }
    current.push(...group);
  }
  if (current.length) batches.push(current);
  return batches;
}

// Shared 4-step bulk product/image import wizard for the admin catalogue and seller submission
// portals. `onDone` is the wizard's only exit signal — fired when the user closes it early
// (header ✕, before commit starts) and again when they acknowledge the final commit report;
// the caller is expected to hide/unmount the wizard and refresh its product list in response.
export default function BulkImportWizard({ mode, onDone }: { mode: Mode; onDone: () => void }) {
  const { data: attributes = [], isLoading: attributesLoading } = useAttributes();
  const attributeNames = useMemo(() => attributes.map((a) => a.name), [attributes]);
  const targets = useMemo(() => buildTargets(attributeNames), [attributeNames]);
  const mappingStorageKey = `bulk-import-map:${mode}`;

  const [step, setStep] = useState<Step>('upload');

  // ── Step 1: upload sheet + image folder ──────────────────────────────────
  const [sheet, setSheet] = useState<SheetData | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [imageMap, setImageMap] = useState<ImageEntry[]>([]);
  const [folderProgress, setFolderProgress] = useState<{ done: number; total: number } | null>(null);
  const [folderFailed, setFolderFailed] = useState<string[]>([]);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  // `webkitdirectory` isn't part of the DOM lib's InputHTMLAttributes type, so it can't be set
  // as a JSX prop without a `@ts-expect-error`/cast on the element itself. Setting it
  // imperatively on the underlying node avoids that and needs no extra dependency.
  useEffect(() => {
    if (folderInputRef.current) {
      (folderInputRef.current as HTMLInputElement & { webkitdirectory: boolean }).webkitdirectory = true;
    }
  }, []);

  async function handleSheetFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setParsing(true);
    setParseError(null);
    try {
      setSheet(await parseSheet(file));
    } catch (err) {
      setParseError(err instanceof ApiError ? err.message : 'Could not read that file');
    } finally {
      setParsing(false);
    }
  }

  async function handleFolderFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setFolderProgress({ done: 0, total: files.length });
    setFolderFailed([]);
    const { map, failed } = await uploadFolder(files, (done, total) => setFolderProgress({ done, total }));
    setImageMap(map);
    setFolderFailed(failed);
  }

  async function handleDownloadTemplate() {
    setDownloadingTemplate(true);
    setTemplateError(null);
    try {
      await downloadTemplate();
    } catch (err) {
      setTemplateError(err instanceof ApiError ? err.message : 'Template download failed');
    } finally {
      setDownloadingTemplate(false);
    }
  }

  // ── Step 2: column mapping ────────────────────────────────────────────────
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const mappingInitRef = useRef(false);

  // Restore-on-mount: only once, only when the sheet + attribute-derived targets are both
  // ready, and only apply stored entries for headers that exist in THIS sheet.
  useEffect(() => {
    if (mappingInitRef.current || !sheet || attributesLoading) return;
    mappingInitRef.current = true;
    const suggested = suggestMapping(sheet.headers, targets);
    let stored: Record<string, string> = {};
    try {
      const raw = localStorage.getItem(mappingStorageKey);
      if (raw) stored = JSON.parse(raw);
    } catch {
      // malformed/blocked storage — fall back to fresh suggestions
    }
    const initial: Record<string, string> = {};
    for (const h of sheet.headers) initial[h] = h in stored ? stored[h] : (suggested[h] ?? '');
    setMapping(initial);
  }, [sheet, attributesLoading, targets, mappingStorageKey]);

  useEffect(() => {
    if (!mappingInitRef.current) return;
    try {
      localStorage.setItem(mappingStorageKey, JSON.stringify(mapping));
    } catch {
      // best-effort persistence only
    }
  }, [mapping, mappingStorageKey]);

  const missingRequired = REQUIRED_TARGETS.filter((r) => !Object.values(mapping).includes(r.key));

  // ── Step 3: preview + drag-assign ─────────────────────────────────────────
  const [mappedRows, setMappedRows] = useState<Record<string, string>[]>([]);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [autoCreateTaxonomy, setAutoCreateTaxonomy] = useState(false);
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});
  const [assignedFilenames, setAssignedFilenames] = useState<Set<string>>(new Set());

  async function goToPreview() {
    if (!sheet) return;
    setStep('preview');
    setPreviewing(true);
    setPreviewError(null);
    setPreview(null);
    setImageOverrides({});
    setAssignedFilenames(new Set());
    try {
      const mapped = applyMapping(sheet.rows, mapping);
      setMappedRows(mapped);
      setPreview(await previewImport(mapped, imageMap));
    } catch (err) {
      setPreviewError(err instanceof ApiError ? err.message : 'Preview failed');
    } finally {
      setPreviewing(false);
    }
  }

  // Dragging an unmatched thumbnail onto a photo-less product adds a synthetic
  // {filename: handle, url} entry to the image map used at commit — no re-upload, no file
  // renaming. The server's fuzzy matcher normalizes both a filename and a Handle the same way,
  // so a "filename" that already equals the target Handle matches it directly.
  function handleDropOnProduct(e: React.DragEvent<HTMLDivElement>, handle: string) {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    const img = JSON.parse(raw) as ImageEntry;
    setImageOverrides((prev) => ({ ...prev, [handle]: img.url }));
    setAssignedFilenames((prev) => new Set(prev).add(img.filename));
  }

  const unmatchedDisplayed = preview ? preview.images.unmatched.filter((img) => !assignedFilenames.has(img.filename)) : [];
  const productsWithoutImageDisplayed = preview
    ? preview.images.productsWithoutImage.filter((h) => !(h in imageOverrides))
    : [];

  // ── Step 4: batched commit ────────────────────────────────────────────────
  const [committing, setCommitting] = useState(false);
  const [commitProgress, setCommitProgress] = useState<{ done: number; total: number } | null>(null);
  const [commitResult, setCommitResult] = useState<ImportResult | null>(null);

  async function startCommit() {
    setStep('commit');
    setCommitting(true);
    setCommitResult(null);
    const batches = chunkByHandle(mappedRows);
    const finalImages: ImageEntry[] = [
      ...imageMap,
      ...Object.entries(imageOverrides).map(([handle, url]) => ({ filename: handle, url })),
    ];
    setCommitProgress({ done: 0, total: batches.length });
    const totals: ImportResult = { imported: 0, updated: 0, variants: 0, failed: [] };
    for (const batch of batches) {
      try {
        const res = await commitImportBatch(batch, finalImages, mode === 'admin' && autoCreateTaxonomy);
        totals.imported += res.imported;
        totals.updated += res.updated;
        totals.variants += res.variants;
        totals.failed.push(...res.failed);
      } catch (err) {
        totals.failed.push({ row: 0, reason: err instanceof ApiError ? err.message : 'This batch failed to commit' });
      }
      setCommitProgress((prev) => (prev ? { done: prev.done + 1, total: prev.total } : prev));
    }
    setCommitResult(totals);
    setCommitting(false);
  }

  // ── Chrome (portal to <body>, matches CreateProductModal's house pattern) ─
  // No mount-flag/effect dance: the wizard is only ever mounted by a parent's own
  // `{show && <BulkImportWizard .../>}` toggle after a button click, so it's never part of
  // the initial (server) render and there's no hydration mismatch to guard against.
  if (typeof document === 'undefined') return null;

  const stepIndex = STEP_LABELS.findIndex((s) => s.key === step);
  const canClose = !committing; // never let a mid-commit close race the batch loop's state updates

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-display">
      <div
        className="absolute inset-0 bg-[rgba(23,24,58,.45)] backdrop-blur-[3px]"
        onClick={() => canClose && onDone()}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[22px] border border-white/80 bg-white/80 shadow-[0_30px_80px_rgba(23,24,58,.35)] backdrop-blur-[24px]">
        <div className="flex items-start justify-between border-b border-line/70 px-6 py-5">
          <div>
            <p className="font-jbmono text-[11px] uppercase tracking-[.14em] text-accent">
              {mode === 'admin' ? 'Catalogue' : 'Seller catalogue'} · Bulk import
            </p>
            <h2 className="mt-1 text-[22px] font-extrabold tracking-[-.02em] text-ink">
              Step {stepIndex + 1} of {STEP_LABELS.length} — {STEP_LABELS[stepIndex].label}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => canClose && onDone()}
            disabled={!canClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(42,43,106,.06)] text-slate transition-colors hover:bg-[rgba(42,43,106,.12)] hover:text-ink disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-6">
          {step === 'upload' && (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Product sheet (.xlsx or .csv)</label>
                <input type="file" accept=".xlsx,.csv" onChange={handleSheetFile} disabled={parsing} className={fileInputCls} />
                {parsing && <p className="mt-1 text-xs text-muted">Reading file…</p>}
                {parseError && <p className="mt-1 text-xs text-[#d8524d]">{parseError}</p>}
                {sheet && (
                  <p className="mt-2 text-sm text-slate">
                    Parsed <strong>{sheet.rows.length}</strong> row{sheet.rows.length === 1 ? '' : 's'} across{' '}
                    <strong>{sheet.headers.length}</strong> columns.
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>Image folder (optional)</label>
                <input ref={folderInputRef} type="file" multiple accept="image/*" onChange={handleFolderFiles} className={fileInputCls} />
                {folderProgress && (
                  <div className="mt-2">
                    <div className={progressBarCls}>
                      <div
                        className={progressFillCls}
                        style={{ width: `${folderProgress.total ? (folderProgress.done / folderProgress.total) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      Uploaded {folderProgress.done} / {folderProgress.total}
                      {folderFailed.length > 0 && ` · ${folderFailed.length} failed`}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 border-t border-line/70 pt-4">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate}
                  className="text-xs font-semibold text-indigo hover:underline disabled:opacity-50"
                >
                  {downloadingTemplate ? 'Downloading…' : 'Download template'}
                </button>
                {templateError && <span className="text-xs text-[#d8524d]">{templateError}</span>}
              </div>
            </div>
          )}

          {step === 'map' && sheet && (
            <div className="space-y-4">
              <p className="text-sm text-slate">
                Confirm how each column in your sheet maps to a product field. We&apos;ve suggested a match — correct
                any that look wrong.
              </p>
              <div className="space-y-2">
                {sheet.headers.map((header) => (
                  <div key={header} className="flex items-center gap-3">
                    <div className="w-2/5 truncate text-sm font-medium text-ink" title={header}>
                      {header}
                    </div>
                    <span className="text-muted">→</span>
                    <select
                      value={mapping[header] ?? ''}
                      onChange={(e) => setMapping((prev) => ({ ...prev, [header]: e.target.value }))}
                      className={fieldCls}
                    >
                      {targets.map((t) => (
                        <option key={t.key || '__ignore__'} value={t.key}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              {missingRequired.length > 0 && (
                <p className="text-xs text-[#d8524d]">
                  Map a column to: {missingRequired.map((r) => r.label).join(', ')} before continuing.
                </p>
              )}
            </div>
          )}

          {step === 'preview' && (
            <BulkImportPreviewReport
              mode={mode}
              preview={preview}
              previewing={previewing}
              previewError={previewError}
              autoCreateTaxonomy={autoCreateTaxonomy}
              onAutoCreateTaxonomyChange={setAutoCreateTaxonomy}
              unmatchedImages={unmatchedDisplayed}
              productsWithoutImage={productsWithoutImageDisplayed}
              onDropOnProduct={handleDropOnProduct}
            />
          )}

          {step === 'commit' && (
            <div className="space-y-4">
              {committing && commitProgress && (
                <div>
                  <div className={progressBarCls}>
                    <div
                      className={progressFillCls}
                      style={{ width: `${commitProgress.total ? (commitProgress.done / commitProgress.total) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Committing batch {commitProgress.done} / {commitProgress.total}…
                  </p>
                </div>
              )}
              {commitResult && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-line bg-white/70 p-4">
                    <p className="text-lg font-bold text-ink">
                      {commitResult.imported} created{mode === 'admin' ? ` · ${commitResult.updated} updated` : ''} ·{' '}
                      {commitResult.variants} variants
                    </p>
                    {commitResult.failed.length > 0 && (
                      <p className="mt-1 text-sm text-[#e0524d]">
                        {commitResult.failed.length} row{commitResult.failed.length === 1 ? '' : 's'} failed
                      </p>
                    )}
                  </div>
                  {commitResult.failed.length > 0 && (
                    <ul className={`max-h-40 space-y-1 overflow-y-auto text-xs ${errorBoxCls}`}>
                      {commitResult.failed.map((f, i) => (
                        <li key={i}>
                          {f.row ? `Row ${f.row}: ` : ''}
                          {f.reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line/70 px-6 py-5">
          <div>
            {(step === 'map' || step === 'preview') && (
              <button
                type="button"
                onClick={() => setStep(step === 'map' ? 'upload' : 'map')}
                className={secondaryBtnCls}
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {step === 'upload' && (
              <button type="button" disabled={!sheet} onClick={() => setStep('map')} className={primaryBtnCls}>
                Next
              </button>
            )}
            {step === 'map' && (
              <button type="button" disabled={missingRequired.length > 0} onClick={goToPreview} className={primaryBtnCls}>
                Next
              </button>
            )}
            {step === 'preview' && (
              <button
                type="button"
                disabled={!preview || previewing || !!previewError}
                onClick={startCommit}
                className={primaryBtnCls}
              >
                Start import
              </button>
            )}
            {step === 'commit' && commitResult && (
              <button type="button" onClick={onDone} className={primaryBtnCls}>
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
