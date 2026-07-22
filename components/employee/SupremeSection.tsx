import Link from 'next/link';
import { eyebrow, glass } from '@/components/employee/ui';

const WHY = [
  { icon: '🎯', title: 'Curated Selection', sub: 'Products chosen for quality and value.' },
  { icon: '🎁', title: 'Employee Benefits', sub: 'Exclusive pricing through your company.' },
  { icon: '🔒', title: 'Secure Checkout', sub: 'Your data and payments stay protected.' },
  { icon: '🤝', title: 'Dedicated Support', sub: 'A team ready to help when you need it.' },
];

const BADGES = ['ISO 9001 Certified', 'Trusted by 100+ Companies', 'Secure Payments', 'Pan-India Delivery'];

export default function SupremeSection() {
  return (
    <>
      {/* Why shop with us */}
      <section>
        <p className={`${eyebrow} mb-1`}>WHY SHOP WITH US</p>
        <h2 className="mb-4 text-xl font-extrabold tracking-[-.02em] text-ink">The Supreme International promise</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w) => (
            <div key={w.title} className={`rounded-[18px] p-5 ${glass}`}>
              <span className="text-2xl">{w.icon}</span>
              <p className="mt-2 font-semibold text-ink">{w.title}</p>
              <p className="mt-1 text-sm text-slate">{w.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust + mission + resources */}
      <section className={`rounded-[24px] p-6 sm:p-8 ${glass}`}>
        <p className="mx-auto max-w-3xl text-center text-[15px] leading-relaxed text-slate">
          <span className="font-semibold text-ink">Supreme International</span> partners with organizations
          across India to deliver curated merchandise their teams are proud to use — combining quality,
          reliability, and service at every step.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {BADGES.map((b) => (
            <span key={b} className="rounded-full bg-[rgba(23,155,142,.12)] px-3 py-1.5 text-xs font-semibold text-accent">
              {b}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/careers" className="font-semibold text-indigo no-underline hover:underline">Careers</Link>
          <Link href="/blog" className="font-semibold text-indigo no-underline hover:underline">Blog</Link>
          <Link href="/contact" className="font-semibold text-indigo no-underline hover:underline">Support</Link>
        </div>
      </section>
    </>
  );
}
