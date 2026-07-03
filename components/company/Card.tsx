export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-white shadow-[0_8px_26px_rgba(34,36,90,.06)] ${className}`}
    >
      {children}
    </div>
  );
}
