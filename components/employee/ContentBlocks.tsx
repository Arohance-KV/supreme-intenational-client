import { glass } from '@/components/employee/ui';
import type { PortalContentBlock } from '@/lib/admin/companies';

function Block({ block }: { block: PortalContentBlock }) {
  const centered = block.layout === 'centered';
  const imageRight = block.layout === 'text-right';
  return (
    <div className={`rounded-[20px] p-5 sm:p-7 ${glass}`}>
      <div className={`flex flex-col gap-5 ${centered ? 'items-center text-center' : `sm:flex-row sm:items-center ${imageRight ? 'sm:flex-row-reverse' : ''}`}`}>
        {block.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.image} alt={block.title || ''} className={`rounded-[14px] object-cover ${centered ? 'max-h-56 w-full' : 'sm:w-1/3'}`} />
        )}
        <div className={centered ? '' : 'flex-1'}>
          {block.title && <h3 className="mb-2 text-lg font-extrabold tracking-[-.01em] text-ink">{block.title}</h3>}
          <p className="text-[15px] leading-relaxed text-slate whitespace-pre-line">{block.body}</p>
        </div>
      </div>
    </div>
  );
}

export default function ContentBlocks({ blocks }: { blocks?: PortalContentBlock[] }) {
  if (!blocks?.length) return null;
  return (
    <section className="space-y-4">
      {blocks.map((b, i) => <Block key={b._id ?? i} block={b} />)}
    </section>
  );
}
