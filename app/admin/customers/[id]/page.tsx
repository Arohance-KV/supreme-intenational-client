'use client';

import { use } from 'react';
import Link from 'next/link';
import { useCustomer } from '@/lib/admin/customers';
import { StatusChip } from '@/components/admin/StatusChip';
import { inr, fmtDateTime } from '@/lib/admin/format';

const GLASS = 'border border-white/80 bg-white/90 shadow-[0_10px_30px_rgba(34,36,90,.07)]';

export default function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError } = useCustomer(id);

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto space-y-6">
        <div className="h-7 w-48 rounded bg-black/5 animate-pulse" />
        <div className={`rounded-[20px] ${GLASS} p-6 space-y-3 animate-pulse`}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-4 w-full rounded bg-black/5" />)}
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="max-w-4xl mx-auto space-y-4">
        <Link href="/admin/customers" className="text-sm text-slate hover:underline">← Back to Customers</Link>
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Customer not found or not assigned to you.
        </div>
      </main>
    );
  }

  const { customer, quotations, catalogues } = data;
  const name = `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || '—';

  return (
    <main className="max-w-4xl mx-auto space-y-6">
      <Link href="/admin/customers" className="text-sm text-slate hover:underline">← Back to Customers</Link>

      {/* Profile */}
      <section className={`rounded-[20px] ${GLASS} p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">{name}</h1>
            <p className="mt-0.5 text-sm text-slate">{customer.email}</p>
          </div>
          <span className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize bg-black/[.05] text-slate">
            {customer.accountType}
          </span>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {customer.phoneNumber && (
            <div className="flex justify-between gap-2"><dt className="text-slate">Phone</dt>
              <dd className="text-ink">{customer.isdCode ? `+${customer.isdCode} ` : ''}{customer.phoneNumber}</dd></div>
          )}
          {(customer.companyName || customer.company?.name) && (
            <div className="flex justify-between gap-2"><dt className="text-slate">Company</dt>
              <dd className="text-ink truncate">{customer.companyName || customer.company?.name}</dd></div>
          )}
          <div className="flex justify-between gap-2"><dt className="text-slate">Verified</dt>
            <dd className={customer.verified ? 'text-[#1a8f5a]' : 'text-muted'}>{customer.verified ? '✓ Verified' : 'Unverified'}</dd></div>
        </dl>
      </section>

      {/* Quotations */}
      <section className={`rounded-[20px] ${GLASS} overflow-hidden`}>
        <div className="px-5 py-3 bg-white/50 border-b border-line">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate">Quotations ({quotations.length})</h2>
        </div>
        {!quotations.length ? (
          <p className="px-5 py-6 text-sm text-muted">No quotations yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {quotations.map((q) => (
              <Link key={q._id} href={`/admin/quotations/${q._id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 hover:bg-white/60 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink font-jbmono">{q.quotationNumber}</p>
                  <p className="text-xs text-muted">{fmtDateTime(q.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink">{inr(q.total)}</span>
                  <StatusChip status={q.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Catalogues */}
      <section className={`rounded-[20px] ${GLASS} overflow-hidden`}>
        <div className="px-5 py-3 bg-white/50 border-b border-line">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate">Catalogues ({catalogues.length})</h2>
        </div>
        {!catalogues.length ? (
          <p className="px-5 py-6 text-sm text-muted">No catalogues yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {catalogues.map((c) => (
              <div key={c._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink font-jbmono">{c.catalogueNumber}</p>
                  <p className="text-xs text-muted">
                    {fmtDateTime(c.createdAt)}
                    {Array.isArray(c.items) ? ` · ${c.items.length} items` : ''}
                    {` · ${c.downloadCount} downloads`}
                  </p>
                </div>
                {c.pdfUrl && (
                  <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-600 hover:underline">View PDF ↗</a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
