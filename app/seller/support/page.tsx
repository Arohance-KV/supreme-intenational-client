'use client';
import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { useMyTickets, useTicket, useCreateTicket, useReplyTicket, type TicketStatus } from '@/lib/seller/support';

const WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '';

const CHIP: Record<TicketStatus, string> = {
  open: 'text-[#b5801e] bg-[rgba(224,163,59,.16)]',
  answered: 'text-[#2a2b6a] bg-[rgba(42,43,106,.12)]',
  closed: 'text-slate bg-[rgba(91,93,122,.12)]',
};

const CARD = 'rounded-[18px] border border-white/80 bg-white/[.62] p-5 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]';

function Thread({ id, onBack }: { id: string; onBack: () => void }) {
  const { data: ticket } = useTicket(id);
  const reply = useReplyTicket(id);
  const [text, setText] = useState('');

  const send = async () => {
    if (!text.trim()) return;
    await reply.mutateAsync(text.trim());
    setText('');
  };

  return (
    <div className={CARD}>
      <button onClick={onBack} className="mb-3 text-xs font-semibold text-[#176054] hover:underline">← All tickets</button>
      {!ticket ? (
        <div className="h-24 animate-pulse rounded bg-black/5" />
      ) : (
        <>
          <div className="mb-1 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink">{ticket.subject}</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${CHIP[ticket.status]}`}>{ticket.status}</span>
          </div>
          <div className="font-jbmono mb-4 text-[11px] text-muted">{ticket.ticketNumber}</div>

          <div className="mb-4 space-y-3">
            {ticket.messages.map((m, i) => (
              <div key={i} className={`rounded-xl p-3 text-[13px] ${m.author === 'admin' ? 'bg-[rgba(23,155,142,.10)]' : 'bg-black/[.04]'}`}>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                  {m.author === 'admin' ? 'Supreme team' : 'You'}
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
            className="rounded-xl bg-[linear-gradient(135deg,#176054,#179b8e)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {reply.isPending ? 'Sending…' : 'Send reply'}
          </button>
          {reply.error && (
            <span className="ml-3 text-xs text-[#d8524d]">{reply.error instanceof ApiError ? reply.error.message : 'Failed'}</span>
          )}
        </>
      )}
    </div>
  );
}

export default function SellerSupportPage() {
  const { data } = useMyTickets();
  const create = useCreateTicket();
  const [openId, setOpenId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const submit = async () => {
    if (!subject.trim() || !body.trim()) return;
    await create.mutateAsync({ subject: subject.trim(), body: body.trim() });
    setSubject('');
    setBody('');
  };

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-7">
      <div className="mb-6">
        <h1 className="mb-0.5 text-[26px] font-extrabold tracking-[-.02em] text-ink">Support Center</h1>
        <div className="text-[13px] text-slate">Tickets, guides, and direct help from the Supreme team.</div>
      </div>

      {/* Info cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={CARD}>
          <div className="mb-2 text-[20px]">▤</div>
          <p className="font-bold text-ink">Seller guide</p>
          <p className="mt-1 text-xs text-slate">Listing rules, image specs, and the margin model explained.</p>
        </div>
        <div className={CARD}>
          <div className="mb-2 text-[20px]">☏</div>
          <p className="font-bold text-ink">Talk to us</p>
          <p className="mt-1 text-xs text-slate">
            {WHATSAPP ? (
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="text-[#176054] underline">
                WhatsApp your account manager
              </a>
            ) : (
              'WhatsApp your account manager · replies within hours.'
            )}
          </p>
        </div>
        <div className={CARD}>
          <div className="mb-2 text-[20px]">◷</div>
          <p className="font-bold text-ink">Payout cycle</p>
          <p className="mt-1 text-xs text-slate">Settled offline by the Supreme team. Track amounts in Performance.</p>
        </div>
      </div>

      {openId ? (
        <Thread id={openId} onBack={() => setOpenId(null)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Raise a ticket */}
          <div className={CARD}>
            <div className="mb-3 text-sm font-bold text-ink">Raise a ticket</div>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="mb-3 w-full rounded-xl border border-line bg-white/70 px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the issue…"
              className="mb-3 h-28 w-full rounded-xl border border-line bg-white/70 p-3 text-sm focus:border-accent focus:outline-none"
            />
            <button
              onClick={submit}
              disabled={create.isPending || !subject.trim() || !body.trim()}
              className="rounded-xl bg-[linear-gradient(135deg,#176054,#179b8e)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {create.isPending ? 'Submitting…' : 'Submit ticket'}
            </button>
            {create.error && (
              <span className="ml-3 text-xs text-[#d8524d]">{create.error instanceof ApiError ? create.error.message : 'Failed'}</span>
            )}
          </div>

          {/* Your tickets */}
          <div className={CARD}>
            <div className="mb-3 text-sm font-bold text-ink">Your tickets</div>
            <div className="divide-y divide-line">
              {(data?.items ?? []).map((t) => (
                <button
                  key={t._id}
                  onClick={() => setOpenId(t._id)}
                  className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:opacity-75"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">{t.subject}</span>
                    <span className="font-jbmono text-[10px] text-muted">{t.ticketNumber}</span>
                  </span>
                  <span className={`flex-none rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${CHIP[t.status]}`}>{t.status}</span>
                </button>
              ))}
              {data && data.items.length === 0 && <p className="py-2 text-xs text-muted">No tickets yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
