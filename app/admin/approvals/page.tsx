'use client';

import { useState } from 'react';
import {
  useApprovals,
  useApprovalDetail,
  useDecideApproval,
  type ApprovalChangeField,
  type ApprovalItem,
  type ApprovalType,
} from '@/lib/admin/approvals';
import { fmtDateTime } from '@/lib/admin/format';

const GLASS = 'border border-white/80 bg-white/90 shadow-[0_10px_30px_rgba(34,36,90,.07)]';

const TYPE_LABEL: Record<ApprovalType, string> = {
  blog: 'Blog',
  caseStudy: 'Case Study',
  clientLogo: 'Client Logo',
  popup: 'Popup',
  companyBranding: 'Company Branding',
  quotation: 'Quotation',
  product: 'Product Change',
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

function ChangeFieldRow({ field }: { field: ApprovalChangeField }) {
  const hasBefore = field.before !== undefined;
  const hasAfter = field.after !== undefined;

  return (
    <div className="grid grid-cols-[1fr_1.6fr] gap-3 px-4 py-2 text-xs">
      <span className="min-w-0 truncate font-semibold text-slate">{field.label}</span>
      <span className="min-w-0 break-words">
        {hasBefore && hasAfter ? (
          field.changed ? (
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="text-red-600 line-through">{field.before || '(empty)'}</span>
              <span className="text-muted">→</span>
              <span className="font-semibold text-emerald-700">{field.after || '(empty)'}</span>
            </span>
          ) : (
            <span className="text-ink">{field.after || '(empty)'}</span>
          )
        ) : hasAfter ? (
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-emerald-700">{field.after || '(empty)'}</span>
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
              Proposed
            </span>
          </span>
        ) : hasBefore ? (
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-red-600 line-through">{field.before || '(empty)'}</span>
            <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-700">
              Removing
            </span>
          </span>
        ) : (
          <span className="text-muted">No value</span>
        )}
      </span>
    </div>
  );
}

// Short verb for the product change action (e.g. 'variant.update' -> 'Update'); null for
// non-product types, which have no `action` and get no chip.
function actionChipLabel(action?: string): string | null {
  if (!action) return null;
  if (action === 'variant.bulkCreate') return 'Bulk add';
  if (action === 'variant.adjustStock') return 'Stock';
  if (action === 'variant.flashSale') return 'Flash sale';
  if (action === 'import.commit') return 'Import';
  if (action.endsWith('.create')) return 'Create';
  if (action.endsWith('.update')) return 'Update';
  if (action.endsWith('.delete')) return 'Delete';
  return null;
}

function ApprovalChangePanel({ type, id }: { type: ApprovalType; id: string }) {
  const { data, isPending, isError } = useApprovalDetail(type, id, true);
  const chip = actionChipLabel(data?.action);

  return (
    <div className="mt-3 rounded-2xl border border-line bg-white/60 overflow-hidden">
      {isPending ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-black/5" />
          ))}
        </div>
      ) : isError ? (
        <p className="px-4 py-4 text-xs text-red-600">Couldn&apos;t load changes.</p>
      ) : !data || !data.fields.length ? (
        <p className="px-4 py-4 text-xs text-muted">No field-level changes to show.</p>
      ) : (
        <div className="divide-y divide-line">
          {chip ? (
            <div className="px-4 py-2">
              <span className="inline-flex rounded-full bg-indigo/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo">{chip}</span>
            </div>
          ) : null}
          {data.note ? <p className="px-4 py-2.5 text-xs italic text-muted">{data.note}</p> : null}
          {data.fields.map((field, i) => (
            <ChangeFieldRow key={`${field.label}-${i}`} field={field} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalRow({ item }: { item: ApprovalItem }) {
  const decide = useDecideApproval();
  const [expanded, setExpanded] = useState(false);
  const pending = decide.isPending && decide.variables?.id === item.id && decide.variables?.type === item.type;

  const handleReject = () => {
    if (item.type === 'product') {
      const reason = window.prompt('Reason for rejecting this change?');
      if (reason === null) return;
      if (!reason.trim()) {
        window.alert('A reason is required.');
        return;
      }
      decide.mutate({ type: item.type, id: item.id, decision: 'reject', reason });
      return;
    }
    decide.mutate({ type: item.type, id: item.id, decision: 'reject' });
  };

  return (
    <div className="px-5 py-3 text-[13px]">
      <div className="grid grid-cols-[1.6fr_1fr_auto] gap-3 items-center">
        <span className="min-w-0">
          <span className="block truncate font-bold text-ink">{item.title}</span>
          <span className="block truncate text-[11px] text-muted">
            {item.submittedBy ? `Submitted by ${item.submittedBy}` : 'Submitted by (unknown)'}
            {' · '}
            {fmtDateTime(item.submittedAt)}
          </span>
        </span>
        <span className="flex items-center gap-3">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-semibold text-indigo hover:underline"
          >
            View changes {expanded ? '▴' : '▾'}
          </button>
          <a
            href={item.previewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-indigo hover:underline"
          >
            Preview ↗
          </a>
        </span>
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
            onClick={handleReject}
            className="rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-slate transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reject
          </button>
        </span>
      </div>
      {expanded ? <ApprovalChangePanel type={item.type} id={item.id} /> : null}
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
