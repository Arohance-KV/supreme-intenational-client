'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { useCreateProduct, type CreateProductBody } from '@/lib/admin/products';
import { useCategories } from '@/lib/admin/taxonomy';
import { useCompanies } from '@/lib/admin/companies';

const fieldCls =
  'w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';
const labelCls = 'mb-1 block text-sm font-medium text-slate';

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">
            {lockedCompany ? `New product for ${lockedCompany.name}` : 'Create product'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted hover:bg-black/5 hover:text-slate"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                <label htmlFor="cp-visibility" className={labelCls}>
                  Visibility
                </label>
                <select
                  id="cp-visibility"
                  value={form.visibility ?? 'public'}
                  onChange={(e) =>
                    setForm({ ...form, visibility: e.target.value as 'public' | 'company' })
                  }
                  className={fieldCls}
                >
                  <option value="public">Public</option>
                  <option value="company">Company</option>
                </select>
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
            <p className="text-sm text-red-600">
              {createProduct.error instanceof ApiError
                ? createProduct.error.message
                : 'Failed to create product'}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-line px-4 py-2 text-sm text-slate hover:bg-white/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProduct.isPending}
              className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {createProduct.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
