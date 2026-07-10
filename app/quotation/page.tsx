'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useGenerateQuotation, type GenerateQuotationResult } from '@/lib/quotation';
import { ApiError } from '@/lib/api';

function formatPrice(value: number): string {
  return `₹${value.toFixed(2)}`;
}

export default function QuotationPage() {
  const { isLoggedIn } = useAuth();
  const { data: cart, isLoading: cartLoading } = useCart();
  const generateMutation = useGenerateQuotation();
  const [result, setResult] = useState<GenerateQuotationResult | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold text-gray-900">Request a Quotation</h1>
        <p className="text-gray-500 text-center max-w-md">
          You must be logged in to generate a quotation. Your quotation history and PDF downloads
          require a verified account.
        </p>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign in to continue
        </Link>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading cart…</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setGenerateError(null);
    try {
      const data = await generateMutation.mutateAsync({ source: 'cart' });
      setResult(data);
    } catch (err) {
      setGenerateError(
        err instanceof ApiError ? err.message : 'Failed to generate quotation. Please try again.',
      );
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Request a Quotation</h1>
      <p className="text-gray-500 mb-8">
        Review your cart items below and generate a PDF quotation.
      </p>

      {/* Cart summary */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Cart Summary</h2>
        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Your cart is empty.</p>
            <Link
              href="/products"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div
                key={item.variantId}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    SKU: {item.sku}
                    {item.attributeLabels.length > 0 && ` · ${item.attributeLabels.join(' / ')}`}
                  </p>
                  <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatPrice(item.priceSnapshot * item.qty)}
                </p>
              </div>
            ))}
            <div className="pt-3 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </div>
        )}
      </section>

      {/* Result */}
      {result && (
        <section className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-green-800">Quotation Generated!</h2>
          <p className="text-sm text-green-700">
            Quotation ID: <span className="font-mono font-semibold">{result.quotationId}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={result.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download PDF
            </a>
            <a
              href={result.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Share on WhatsApp
            </a>
          </div>
          <p className="text-sm text-green-700">
            <Link href="/quotation/history" className="underline font-medium">
              View all quotations
            </Link>
          </p>
        </section>
      )}

      {/* Error */}
      {generateError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {generateError}
        </div>
      )}

      {/* Generate button */}
      {!result && cart && cart.items.length > 0 && (
        <button
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generateMutation.isPending ? 'Generating…' : 'Generate Quotation'}
        </button>
      )}
    </main>
  );
}
