'use client';
import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { useAdminTickets, useAdminTicket, useAdminReply, useAdminClose, type TicketStatus } from '@/lib/admin/support';
import { StatusChip } from '@/components/admin/StatusChip';

const CARD = 'rounded-[20px] border border-white/80 bg-white/[.62] backdrop-blur-2xl shadow-[0_10px_30px_rgba(34,36,90,.07)]';
const FILTERS: (TicketStatus | 'all')[] = ['all', 'open', 'answered', 'closed'];

function Thread({ id, onBack }: { id: string; onBack: () => void }) {
  const { data: t } = useAdminTicket(id);
  const reply = useAdminReply(id);
  const close = useAdminClose(id);
  const [text, setText] = useState('');

  const send = async () => {
    if (!text.trim()) return;
    await reply.mutateAsync(text.trim());
    setText('');
  };

  return (
    <div className={`${CARD} p-5`}>
      <button onClick={onBack} className="mb-3 text-xs font-semibold text-indigo hover:underline">← Inbox</button>
      {!t ? (
        <div className="h-24 animate-pulse rounded bg-black/5" />
      ) : (
        <>
          <div className="mb-1 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink">{t.subject}</h2>
            <div className="flex items-center gap-2">
              <StatusChip status={t.status} />
              {t.status !== 'closed' && (
                <button
                  onClick={() => close.mutate()}
                  disabled={close.isPending}
                  className="rounded border border-line px-3 py-1 text-xs text-slate hover:bg-white/60 disabled:opacity-60"
                >
                  {close.isPending ? '…' : 'Close'}
                </button>
              )}
            </div>
          </div>
          <p className="font-jbmono mb-4 text-[11px] text-muted">{t.ticketNumber}</p>

          <div className="mb-4 space-y-3">
            {t.messages.map((m, i) => (
              <div key={i} className={`rounded-xl p-3 text-[13px] ${m.author === 'admin' ? 'bg-[rgba(42,43,106,.08)]' : 'bg-black/[.04]'}`}>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                  {m.author === 'admin' ? 'Supreme team' : 'Seller'}
                </div>
                <p className="whitespace-pre-wrap text-ink">{m.body}</p>
              </div>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a reply…"
            className="mb-2 h-24 w-full rounded-xl border border-line bg-white/70 p-3 text-sm focus:border-accent focus:outline-none"
          />
          <button
            onClick={send}
            disabled={reply.isPending || !text.trim()}
            className="rounded bg-gradient-to-br from-indigo to-indigo2 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {reply.isPending ? 'Sending…' : 'Send reply'}
          </button>
          {reply.error && (
            <span className="ml-3 text-xs text-red-600">{reply.error instanceof ApiError ? reply.error.message : 'Failed'}</span>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminSupportPage() {
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading } = useAdminTickets(filter === 'all' ? undefined : filter);

  if (openId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Support</h1>
        <Thread id={openId} onBack={() => setOpenId(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Support</h1>
        <p className="mt-1 text-sm text-slate">Seller tickets and replies</p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              filter === f ? 'bg-indigo text-white' : 'border border-line text-slate hover:bg-white/60'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={`${CARD} h-40 animate-pulse`} />
      ) : (
        <div className={`${CARD} divide-y divide-line overflow-hidden`}>
          {(data?.items ?? []).map((t) => (
            <button
              key={t._id}
              onClick={() => setOpenId(t._id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left hover:bg-white/50"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{t.subject}</span>
                <span className="font-jbmono text-xs text-muted">{t.ticketNumber}</span>
              </span>
              <StatusChip status={t.status} />
            </button>
          ))}
          {data && data.items.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate">No tickets.</p>}
        </div>
      )}
    </div>
  );
}
