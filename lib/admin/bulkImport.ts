// Bulk product + image import: client API + bounded-concurrency folder uploader (B2).
// Mirrors the raw-multipart-fetch pattern already used by uploadAdminImage/importProductsCsv
// in ./products.ts (admin token + x-session-id headers, no `adminFetch` for multipart since
// the browser must set its own boundary), and `adminFetch` for the plain-JSON preview/commit
// calls. Types below mirror server/src/services/catalog/product-import.service.ts EXACTLY
// (ImportPreview / ImportResult): keep both in sync if the server shape changes.
import { adminFetch } from './api';
import { ApiError } from '@/lib/api';
import { getSessionId } from '@/lib/session';
import { uploadAdminImage } from './products';

// ── Types (mirror server ImportPreview / ImportResult exactly) ────────────────

export interface ImportPreview {
  create: { products: number; variants: number };
  update: { products: number; variants: number };
  newCategories: string[];
  newAttributeValues: { attribute: string; value: string }[];
  images: { matched: number; unmatched: { filename: string; url: string }[]; productsWithoutImage: string[] };
  errors: { row: number; reason: string }[];
}

export interface ImportResult {
  imported: number;
  updated: number;
  variants: number;
  failed: { row: number; reason: string }[];
}

// ── Helpers for the raw multipart/auth-fetch calls ────────────────────────────

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  return {
    'x-session-id': getSessionId(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── parseSheet: multipart upload, mirrors importProductsCsv exactly ──────────

export async function parseSheet(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const fd = new FormData();
  fd.append('file', file);

  const res = await fetch(`${apiBase()}/admin/products/import/parse`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  });

  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.message ?? 'Sheet parsing failed', res.status);
  }
  return json.data as { headers: string[]; rows: Record<string, string>[] };
}

// ── preview / commit: plain JSON via adminFetch ──────────────────────────────

export function previewImport(
  rows: Record<string, string>[],
  images: { filename: string; url: string }[],
): Promise<ImportPreview> {
  return adminFetch<ImportPreview>('/admin/products/import/preview', {
    method: 'POST',
    body: { rows, images },
  });
}

export function commitImportBatch(
  rows: Record<string, string>[],
  images: { filename: string; url: string }[],
  autoCreateTaxonomy: boolean,
): Promise<ImportResult> {
  return adminFetch<ImportResult>('/admin/products/import/commit', {
    method: 'POST',
    body: { rows, images, autoCreateTaxonomy },
  });
}

// ── uploadFolderWith: the testable bounded-concurrency core ─────────────────

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i;

// Bounded worker pool: at most `concurrency` uploads run at once, regardless of how many
// files are queued. A naive `files.map(uploader)` + `Promise.all` starts every upload
// simultaneously (no bound at all): this instead keeps `concurrency` workers alive, each
// pulling the next file off a shared cursor as soon as it finishes its current one, so a
// slot is reused the instant it frees up rather than waiting for the whole batch.
export async function uploadFolderWith(
  files: File[],
  uploader: (f: File) => Promise<string>,
  onProgress: (done: number, total: number) => void,
  concurrency = 6,
): Promise<{ map: { filename: string; url: string }[]; failed: string[] }> {
  const total = files.length;
  const map: { filename: string; url: string }[] = [];
  const failed: string[] = [];

  if (total === 0) return { map, failed };

  let nextIndex = 0;
  let done = 0;

  async function worker(): Promise<void> {
    for (;;) {
      const i = nextIndex++;
      if (i >= total) return;
      const file = files[i];
      try {
        const url = await uploader(file);
        map.push({ filename: file.name, url });
      } catch {
        failed.push(file.name);
      } finally {
        done++;
        onProgress(done, total);
      }
    }
  }

  const workerCount = Math.min(concurrency, total);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return { map, failed };
}

export function uploadFolder(
  files: File[],
  onProgress: (done: number, total: number) => void,
  concurrency = 6,
): Promise<{ map: { filename: string; url: string }[]; failed: string[] }> {
  const imageFiles = files.filter((f) => IMAGE_EXTENSIONS.test(f.name));
  return uploadFolderWith(imageFiles, (f) => uploadAdminImage(f, 'products'), onProgress, concurrency);
}

// ── downloadTemplate: GET /admin/products/import/template requires admin auth ────────────
//
// GOTCHA: this route sits behind adminRouter.use(isAdmin) like every other admin route (Bearer
// token + x-session-id), and it responds with a raw xlsx binary, NOT the { success, data }
// JSON envelope every other admin endpoint uses. A bare `<a href={...}>` navigation sends
// neither auth header, so it would 401: this instead does an authenticated fetch, reads the
// body as a Blob, and clicks a throwaway object-URL anchor to trigger the browser download.
export async function downloadTemplate(): Promise<void> {
  const res = await fetch(`${apiBase()}/admin/products/import/template`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    let message = 'Template download failed';
    try {
      const json = await res.json();
      message = json?.message ?? message;
    } catch {
      // Response wasn't JSON (expected on success; on failure the error middleware still
      // sends JSON, but fall back to the generic message if that ever changes).
    }
    throw new ApiError(message, res.status);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'product-import-template.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
