// Supreme × Elate text wordmark (placeholder until real logo assets land in /public).
export default function DcWordmark({ dark = false }: { dark?: boolean }) {
  const c = dark ? 'text-white' : 'text-indigo';
  return (
    <div className="flex items-center gap-2.5">
      <span className={`text-[17px] font-extrabold tracking-[-.02em] ${c}`}>Supreme</span>
      <span className={`h-[22px] w-px ${dark ? 'bg-white/20' : 'bg-line'}`} />
      <span className={`text-base font-bold italic opacity-90 ${c}`}>Elate</span>
    </div>
  );
}
