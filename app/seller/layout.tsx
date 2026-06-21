import SellerHeader from '@/components/seller/SellerHeader';
import SellerGuard from '@/components/seller/SellerGuard';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <SellerHeader />
      <SellerGuard>{children}</SellerGuard>
    </div>
  );
}
