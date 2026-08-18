import Link from 'next/link';
import { eyebrow, glass } from '@/components/employee/ui';

// Lucide-style stroke icons (24px, 1.75 stroke) — SVG, not emoji, so they stay crisp
// and theme-consistent.
type IconProps = { className?: string };
const Icon = ({ path, className }: { path: string; className?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d={path} />
  </svg>
);
const IconTarget = (p: IconProps) => <Icon {...p} path="M12 2v3M12 19v3M2 12h3M19 12h3M12 8a4 4 0 100 8 4 4 0 000-8z" />;
const IconGift = (p: IconProps) => <Icon {...p} path="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />;
const IconShield = (p: IconProps) => <Icon {...p} path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" />;
const IconSupport = (p: IconProps) => <Icon {...p} path="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />;

const WHY = [
  { Icon: IconTarget, title: 'Curated selection', sub: 'Products chosen for quality and everyday value.' },
  { Icon: IconGift, title: 'Employee benefits', sub: 'Exclusive pricing arranged through your company.' },
  { Icon: IconShield, title: 'Secure checkout', sub: 'Your data and payments stay protected end to end.' },
  { Icon: IconSupport, title: 'Dedicated support', sub: 'A real team, ready to help whenever you need it.' },
];

const STATS = [
  { value: '100+', label: 'Companies partnered' },
  { value: 'ISO 9001', label: 'Certified quality' },
  { value: 'Pan-India', label: 'Delivery network' },
  { value: 'End-to-end', label: 'Secure payments' },
];

const RESOURCES = [
  { href: '/careers', label: 'Careers' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Support' },
];

export default function SupremeSection() {
  return (
    <>
      {/* Branded hero band — anchors the top of the portal above the company's dynamic design. */}
      <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(120deg,#16173a_0%,#2a2b6a_58%,#1d3f57_120%)] p-8 shadow-[0_24px_64px_rgba(22,23,58,.28)] sm:p-12 lg:p-14">
        {/* animated accent glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 animate-pulse rounded-full bg-[rgba(19,184,159,.24)] blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 animate-pulse rounded-full bg-[rgba(58,60,152,.35)] blur-3xl [animation-delay:1.2s]" aria-hidden />
        {/* faint grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:44px_44px]"
          aria-hidden
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.07] px-3.5 py-1.5 font-jbmono text-[11px] uppercase tracking-[.2em] text-accent2 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent2 shadow-[0_0_12px_rgba(19,184,159,.9)]" aria-hidden />
            Supreme International
          </span>

          <h2 className="mt-5 max-w-3xl text-[28px] font-extrabold leading-[1.08] tracking-[-.02em] text-white sm:text-[40px] lg:text-[46px]">
            Merchandise your team is{' '}
            <span className="bg-[linear-gradient(90deg,#13b89f,#7db8ff)] bg-clip-text text-transparent">proud to carry.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-lg">
            We partner with organizations across India to deliver curated merchandise that blends quality,
            reliability, and service, at every step, for every team.
          </p>

          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
            {RESOURCES.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:text-accent2"
              >
                {r.label}
                <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>→</span>
              </Link>
            ))}
          </div>

          {/* stats strip */}
          <div className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-white/10 bg-white/10 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-[#16173a]/60 px-5 py-5 backdrop-blur-sm">
                <p className="text-xl font-extrabold tracking-[-.02em] text-white sm:text-2xl">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why shop with us */}
      <section>
        <div className="mb-6">
          <p className={`${eyebrow} mb-1.5`}>Why shop with us</p>
          <h2 className="text-2xl font-extrabold tracking-[-.02em] text-ink sm:text-[28px]">The Supreme International promise</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map(({ Icon: I, title, sub }, i) => (
            <div
              key={title}
              className={`group relative overflow-hidden rounded-[20px] p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_52px_rgba(22,23,58,.16)] ${glass}`}
            >
              {/* accent wash appears on hover */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#149b8e,#3a3c98)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
              <span className="absolute right-5 top-5 font-jbmono text-sm font-semibold text-line/90">0{i + 1}</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[rgba(20,155,142,.12)] text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
                <I />
              </span>
              <p className="mt-4 font-semibold text-ink">{title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate">{sub}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
