'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useWishlist, useWishlistMutations } from '@/lib/wishlist';

// Sits over a ProductCard's image. react-query dedupes the ['wishlist'] query, so many
// buttons on a page share one fetch. Positioned as a sibling of the card's <Link> (not
// nested inside it) to keep valid markup and stop the click from navigating.
export default function WishlistButton({ productId }: { productId: string }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { data } = useWishlist(isLoggedIn);
  const { add, remove } = useWishlistMutations();
  const saved = !!data?.products.some((p) => p._id === productId);
  const pending = add.isPending || remove.isPending;

  const toggle = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    (saved ? remove : add).mutate(productId);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved items' : 'Save item'}
      className={`absolute right-[22px] top-[22px] z-[2] flex h-[30px] w-[30px] items-center justify-center rounded-full text-[15px] shadow-[0_2px_8px_rgba(34,36,90,.15)] transition-transform hover:scale-110 disabled:opacity-60 ${
        saved ? 'bg-accent text-white' : 'bg-white/85 text-slate'
      }`}
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}
