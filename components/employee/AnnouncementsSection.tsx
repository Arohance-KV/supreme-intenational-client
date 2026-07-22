import { eyebrow, glass } from '@/components/employee/ui';
import type { PortalAnnouncement } from '@/lib/admin/companies';

export default function AnnouncementsSection({ items }: { items?: PortalAnnouncement[] }) {
  if (!items?.length) return null;
  return (
    <section>
      <p className={`${eyebrow} mb-1`}>WHAT&apos;S NEW</p>
      <h2 className="mb-4 text-xl font-extrabold tracking-[-.02em] text-ink">Announcements</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a, i) => (
          <div key={a._id ?? i} className={`rounded-[18px] p-4 ${glass}`}>
            <div className="mb-1.5 flex items-center gap-2">
              {a.icon && <span className="text-lg">{a.icon}</span>}
              <p className="font-semibold text-ink">{a.title}</p>
            </div>
            <p className="text-sm text-slate whitespace-pre-line">{a.message}</p>
            {a.datePosted && (
              <p className="mt-2 text-xs text-muted">
                {new Date(a.datePosted).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
