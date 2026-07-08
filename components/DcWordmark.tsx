import Image from 'next/image';

// Brand lockup: Supreme International + Elate logos (from /public).
// `dark` inverts the dark-on-transparent PNGs to white for dark backgrounds.
export default function DcWordmark({ dark = false }: { dark?: boolean }) {
  const inv = dark ? 'brightness-0 invert' : '';
  return (
    <span className="flex items-center gap-2.5">
      <Image src="/supreme-logo.png" alt="Supreme International" width={300} height={87} className={`h-7 w-auto ${inv}`} />
      <span className={`h-7 w-px ${dark ? 'bg-white/25' : 'bg-line'}`} />
      <Image src="/elate-logo.png" alt="Elate" width={198} height={102} className={`h-9 w-auto ${inv}`} />
    </span>
  );
}
