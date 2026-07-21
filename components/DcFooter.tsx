import Link from 'next/link';
import DcWordmark from './DcWordmark';

// Shared site footer (the design system imports this as "Site Footer" on every page).
export default function DcFooter() {
  return (
    <div className="relative z-[1] bg-[linear-gradient(135deg,#1c1d44,#23254f)] px-5 pb-[30px] pt-10 sm:px-10 sm:pt-11">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-[34px] grid grid-cols-2 gap-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4"><DcWordmark dark /></div>
            <div className="max-w-[32ch] text-[13px] leading-[1.6] text-white/55">Corporate gifting &amp; promotional merchandise, engineered for enterprise procurement teams.</div>
            {/* Seller login lives here rather than the nav — partner flow, not a buyer one. */}
            <Link href="/seller/login" className="mt-4 inline-block text-[13px] font-semibold text-[#9fe7dc] no-underline hover:text-white">
              Seller Login →
            </Link>
          </div>
          {([
            ['Company', ['About Us', 'Clients', 'Careers', 'Contact']],
            ['Products', ['Catalogue', 'Quotation builder', 'Catalogue generator', 'Merchandise portal']],
            ['Connect', ['WhatsApp', 'hello@supreme.example', '+91 ·· ···· ····']],
          ] as const).map(([title, links]) => (
            <div key={title}>
              <div className="font-jbmono mb-3.5 text-[11px] uppercase tracking-[.1em] text-[#9fe7dc]">{title}</div>
              <div className="flex flex-col gap-2.5 text-[13px] text-white/70">
                {links.map((i) => <span key={i}>{i}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-white/[.12] pt-[18px] text-xs text-white/45">
          <span>© Supreme International</span>
          <span className="font-jbmono">Privacy · Terms</span>
        </div>
      </div>
    </div>
  );
}
