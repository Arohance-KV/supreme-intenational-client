import Link from 'next/link';
import DcFooter from '@/components/DcFooter';
import DcPhoto from '@/components/DcPhoto';
import { getBlogs } from '@/lib/content';

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

export const metadata = { title: 'Blog — Supreme International' };

export default async function BlogListPage() {
  const { blogs } = await getBlogs();

  return (
    <main className="font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink selection:bg-[rgba(23,155,142,0.22)]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(20,155,142,.16),transparent_60%),radial-gradient(50%_45%_at_0%_6%,rgba(58,60,152,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />

      <div className="relative z-[1] mx-auto max-w-[1180px] px-6">
        <section className="pb-8 pt-12">
          <div className="font-jbmono mb-4 text-[11px] uppercase tracking-[.22em] text-accent">Blog</div>
          <h1 className="mb-3.5 max-w-[18ch] text-[36px] font-extrabold leading-[1.07] tracking-[-.03em] sm:text-[48px] sm:leading-[1.04]">Ideas &amp; updates.</h1>
          <p className="m-0 max-w-[60ch] text-[17px] text-slate">Notes on corporate gifting, product launches, and how teams run merchandise at scale.</p>
        </section>

        {blogs.length === 0 ? (
          <div className="mb-16 rounded-[18px] border border-dashed border-line bg-white/55 p-12 text-center text-sm text-muted">No posts published yet.</div>
        ) : (
          <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((b) => (
              <Link key={b._id} href={`/blog/${b.slug}`} className="group overflow-hidden rounded-[18px] border border-white/80 bg-white/55 no-underline shadow-[0_10px_30px_rgba(34,36,90,.07)] backdrop-blur-[14px] transition hover:shadow-[0_16px_40px_rgba(34,36,90,.12)]">
                {b.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.coverImage} alt={b.title} className="aspect-video w-full object-cover" />
                ) : (
                  <DcPhoto seed={b._id} className="aspect-video" />
                )}
                <div className="p-[18px]">
                  {b.publishedAt && <div className="font-jbmono mb-[7px] text-[10px] uppercase tracking-[.06em] text-accent">{fmt(b.publishedAt)}</div>}
                  <div className="mb-1.5 text-[16px] font-bold leading-[1.3] text-ink group-hover:text-indigo">{b.title}</div>
                  {b.excerpt && <div className="line-clamp-3 text-[13px] leading-[1.5] text-slate">{b.excerpt}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <DcFooter />
    </main>
  );
}
