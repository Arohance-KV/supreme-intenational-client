'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import {
  useCompanies,
  useCreateCompany,
  type AdminCompany,
  type CreateCompanyBody,
} from '@/lib/admin/companies';
import { StatusChip } from '@/components/admin/StatusChip';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

// ── Create company modal ──────────────────────────────────────────────────────

function blankForm(): CreateCompanyBody {
  return {
    name: '',
    primaryContact: { name: '', email: '', isdCode: '', phoneNumber: '' },
    notes: '',
  };
}

interface CreateCompanyModalProps {
  onClose: () => void;
}

function CreateCompanyModal({ onClose }: CreateCompanyModalProps) {
  const [form, setForm] = useState<CreateCompanyBody>(blankForm());
  const createCompany = useCreateCompany();

  function setPrimary(key: keyof NonNullable<CreateCompanyBody['primaryContact']>, val: string) {
    setForm((prev) => ({
      ...prev,
      primaryContact: { ...prev.primaryContact, [key]: val },
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CreateCompanyBody = {
      name: form.name.trim(),
      notes: form.notes?.trim() || undefined,
      primaryContact: {
        name: form.primaryContact?.name?.trim() || undefined,
        email: form.primaryContact?.email?.trim() || undefined,
        isdCode: form.primaryContact?.isdCode?.trim() || undefined,
        phoneNumber: form.primaryContact?.phoneNumber?.trim() || undefined,
      },
    };
    createCompany.mutate(payload, { onSuccess: onClose });
  }

  const inputCls =
    'w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';
  const labelCls = 'mb-1 block text-sm font-medium text-slate';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto">
      <div className="my-8 w-full max-w-lg rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Create company</h2>
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
            <label className={labelCls}>
              Company name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Acme Corp"
              className={inputCls}
            />
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate">
            Primary contact (optional)
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Contact name</label>
              <input
                value={form.primaryContact?.name ?? ''}
                onChange={(e) => setPrimary('name', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Contact email</label>
              <input
                type="email"
                value={form.primaryContact?.email ?? ''}
                onChange={(e) => setPrimary('email', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>ISD code</label>
              <input
                value={form.primaryContact?.isdCode ?? ''}
                onChange={(e) => setPrimary('isdCode', e.target.value)}
                placeholder="+91"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Phone number</label>
              <input
                value={form.primaryContact?.phoneNumber ?? ''}
                onChange={(e) => setPrimary('phoneNumber', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              rows={2}
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={inputCls}
            />
          </div>

          {createCompany.error && (
            <p className="text-sm text-red-600">
              {createCompany.error instanceof ApiError
                ? createCompany.error.message
                : 'Failed to create company'}
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
              disabled={createCompany.isPending}
              className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {createCompany.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Company row ───────────────────────────────────────────────────────────────

function CompanyRow({ company }: { company: AdminCompany }) {
  return (
    <div className="grid grid-cols-[1fr_180px_160px_120px_80px] items-center gap-3 border-b border-line px-5 py-3 hover:bg-white/50 transition-colors">
      <div className="min-w-0">
        <Link
          href={`/admin/companies/${company._id}`}
          className="text-sm font-medium text-ink hover:underline truncate block"
        >
          {company.name}
        </Link>
        <span className="text-xs text-muted font-jbmono truncate block">{company.slug}</span>
      </div>
      <span className="text-xs text-slate truncate">
        {company.primaryContact?.email ?? '—'}
      </span>
      <span className="text-xs text-slate">{fmtDate(company.createdAt)}</span>
      <StatusChip status={company.status} />
      <Link
        href={`/admin/companies/${company._id}`}
        className="rounded border border-line px-3 py-1 text-xs text-slate hover:bg-white/60 text-center"
      >
        View
      </Link>
    </div>
  );
}

// ── Inner table ───────────────────────────────────────────────────────────────

function CompaniesTable() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useCompanies(page, search || undefined, statusFilter || undefined);

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search companies…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded border border-line px-3 py-2 text-sm w-56 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="ml-auto">
          <button
            onClick={() => setShowCreate(true)}
            className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            + New company
          </button>
        </div>
      </div>

      {showCreate && <CreateCompanyModal onClose={() => setShowCreate(false)} />}

      {/* Loading */}
      {isLoading && (
        <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] divide-y divide-line">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div className="h-4 w-48 rounded bg-black/5" />
              <div className="h-4 w-32 rounded bg-black/5" />
              <div className="h-4 w-24 rounded bg-black/5" />
              <div className="h-5 w-16 rounded-full bg-black/5" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : 'Failed to load companies.'}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-10 text-center">
          <p className="text-sm text-slate">No companies found.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] overflow-hidden">
          <div className="grid grid-cols-[1fr_180px_160px_120px_80px] gap-3 bg-white/50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate">
            <span>Company</span>
            <span>Contact Email</span>
            <span>Created</span>
            <span>Status</span>
            <span></span>
          </div>
          {items.map((c) => (
            <CompanyRow key={c._id} company={c} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate">
          <span>
            Page {pagination.page} of {pagination.pages} ({pagination.total.toLocaleString()} total)
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-line px-3 py-1 hover:bg-white/60 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-line px-3 py-1 hover:bg-white/60 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminCompaniesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Companies</h1>
        <p className="mt-1 text-sm text-slate">
          Manage B2E companies, employees, wallets, and catalogues
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)] p-8 text-center text-sm text-slate animate-pulse">
            Loading companies…
          </div>
        }
      >
        <CompaniesTable />
      </Suspense>
    </div>
  );
}
