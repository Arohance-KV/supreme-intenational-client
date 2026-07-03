import Link from 'next/link';
import DcWordmark from './DcWordmark';

// Standard public-page glass nav (Clients/About/Careers/Contact/Catalogue).
// The home page has its own richer variant (search + live cart) inline.
const items = [
  { label: 'Products', href: '/products', key: 'products' },
  { label: 'Clients', href: '/clients', key: 'clients' },
  { label: 'About', href: '/about', key: 'about' },
  { label: 'Careers', href: '/careers', key: 'careers' },
  { label: 'Contact', href: '/contact', key: 'contact' },
];

export default function DcNav({ active }: { active?: string }) {
  return (
    <div className="sticky top-0 z-40 my-4 flex flex-wrap items-center gap-x-5 gap-y-2.5 rounded-[18px] border border-white/80 bg-white/[.62] px-[18px] py-3 shadow-[0_8px_30px_rgba(34,36,90,.1)] backdrop-blur-[20px] backdrop-saturate-[1.6]">
      <Link href="/" className="no-underline"><DcWordmark /></Link>
      <div className="ml-2 hidden gap-1 md:flex">
        {items.map((it) => (
          <Link
            key={it.key}
            href={it.href}
            className={`rounded-[10px] px-3 py-2 text-sm no-underline ${active === it.key ? 'bg-[rgba(42,43,106,.07)] font-semibold text-ink' : 'font-medium text-slate'}`}
          >
            {it.label}
          </Link>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2.5">
        <Link href="/login" className="rounded-xl border border-line bg-transparent px-4 py-[11px] text-[13px] font-semibold text-indigo no-underline">My Account</Link>
        <Link href="/quotation" className="rounded-xl bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-[18px] py-[11px] text-[13px] font-semibold text-white no-underline shadow-[0_8px_22px_rgba(42,43,106,.3)]">Request Quotation</Link>
      </div>
    </div>
  );
}
