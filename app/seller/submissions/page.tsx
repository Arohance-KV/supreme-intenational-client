'use client';
import Link from 'next/link';
import { useMySubmissions, useImportSubmissions } from '@/lib/seller/submissions';
import { CSV_TEMPLATE } from '@/lib/admin/products';
import { SubmissionStatusChip } from '@/components/seller/SubmissionStatusChip';
import CsvImportButton from '@/components/CsvImportButton';
import DcPhoto from '@/components/DcPhoto';

function Kpi({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="rounded-[18px] border border-white/80 bg-white/[.62] p-5 shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]">
      <div className="font-jbmono mb-3 text-[10px] uppercase tracking-[.08em] text-muted">{label}</div>
      <div className="text-[30px] font-extrabold tracking-[-.02em] text-ink">{value}</div>
      <div className="mt-1.5 text-[11px] text-muted">{sub}</div>
    </div>
  );
}

export default function SubmissionsPage() {
  const { data, isLoading } = useMySubmissions();
  const importSubmissions = useImportSubmissions();
  const items = data?.items ?? [];

  const count = (s: string) => items.filter((i) => i.status === s).length;

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-7">
      <div className="mb-6 flex items-center justify-between gap-5">
        <div>
          <h1 className="mb-0.5 text-[26px] font-extrabold tracking-[-.02em] text-ink">Approval Status</h1>
          <div className="text-[13px] text-slate">Every product is reviewed by Supreme before going live.</div>
        </div>
        <div className="flex items-center gap-3">
          <CsvImportButton
            importFn={(f) => importSubmissions.mutateAsync(f)}
            templateCsv={CSV_TEMPLATE}
            templateName="products-template.csv"
          />
          <Link
            href="/seller/submissions/new"
            className="flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#176054,#179b8e)] px-[18px] py-3 text-sm font-bold text-white no-underline shadow-[0_10px_24px_rgba(23,155,142,.3)]"
          >
            ＋ Add Product
          </Link>
        </div>
      </div>

      {/* KPIs from real submission counts */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="In review" value={count('submitted')} sub="awaiting Supreme approval" />
        <Kpi label="Approved" value={count('approved')} sub="now live" />
        <Kpi label="Rejected" value={count('rejected')} sub="action needed from you" />
      </div>

      {/* How approval works */}
      <div className="mb-4 rounded-[20px] border border-white/80 bg-white/[.62] p-[22px] shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]">
        <div className="mb-4 text-[15px] font-extrabold text-ink">How approval works</div>
        <div className="flex items-center">
          {[
            { n: '1', t: 'Submit', done: true },
            { n: '2', t: 'Supreme reviews', done: false, active: true },
            { n: '3', t: 'Live', done: false },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold ${
                    s.done
                      ? 'bg-accent text-white'
                      : s.active
                        ? 'bg-[#e0a33b] text-white'
                        : 'border-2 border-line bg-white text-muted'
                  }`}
                >
                  {s.n}
                </span>
                <span className={`text-[11px] font-semibold ${s.active ? 'text-[#b5801e]' : s.done ? 'text-slate' : 'text-muted'}`}>{s.t}</span>
              </div>
              {i < arr.length - 1 && <div className="mb-[18px] h-0.5 flex-1 bg-line" />}
            </div>
          ))}
        </div>
      </div>

      {/* Queue */}
      <div className="rounded-[20px] border border-white/80 bg-white/[.62] p-[22px] shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[16px]">
        <div className="mb-3.5 text-[15px] font-extrabold text-ink">Products in the queue</div>

        {isLoading && <div className="h-32 animate-pulse rounded-[14px] bg-white/50" />}

        {!isLoading && items.length === 0 && (
          <div className="py-8 text-center">
            <p className="mb-3 text-sm text-slate">No submissions yet.</p>
            <Link href="/seller/submissions/new" className="text-sm font-semibold text-accent hover:underline">
              Create your first submission
            </Link>
          </div>
        )}

        {!isLoading &&
          items.map((item) => (
            <Link
              key={item._id}
              href={`/seller/submissions/${item._id}`}
              className="flex items-center gap-3 border-b border-line py-3 no-underline last:border-0"
            >
              <DcPhoto seed={item._id} className="h-[42px] w-[42px] flex-none rounded-[11px]" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-ink">{item.name}</div>
                <div className="font-jbmono text-[11px] text-muted">{new Date(item.createdAt).toLocaleDateString()}</div>
              </div>
              {item.status === 'rejected' && (
                <span className="rounded-[9px] bg-[rgba(42,43,106,.07)] px-3 py-1.5 text-[11px] font-semibold text-indigo">View notes</span>
              )}
              <SubmissionStatusChip status={item.status} />
            </Link>
          ))}
      </div>
    </div>
  );
}
