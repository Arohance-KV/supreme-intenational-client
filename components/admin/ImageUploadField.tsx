'use client';

import { useRef, useState } from 'react';
import { ApiError } from '@/lib/api';
import { uploadAdminImage } from '@/lib/admin/products';
import { inputCls } from './AdminModal';

// Shared admin image field: R2 file upload (same endpoint as products) with a
// live preview and an optional "paste URL" fallback. `folder` picks the R2
// destination — must be in the server upload allowlist (admin.catalog.controller).
export default function ImageUploadField({
  value,
  onChange,
  folder,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: 'logos' | 'case-studies' | 'blogs' | 'popups' | 'categories';
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      onChange(await uploadAdminImage(file, folder));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-24 w-auto max-w-[240px] rounded-[11px] border border-line object-contain bg-white" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#d8524d] text-xs text-white"
            aria-label="Remove image"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={uploading}
          className="text-xs text-slate file:mr-2 file:rounded-[9px] file:border-0 file:bg-black/5 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate hover:file:bg-black/10"
        />
        {uploading && <span className="text-xs text-muted">Uploading…</span>}
      </div>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="or paste an image URL"
        className={inputCls}
      />
      {error && <p className="text-xs text-[#d8524d]">{error}</p>}
    </div>
  );
}
