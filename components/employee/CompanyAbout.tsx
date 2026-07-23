import { eyebrow, glass } from '@/components/employee/ui';
import type { PortalAbout } from '@/lib/admin/companies';

// "About the company" — a profile of the employer company: intro copy, an optional
// image, and a stats strip (founded / employees / presence …). Hidden when empty.
export default function CompanyAbout({ about, companyName }: { about?: PortalAbout | null; companyName?: string }) {
  const hasContent = !!(about && (about.heading || about.body || about.image || about.stats?.length));
  if (!hasContent) return null;

  const heading = about!.heading || `About ${companyName || 'the company'}`;
  const stats = about!.stats ?? [];
  const hasImage = !!about!.image;
  // Static class (Tailwind can't purge-scan interpolated names).
  const statCols = stats.length >= 4 ? 'md:grid-cols-4' : stats.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

  return (
    <section>
      <div className={`overflow-hidden rounded-[28px] ${glass}`}>
        <div className={hasImage ? 'grid lg:grid-cols-2' : ''}>
          {/* Copy */}
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <p className={`${eyebrow} mb-2`}>About {companyName || 'the company'}</p>
            <h2 className="text-2xl font-extrabold tracking-[-.02em] text-ink sm:text-[32px]">{heading}</h2>
            {about!.body && (
              <p className="mt-4 max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-slate sm:text-[17px]">{about!.body}</p>
            )}
            {about!.website && (
              <a
                href={about!.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-accent no-underline transition-colors hover:text-indigo"
              >
                Visit website
                <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>→</span>
              </a>
            )}
          </div>

          {/* Image (optional) */}
          {hasImage && (
            <div className="relative min-h-[240px] lg:min-h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={about!.image} alt={heading} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          )}
        </div>

        {/* Stats strip */}
        {stats.length > 0 && (
          <div className={`grid grid-cols-2 gap-y-6 border-t border-line/70 px-6 py-8 sm:px-10 ${statCols}`}>
            {stats.map((s, i) => (
              <div key={s._id ?? i} className="text-center">
                <p className="text-2xl font-extrabold tracking-[-.02em] text-ink sm:text-[32px]">{s.value}</p>
                <p className="mt-1.5 font-jbmono text-[10px] uppercase tracking-[.12em] text-muted sm:text-[11px]">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
