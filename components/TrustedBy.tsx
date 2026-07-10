'use client';

import { useState } from 'react';

// Fallback brand marks via Google's favicon service — used only when the admin
// Clients/Logos CMS has no active logos yet (keeps the home strip from looking empty).
const fallbackBrands = [
  { name: 'Tata', logoUrl: 'https://www.google.com/s2/favicons?domain=tata.com&sz=128' },
  { name: 'Reliance', logoUrl: 'https://www.google.com/s2/favicons?domain=ril.com&sz=128' },
  { name: 'Infosys', logoUrl: 'https://www.google.com/s2/favicons?domain=infosys.com&sz=128' },
  { name: 'HDFC Bank', logoUrl: 'https://www.google.com/s2/favicons?domain=hdfcbank.com&sz=128' },
  { name: 'Wipro', logoUrl: 'https://www.google.com/s2/favicons?domain=wipro.com&sz=128' },
  { name: 'L&T', logoUrl: 'https://www.google.com/s2/favicons?domain=larsentoubro.com&sz=128' },
  { name: 'Mahindra', logoUrl: 'https://www.google.com/s2/favicons?domain=mahindra.com&sz=128' },
  { name: 'Asian Paints', logoUrl: 'https://www.google.com/s2/favicons?domain=asianpaints.com&sz=128' },
];

function Brand({ name, logoUrl }: { name: string; logoUrl: string }) {
  const [noLogo, setNoLogo] = useState(!logoUrl);
  return (
    <div className="flex shrink-0 items-center gap-2.5 opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0">
      {!noLogo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={name}
          loading="lazy"
          onError={() => setNoLogo(true)}
          className="h-7 w-auto max-w-[120px] rounded-[6px] object-contain"
        />
      )}
      <span className="whitespace-nowrap text-base font-bold text-indigo">{name}</span>
    </div>
  );
}

// `logos` comes from the Clients/Logos admin CMS (home passes it in). Falls back
// to the built-in brand set when the CMS is empty.
export default function TrustedBy({ logos }: { logos?: { name: string; logoUrl: string }[] }) {
  const brands = logos && logos.length ? logos : fallbackBrands;
  // Duplicate the list so the -50% marquee loops seamlessly (infinite scroll).
  const row = [...brands, ...brands];
  return (
    <div className="flex items-center gap-7 overflow-hidden rounded-[18px] border border-white/70 bg-white/[.42] px-6 py-[18px] backdrop-blur-[10px]">
      <span className="font-jbmono whitespace-nowrap text-[11px] uppercase tracking-[.1em] text-muted">Trusted by</span>
      <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max items-center gap-[52px] animate-marquee hover:[animation-play-state:paused]">
          {row.map((b, i) => (
            <Brand key={`${b.name}-${i}`} name={b.name} logoUrl={b.logoUrl} />
          ))}
        </div>
      </div>
    </div>
  );
}
