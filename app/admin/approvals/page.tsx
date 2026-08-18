'use client';

import { useApprovals, useDecideApproval, type ApprovalItem, type ApprovalType } from '@/lib/admin/approvals';
import { fmtDateTime } from '@/lib/admin/format';

const GLASS = 'border border-white/80 bg-white/90 shadow-[0_10px_30px_rgba(34,36,90,.07)]';

const TYPE_LABEL: Record<ApprovalType, string> = {
  blog: 'Blog',
  caseStudy: 'Case Study',
  clientLogo: 'Client Logo',
  popup: 'Popup',
  companyBranding: 'Company Branding',
  quotation: 'Quotation',
};

function groupByType(items: ApprovalItem[]): [ApprovalType, ApprovalItem[]][] {
  const groups = new Map<ApprovalType, ApprovalItem[]>();
  for (const item of items) {
    const list = groups.get(item.type) ?? [];
    list.push(item);
    groups.set(item.type, list);
  }
  return Array.from(groups.entries());
}

function ApprovalRow({ item }: { item: ApprovalItem }) {
  const decide = useDecideApproval();
  const pending = decide.isPending && decide.variables?.id === item.id && decide.variables?.type === item.type;

  return (
    <div className="grid grid-cols-[1.6fr_1fr_auto] gap-3 items-center px-5 py-3 text-[13px]">
      <span className="min-w-0">
        <span className="block truncate font-bold text-ink">{item.title}</span>
        <span className="block truncate text-[11px] text-muted">
          {item.submittedBy ? `Submitted by ${item.submittedBy}` : 'Submitted by —'}
          {' · '}
          {fmtDateTime(item.submittedAt)}
        </span>
      </span>
      <a
        href={item.previewLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-semibold text-indigo hover:underline"
      >
        Preview ↗
      </a>
      <span className="flex items-center gap-2 justify-end">
        <button
          disabled={pending}
          onClick={() => decide.mutate({ type: item.type, id: item.id, decision: 'accept' })}
          className="rounded-full bg-indigo px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Accept
        </button>
        <button
          disabled={pending}
          onClick={() => decide.mutate({ type: item.type, id: item.id, decision: 'reject' })}
          className="rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-slate transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Reject
        </button>
      </span>
    </div>
  );
}

export default function AdminApprovalsPage() {
  const { data, isPending, isError } = useApprovals();
  const items = data ?? [];
  const groups = groupByType(items);

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Approvals</h1>
        <p className="mt-1 text-sm text-slate">Content edits and quotations submitted by the backend team, awaiting your review before going live.</p>
      </div>

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load approvals.</div>
      ) : isPending ? (
        <div className={`rounded-[20px] overflow-hidden ${GLASS}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-line last:border-0">
              <div className="h-5 w-full animate-pulse rounded bg-black/5" />
            </div>
          ))}
        </div>
      ) : !items.length ? (
        <div className={`rounded-[20px] ${GLASS}`}>
          <p className="px-5 py-10 text-center text-sm text-muted">Nothing awaiting approval.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(([type, groupItems]) => (
            <div key={type} className={`rounded-[20px] divide-y divide-line overflow-hidden ${GLASS}`}>
              <div className="px-5 py-3 bg-white/50 font-jbmono text-[10px] uppercase tracking-[.05em] text-muted">
                {TYPE_LABEL[type]} · {groupItems.length}
              </div>
              {groupItems.map((item) => (
                <ApprovalRow key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
