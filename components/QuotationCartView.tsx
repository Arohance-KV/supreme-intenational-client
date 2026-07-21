'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBestsellers } from '@/lib/catalog';
import type { Cart } from '@/lib/cart';
import type { useCartMutations } from '@/lib/cart';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/lib/userAuth';
import { useGenerateQuotation, emailQuotation, type GenerateQuotationResult } from '@/lib/quotation';
import { glass, secondaryBtn, input, eyebrow } from '@/components/employee/ui';
import CartItemRow from '@/components/CartItemRow';

// Indian-grouped whole-rupee headline (matches the reference: ₹3,39,000).
const inr0 = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

interface Props {
  cart: Cart;
  mutations: ReturnType<typeof useCartMutations>;
}

const B2B_LOCK_CODES = new Set(['B2B_PENDING_APPROVAL', 'B2B_REJECTED']);

export default function QuotationCartView({ cart, mutations }: Props) {
  const { setQty, remove, clear } = mutations;
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile(isLoggedIn);
  const b2bStatus = profile?.b2bStatus ?? 'approved';
  const quotationsLocked = b2bStatus !== 'approved';
  const generate = useGenerateQuotation();

  const [notes, setNotes] = useState('');
  const [genError, setGenError] = useState<string | null>(null);
  const [emailedSig, setEmailedSig] = useState<string | null>(null);
  const [busy, setBusy] = useState<'download' | 'whatsapp' | 'email' | null>(null);

  const totalUnits = useMemo(() => cart.items.reduce((s, i) => s + i.qty, 0), [cart.items]);

  // Dynamic "buyers often add" — live bestsellers minus whatever's already in the cart.
  const { data: bestsellers } = useQuery({ queryKey: ['bestsellers'], queryFn: getBestsellers, staleTime: 5 * 60_000 });
  const recommendations = useMemo(() => {
    const inCart = new Set(cart.items.map((i) => i.productId));
    return (bestsellers ?? []).filter((p) => !inCart.has(p._id)).slice(0, 2);
  }, [bestsellers, cart.items]);

  // Signature of the priced cart. When it changes, any cached quote / "emailed"
  // state is stale and both derive fresh from it — no effect needed.
  const cartSig = `${cart.itemCount}|${cart.total}|${cart.coupon?.code ?? ''}`;
  const emailSent = emailedSig === cartSig;

  // Cache one generated quotation per cart signature and reuse it across the
  // three actions so we don't create a duplicate record per click.
  const quoteRef = useRef<{ sig: string; result: GenerateQuotationResult } | null>(null);
  const ensureQuote = async () => {
    if (quoteRef.current?.sig === cartSig) return quoteRef.current.result;
    const result = await generate.mutateAsync({ source: 'cart' });
    quoteRef.current = { sig: cartSig, result };
    return result;
  };

  const runAction = async (action: 'download' | 'whatsapp' | 'email') => {
    setGenError(null);
    setBusy(action);
    try {
      const q = await ensureQuote();
      if (action === 'download') window.open(q.pdfUrl, '_blank', 'noopener');
      else if (action === 'whatsapp') window.open(q.whatsappUrl, '_blank', 'noopener');
      else { await emailQuotation(q.quotationId); setEmailedSig(cartSig); }
    } catch (err) {
      if (err instanceof ApiError && err.code && B2B_LOCK_CODES.has(err.code)) {
        // Cached profile is stale (approved/rejected moments ago) — refetch so
        // the locked banner takes over instead of the buttons staying live and
        // the user retrying into the same 403 indefinitely.
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
      setGenError(err instanceof ApiError ? err.message : 'Could not generate the quotation. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-6 font-display sm:px-6">
      {/* Header */}
      <div className="px-1 pb-2 pt-3">
        <div className={`${eyebrow} mb-2.5`}>Corporate procurement workspace</div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-extrabold leading-tight tracking-[-.02em] text-ink sm:text-[34px]">Cart &amp; Quotation Builder</h1>
            <p className="mt-1 text-sm text-slate">
              {cart.itemCount} line item{cart.itemCount !== 1 ? 's' : ''} · ready to generate a priced quotation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => clear.mutate()}
              disabled={clear.isPending}
              className="text-sm text-slate hover:text-[#e0524d] disabled:opacity-50"
            >
              Clear cart
            </button>
            <Link
              href="/products"
              className="rounded-xl border border-line bg-white/60 px-4 py-2.5 text-sm font-semibold text-indigo transition-colors hover:bg-white/80"
            >
              + Add more products
            </Link>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 items-start gap-6 py-5 lg:grid-cols-[1fr_360px]">
        {/* Left: line items + extras */}
        <div>
          <div className="flex flex-col gap-3.5">
            {cart.items.map((item) => (
              <CartItemRow
                key={item.variantId}
                item={item}
                setQty={setQty}
                remove={remove}
                enforceMoq
                productHrefBase="/products"
              />
            ))}
          </div>

          {cart.hasMoqViolations && (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-600">
              Some items are below their minimum order quantity. Please adjust quantities before generating.
            </p>
          )}

          {/* Smart recommendations */}
          {recommendations.length > 0 && (
            <div className={`mt-6 ${glass} rounded-[20px] p-4 sm:p-5`}>
              <div className="mb-4 flex items-center gap-2">
                <span className={eyebrow}>Smart recommendations</span>
                <span className="text-xs text-muted">— buyers often add these</span>
              </div>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {recommendations.map((r) => (
                  <div key={r._id} className="flex items-center gap-3 rounded-[14px] border border-line bg-white/60 p-3">
                    <div className="h-[54px] w-[54px] flex-none overflow-hidden rounded-[11px] bg-[linear-gradient(135deg,#e6eaf6,#dde2f1)]">
                      {r.images?.[0] && (
                        <Image src={r.images[0]} alt={r.name} width={54} height={54} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-ink">{r.name}</div>
                      <div className="text-xs text-slate">{inr0(r.minPrice)}</div>
                    </div>
                    <Link
                      href={`/products/${r.slug}`}
                      className="rounded-[10px] border border-[rgba(42,43,106,.14)] bg-[rgba(42,43,106,.07)] px-3 py-2 text-xs font-semibold text-indigo transition-colors hover:bg-[rgba(42,43,106,.12)]"
                    >
                      + Add
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes & branding — display-only draft. ponytail: not persisted; wire to
              the quotation payload when the backend accepts a notes field. */}
          <div className={`mt-3.5 ${glass} rounded-[20px] p-4 sm:p-5`}>
            <div className="mb-2.5 text-[13px] font-bold text-ink">Notes &amp; branding requirements</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Logo in white on navy · delivery to Mumbai & Pune offices by 15 Dec · need digital proof before production…"
              className={`${input} resize-y`}
            />
          </div>
        </div>

        {/* Right: sticky summary */}
        <div className={`${glass} rounded-[22px] p-5 sm:p-6 lg:sticky lg:top-[90px]`}>
          <div className="mb-4 text-[17px] font-extrabold tracking-[-.01em] text-ink">Summary</div>

          <div className="mb-3 flex justify-between text-sm text-slate"><span>Items</span><span className="font-semibold text-ink">{cart.itemCount}</span></div>
          <div className="mb-3 flex justify-between text-sm text-slate"><span>Total units</span><span className="font-semibold text-ink">{totalUnits}</span></div>
          <div className="mb-3 flex justify-between text-sm text-slate"><span>Est. branding</span><span className="font-semibold text-ink">Included</span></div>

          {/* Estimated total */}
          <div className="mt-3.5 border-t border-line pt-3.5">
            <div className="mb-0.5 text-[13px] text-slate">Estimated total</div>
            <div className="whitespace-nowrap text-[26px] font-extrabold sm:text-[28px] tracking-[-.02em] text-ink">{inr0(cart.total)}</div>
            <div className="mt-0.5 font-jbmono text-[10px] text-muted">tentative · confirmed in quote</div>
          </div>

          <div className={`${eyebrow} mb-3 mt-5 !text-muted`}>Generate output</div>

          {isLoggedIn ? (
            quotationsLocked ? (
              <div className="rounded-xl border border-[rgba(224,82,77,.2)] bg-[rgba(224,82,77,.06)] px-3.5 py-3">
                <div className="text-sm font-bold text-[#b03c38]">
                  {b2bStatus === 'rejected' ? 'Quotations unavailable' : 'Pending approval'}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#b03c38]">
                  {b2bStatus === 'rejected'
                    ? 'Your account is not approved for quotations.'
                    : 'Your account is pending approval for quotations. Our team will be in touch.'}
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => runAction('download')}
                  disabled={busy !== null || cart.hasMoqViolations}
                  className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-[13px] bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-4 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(42,43,106,.3)] transition-shadow hover:shadow-[0_10px_28px_rgba(42,43,106,.4)] disabled:opacity-50"
                >
                  {busy === 'download' ? 'Generating…' : '⬇ Download Quotation PDF'}
                </button>
                <button
                  onClick={() => runAction('whatsapp')}
                  disabled={busy !== null || cart.hasMoqViolations}
                  className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-[13px] bg-[#1fa463] px-4 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(31,164,99,.28)] transition-shadow hover:shadow-[0_10px_28px_rgba(31,164,99,.4)] disabled:opacity-50"
                >
                  {busy === 'whatsapp' ? 'Generating…' : '⌾ Send to WhatsApp'}
                </button>
                <button
                  onClick={() => runAction('email')}
                  disabled={busy !== null || cart.hasMoqViolations}
                  className={`${secondaryBtn} flex w-full items-center justify-center gap-2 px-4 py-3.5 text-sm`}
                >
                  {busy === 'email' ? 'Sending…' : emailSent ? 'Emailed ✓' : '✉ Email Quotation'}
                </button>
                {genError && <p className="mt-3 text-sm text-[#e0524d]">{genError}</p>}
              </>
            )
          ) : (
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-[13px] bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] px-4 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(42,43,106,.3)]"
            >
              Sign in to generate quotation
            </Link>
          )}

          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[rgba(23,155,142,.2)] bg-[rgba(23,155,142,.08)] px-3.5 py-3">
            <span className="text-sm">✓</span>
            <div className="text-xs leading-relaxed text-[#127d72]">Every quotation reaches Supreme&apos;s team as a qualified lead — we follow up with confirmed pricing.</div>
          </div>
        </div>
      </div>
    </main>
  );
}
