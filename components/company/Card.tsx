export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[20px] border p-[22px] ${className}`}
      style={{
        background: 'var(--glass-bg, rgba(255,255,255,.62))',
        borderColor: 'var(--glass-brd, rgba(255,255,255,.8))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 10px 30px rgba(34,36,90,.07)',
      }}
    >
      {children}
    </div>
  );
}
