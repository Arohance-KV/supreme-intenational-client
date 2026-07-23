import { glass } from '@/components/employee/ui';
import type { PortalContentBlock } from '@/lib/admin/companies';

function Block({ block }: { block: PortalContentBlock }) {
  // A block with an image becomes a balanced two-column split (image fills its half,
  // full height); text vertically centred. Without an image it reads as a centred
  // editorial statement constrained to a comfortable measure — never a near-empty card.
  const hasImage = !!block.image;
  const imageRight = block.layout === 'text-right';

  if (!hasImage) {
    return (
      <div className={`rounded-[24px] px-6 py-12 text-center sm:px-10 sm:py-16 ${glass}`}>
        <div className="mx-auto max-w-2xl">
          {block.title && (
            <h3 className="text-2xl font-extrabold tracking-[-.02em] text-ink sm:text-[30px]">{block.title}</h3>
          )}
          <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-slate sm:text-lg">{block.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-[24px] ${glass}`}>
      <div className="grid md:grid-cols-2">
        <div className={`relative min-h-[240px] md:min-h-[360px] ${imageRight ? 'md:order-2' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.image} alt={block.title || ''} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className={`flex flex-col justify-center p-7 sm:p-10 lg:p-14 ${imageRight ? 'md:order-1' : ''}`}>
          {block.title && (
            <h3 className="text-2xl font-extrabold tracking-[-.02em] text-ink sm:text-[30px]">{block.title}</h3>
          )}
          <p className="mt-4 max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-slate sm:text-[17px]">{block.body}</p>
        </div>
      </div>
    </div>
  );
}

export default function ContentBlocks({ blocks }: { blocks?: PortalContentBlock[] }) {
  if (!blocks?.length) return null;
  return (
    <section className="space-y-6">
      {blocks.map((b, i) => <Block key={b._id ?? i} block={b} />)}
    </section>
  );
}
