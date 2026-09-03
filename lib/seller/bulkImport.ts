// Bulk product + image import: seller mirror of ./lib/admin/bulkImport.ts (C1). Mirrors the
// raw-multipart-fetch pattern already used by uploadSubmissionImage/importSubmissionsCsv in
// ./submissions.ts (seller token + x-session-id headers + credentials:'include', no `apiFetch`
// for multipart since the browser must set its own boundary). Types are the SAME
// ImportPreview/ImportResult shapes as admin's bulkImport.ts (server returns the identical
// productImportService.plan()/commit() payload for both modes): re-exported from there rather
// than redeclared, so both portals can never drift out of sync.
import { ApiError } from '@/lib/api';
import { getSessionId } from '@/lib/session';
import { uploadSubmissionImage } from './submissions';
import { uploadFolderWith, type ImportPreview, type ImportResult } from '@/lib/admin/bulkImport';

export type { ImportPreview, ImportResult };

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sellerToken') : null;
  return {
    'x-session-id': getSessionId(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── parseSheet: multipart upload -> { headers, rows } ────────────────────────

export async function parseSheet(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const fd = new FormData();
  fd.append('file', file);

  const res = await fetch(`${apiBase()}/seller/submissions/import/parse`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: fd,
  });

  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.message ?? 'Sheet parsing failed', res.status);
  }
  return json.data as { headers: string[]; rows: Record<string, string>[] };
}

// ── preview / commit: plain JSON fetch (no `adminFetch` equivalent for sellers) ──────────

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.message ?? 'Request failed', res.status);
  }
  return json.data as T;
}

export function previewImport(
  rows: Record<string, string>[],
  images: { filename: string; url: string }[],
): Promise<ImportPreview> {
  return postJson<ImportPreview>('/seller/submissions/import/preview', { rows, images });
}

// Sellers have no autoCreateTaxonomy flag (reject-and-report always), unlike admin's
// commitImportBatch, this never sends that field at all.
export function commitImportBatch(
  rows: Record<string, string>[],
  images: { filename: string; url: string }[],
): Promise<ImportResult> {
  return postJson<ImportResult>('/seller/submissions/import/commit', { rows, images });
}

// ── uploadFolder: same bounded-concurrency core as admin, seller image-upload endpoint ───

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i;

export function uploadFolder(
  files: File[],
  onProgress: (done: number, total: number) => void,
  concurrency = 6,
): Promise<{ map: { filename: string; url: string }[]; failed: string[] }> {
  const imageFiles = files.filter((f) => IMAGE_EXTENSIONS.test(f.name));
  return uploadFolderWith(imageFiles, (f) => uploadSubmissionImage(f), onProgress, concurrency);
}

// No downloadTemplate: sellers have no GET /submissions/import/template route.
