import SellerSidebar from '@/components/seller/SellerSidebar';
import SellerGuard from '@/components/seller/SellerGuard';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-app-root className="font-display relative flex min-h-screen w-full flex-col bg-[#eef0f8] text-ink md:flex-row">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(40%_40%_at_100%_0%,rgba(20,155,142,.12),transparent_60%),radial-gradient(40%_40%_at_0%_100%,rgba(58,60,152,.1),transparent_60%),linear-gradient(180deg,#eef0f8,#f1f1f7)]" />
      <SellerSidebar />
      <main data-app-main className="relative z-[1] min-w-0 flex-1">
        <SellerGuard>{children}</SellerGuard>
      </main>
    </div>
  );
}
