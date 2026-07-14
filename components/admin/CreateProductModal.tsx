'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { useCreateProduct, type CreateProductBody } from '@/lib/admin/products';
import { useCategories } from '@/lib/admin/taxonomy';
import { useCompanies } from '@/lib/admin/companies';

const fieldCls =
  'w-full rounded-xl border border-line bg-white/70 px-3.5 py-2.5 text-sm text-ink transition-colors placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-[.08em] text-slate';

// Shared "Create product" modal. When `lockedCompany` is passed (from a company
// page), visibility is forced to "company" for that company and the
// visibility/owner selectors are hidden.
export default function CreateProductModal({
  onClose,
  lockedCompany,
}: {
  onClose: () => void;
  lockedCompany?: { id: string; name: string };
}) {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: companiesData, isLoading: companiesLoading } = useCompanies(1, undefined, undefined, {
    enabled: !lockedCompany,
  });
  const companies = companiesData?.items ?? [];

  const [form, setForm] = useState<CreateProductBody>({
    name: '',
    categoryId: '',
    images: [],
    description: '',
    visibility: lockedCompany ? 'company' : 'public',
    ownerCompanyId: lockedCompany?.id,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateProductBody = {
      ...form,
      ownerCompanyId: form.visibility === 'company' ? form.ownerCompanyId : undefined,
    };
    createProduct.mutate(payload, {
      onSuccess: (product) => router.push(`/admin/catalog/products/${product.slug}`),
    });
  };

  // Portal to <body> so the overlay escapes any backdrop-filter/transform ancestor
  // that would otherwise trap `fixed` positioning and let sibling cards paint over it.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-display">
      <div className="absolute inset-0 bg-[rgba(23,24,58,.45)] backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[22px] border border-white/80 bg-white/80 shadow-[0_30px_80px_rgba(23,24,58,.35)] backdrop-blur-[24px]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line/70 px-6 py-5">
          <div>
            <p className="font-jbmono text-[11px] uppercase tracking-[.14em] text-accent">
              {lockedCompany ? `Company · ${lockedCompany.name}` : 'Catalogue'}
            </p>
            <h2 className="mt-1 text-[22px] font-extrabold tracking-[-.02em] text-ink">New product</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(42,43,106,.06)] text-slate transition-colors hover:bg-[rgba(42,43,106,.12)] hover:text-ink"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label htmlFor="cp-name" className={labelCls}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="cp-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={fieldCls}
            />
          </div>

          <div>
            <label htmlFor="cp-categoryId" className={labelCls}>
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="cp-categoryId"
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className={fieldCls}
            >
              <option value="" disabled>
                {catsLoading ? 'Loading categories…' : 'Select category…'}
              </option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cp-description" className={labelCls}>
              Description
            </label>
            <textarea
              id="cp-description"
              rows={3}
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={fieldCls}
            />
          </div>

          {!lockedCompany && (
            <>
              <div>
                <span className={labelCls}>Visibility</span>
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-white/50 p-1">
                  {(['public', 'company'] as const).map((v) => {
                    const active = (form.visibility ?? 'public') === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setForm({ ...form, visibility: v })}
                        className={`rounded-lg py-2 text-sm font-semibold capitalize transition-colors ${
                          active
                            ? 'bg-gradient-to-br from-indigo to-indigo2 text-white shadow-[0_6px_16px_rgba(42,43,106,.25)]'
                            : 'text-slate hover:bg-white/70'
                        }`}
                      >
                        {v === 'public' ? 'Public' : 'Company only'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.visibility === 'company' && (
                <div>
                  <label htmlFor="cp-ownerCompanyId" className={labelCls}>
                    Owner company <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="cp-ownerCompanyId"
                    required
                    value={form.ownerCompanyId ?? ''}
                    onChange={(e) => setForm({ ...form, ownerCompanyId: e.target.value })}
                    className={fieldCls}
                  >
                    <option value="" disabled>
                      {companiesLoading ? 'Loading companies…' : 'Select company…'}
                    </option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {createProduct.error && (
            <p className="rounded-xl border border-[rgba(224,82,77,.25)] bg-[rgba(224,82,77,.08)] px-4 py-2.5 text-sm text-[#e0524d]">
              {createProduct.error instanceof ApiError
                ? createProduct.error.message
                : 'Failed to create product'}
            </p>
          )}

          <p className="text-[13px] leading-relaxed text-muted">
            Add pricing, variants and images on the next step after the product is created.
          </p>

          <div className="flex items-center justify-end gap-3 border-t border-line/70 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line bg-white/80 px-5 py-2.5 text-sm font-semibold text-indigo transition-colors hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProduct.isPending}
              className="rounded-xl bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(42,43,106,.3)] transition-shadow hover:shadow-[0_10px_28px_rgba(42,43,106,.4)] disabled:opacity-50"
            >
              {createProduct.isPending ? 'Creating…' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
