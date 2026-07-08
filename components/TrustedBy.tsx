'use client';

import { useState } from 'react';

// Live brand marks via Google's favicon service (Clearbit is unreachable here).
// Plain <img> on purpose — the Next image optimizer is locked to our own CDN hosts.
const brands = [
  { name: 'Tata', domain: 'tata.com' },
  { name: 'Reliance', domain: 'ril.com' },
  { name: 'Infosys', domain: 'infosys.com' },
  { name: 'HDFC Bank', domain: 'hdfcbank.com' },
  { name: 'Wipro', domain: 'wipro.com' },
  { name: 'L&T', domain: 'larsentoubro.com' },
  { name: 'Mahindra', domain: 'mahindra.com' },
  { name: 'Asian Paints', domain: 'asianpaints.com' },
];

function Brand({ name, domain }: { name: string; domain: string }) {
  const [noLogo, setNoLogo] = useState(false);
  return (
    <div className="flex shrink-0 items-center gap-2.5 opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0">
      {!noLogo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
          alt={name}
          loading="lazy"
          onError={() => setNoLogo(true)}
          className="h-7 w-7 rounded-[6px] object-contain"
        />
      )}
      <span className="whitespace-nowrap text-base font-bold text-indigo">{name}</span>
    </div>
  );
}

export default function TrustedBy() {
  // Duplicate the list so the -50% marquee loops seamlessly (infinite scroll).
  const row = [...brands, ...brands];
  return (
    <div className="flex items-center gap-7 overflow-hidden rounded-[18px] border border-white/70 bg-white/[.42] px-6 py-[18px] backdrop-blur-[10px]">
      <span className="font-jbmono whitespace-nowrap text-[11px] uppercase tracking-[.1em] text-muted">Trusted by</span>
      <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max items-center gap-[52px] animate-marquee hover:[animation-play-state:paused]">
          {row.map((b, i) => (
            <Brand key={`${b.domain}-${i}`} name={b.name} domain={b.domain} />
          ))}
        </div>
      </div>
    </div>
  );
}
