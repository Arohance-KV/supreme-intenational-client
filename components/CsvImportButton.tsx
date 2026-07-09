'use client';

import { useRef, useState } from 'react';
import { ApiError } from '@/lib/api';
import type { ImportResult } from '@/lib/admin/products';

// Shared "Excel upload" control for the admin + seller portals. Accepts a .csv, posts it via
// `importFn`, and shows a result report (imported count + per-row failures). "Template"
// downloads the header CSV client-side. ponytail: CSV only — Excel opens/saves it natively.
export default function CsvImportButton({
  importFn,
  templateCsv,
  templateName,
  onImported,
  className = '',
}: {
  importFn: (file: File) => Promise<ImportResult>;
  templateCsv: string;
  templateName: string;
  onImported?: () => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([templateCsv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = templateName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setPending(true);
    setError(null);
    setResult(null);
    try {
      const res = await importFn(file);
      setResult(res);
      if (res.imported > 0) onImported?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Import failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-medium text-slate hover:bg-white disabled:opacity-60"
        >
          {pending ? 'Importing…' : '↑ Excel upload'}
        </button>
        <button
          type="button"
          onClick={downloadTemplate}
          className="text-xs font-medium text-indigo hover:underline"
        >
          Template
        </button>
      </div>

      {error && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="mt-2 rounded-xl border border-line bg-white/80 px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium text-ink">
              Imported {result.imported} · {result.variants} variant{result.variants === 1 ? '' : 's'}
              {result.failed.length > 0 && (
                <span className="text-red-600"> · {result.failed.length} row{result.failed.length === 1 ? '' : 's'} skipped</span>
              )}
            </p>
            <button onClick={() => setResult(null)} className="text-muted hover:text-slate" aria-label="Dismiss">✕</button>
          </div>
          {result.failed.length > 0 && (
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-red-600">
              {result.failed.map((f, i) => (
                <li key={i}>{f.row ? `Row ${f.row}: ` : ''}{f.reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
