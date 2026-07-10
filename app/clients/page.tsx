import DcFooter from '@/components/DcFooter';
import ClientCaseStudies from './ClientCaseStudies';
import { getClientLogos, getCaseStudies } from '@/lib/content';

export default async function ClientsPage() {
  const [logos, cases] = await Promise.all([getClientLogos(), getCaseStudies()]);

  return (
    <main className="font-display relative min-h-screen w-full overflow-x-hidden bg-[#eef0f8] text-ink selection:bg-[rgba(23,155,142,0.22)]">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(20,155,142,.16),transparent_60%),radial-gradient(50%_45%_at_0%_6%,rgba(58,60,152,.16),transparent_60%),linear-gradient(180deg,#eef0f8_0%,#f2f1f7_50%,#eef0f8_100%)]" />
      <div className="pointer-events-none fixed -right-[120px] -top-[160px] z-0 h-[500px] w-[500px] animate-blob1 rounded-full bg-[radial-gradient(circle,rgba(20,155,142,.16),transparent_70%)] blur-[20px]" />

      <div className="relative z-[1] mx-auto max-w-[1180px] px-6">

        {/* HEADER */}
        <section className="pb-[26px] pt-12">
          <div className="font-jbmono mb-4 text-[11px] uppercase tracking-[.22em] text-accent">Clients &amp; Case Studies</div>
          <h1 className="mb-3.5 max-w-[18ch] text-[36px] font-extrabold leading-[1.07] tracking-[-.03em] sm:text-[48px] sm:leading-[1.04]">Trusted across industries.</h1>
          <p className="m-0 max-w-[60ch] text-[17px] text-slate">From IT and manufacturing to banking and retail, 500+ teams run their corporate gifting on Supreme.</p>
        </section>

        {/* logo wall */}
        {logos.length > 0 && (
          <div className="mb-9 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {logos.map((l) => (
              <div key={l._id} className="flex h-20 items-center justify-center rounded-[14px] border border-line bg-white/60 px-3">
                {l.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.logoUrl} alt={l.name} className="max-h-12 max-w-full object-contain" />
                ) : (
                  <span className="text-center text-[15px] font-extrabold text-indigo">{l.name}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* case studies (Success stories) */}
        <ClientCaseStudies items={cases} />

        {/* testimonial */}
        <section className="pb-10 pt-6">
          <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#1c1d44,#23254f)] p-10 shadow-[0_24px_60px_rgba(42,43,106,.25)]">
            <div className="absolute -right-10 -top-[60px] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(20,155,142,.5),transparent_70%)] blur-[10px]" />
            <div className="relative max-w-[60ch]">
              <div className="mb-[18px] text-[46px] leading-[0.5] text-[#9fe7dc]">&ldquo;</div>
              <div className="mb-6 text-[22px] font-medium leading-[1.5] tracking-[-.01em] text-white">Supreme has been our gifting partner for nearly a decade. The new platform lets our teams self-serve catalogues and quotations, what used to take days now takes an afternoon.</div>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-[linear-gradient(135deg,#179b8e,#13b89f)]" />
                <div>
                  <div className="text-sm font-bold text-white">Head of Admin &amp; Procurement</div>
                  <div className="text-xs text-white/60">Leading IT services firm, Bangalore</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <DcFooter />
    </main>
  );
}
