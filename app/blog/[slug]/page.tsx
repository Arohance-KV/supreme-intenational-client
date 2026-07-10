import Link from 'next/link';
import { notFound } from 'next/navigation';
import DcFooter from '@/components/DcFooter';
import { getBlogBySlug } from '@/lib/content';

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  return (
    <main className="font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink selection:bg-[rgba(23,155,142,0.22)]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(20,155,142,.16),transparent_60%),radial-gradient(50%_45%_at_0%_6%,rgba(58,60,152,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />

      <article className="relative z-[1] mx-auto max-w-[760px] px-6">
        <div className="pt-10">
          <Link href="/blog" className="font-jbmono text-[11px] uppercase tracking-[.14em] text-accent no-underline hover:underline">← Blog</Link>
        </div>

        <header className="pb-6 pt-6">
          {blog.publishedAt && <div className="font-jbmono mb-3 text-[11px] uppercase tracking-[.14em] text-muted">{fmt(blog.publishedAt)}</div>}
          <h1 className="mb-4 text-[34px] font-extrabold leading-[1.1] tracking-[-.03em] sm:text-[44px] sm:leading-[1.06]">{blog.title}</h1>
          {blog.excerpt && <p className="m-0 text-[18px] leading-[1.6] text-slate">{blog.excerpt}</p>}
          {blog.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {blog.tags.map((t) => (
                <span key={t} className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-medium text-slate">{t}</span>
              ))}
            </div>
          )}
        </header>

        {blog.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={blog.coverImage} alt={blog.title} className="mb-8 aspect-video w-full rounded-[18px] border border-white/80 object-cover" />
        )}

        {/* content is admin-authored HTML/plain text (server decodes entities on save) */}
        <div
          className="prose-blog pb-16 text-[16px] leading-[1.75] text-body [&_a]:text-indigo [&_h2]:mt-8 [&_h2]:text-[24px] [&_h2]:font-extrabold [&_h3]:mt-6 [&_h3]:text-[20px] [&_h3]:font-bold [&_img]:my-6 [&_img]:rounded-[14px] [&_li]:mb-1.5 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: blog.content || '' }}
        />
      </article>

      <DcFooter />
    </main>
  );
}
