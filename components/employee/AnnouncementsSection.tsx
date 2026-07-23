import { eyebrow, glass } from '@/components/employee/ui';
import type { PortalAnnouncement } from '@/lib/admin/companies';

export default function AnnouncementsSection({ items }: { items?: PortalAnnouncement[] }) {
  if (!items?.length) return null;
  return (
    <section>
      <div className="mb-5">
        <p className={`${eyebrow} mb-1.5`}>What&apos;s new</p>
        <h2 className="text-2xl font-extrabold tracking-[-.02em] text-ink sm:text-[28px]">Announcements</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a, i) => (
          <div
            key={a._id ?? i}
            className={`flex flex-col rounded-[20px] p-6 transition-shadow duration-200 hover:shadow-[0_18px_48px_rgba(22,23,58,.14)] ${glass}`}
          >
            <div className="mb-3 flex items-center gap-3">
              {a.icon && (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[rgba(20,155,142,.12)] text-xl">
                  {a.icon}
                </span>
              )}
              <p className="font-semibold leading-tight text-ink">{a.title}</p>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate">{a.message}</p>
            {a.datePosted && (
              <p className="mt-4 font-jbmono text-[11px] uppercase tracking-[.08em] text-muted">
                {new Date(a.datePosted).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
