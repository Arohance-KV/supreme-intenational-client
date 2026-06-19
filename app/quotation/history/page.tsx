'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useMyQuotations, getQuotationPdfUrl, emailQuotation } from '@/lib/quotation';
import { ApiError } from '@/lib/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPrice(value: number) {
  return `₹${value.toFixed(2)}`;
}

export default function QuotationHistoryPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { data, isLoading, error } = useMyQuotations();
  const [emailStatus, setEmailStatus] = useState<Record<string, 'idle' | 'sending' | 'sent' | 'error'>>({});
  const [pdfLoading, setPdfLoading] = useState<Record<string, boolean>>({});

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold text-gray-900">Quotation History</h1>
        <p className="text-gray-500 text-center max-w-md">
          You must be logged in to view your quotation history.
        </p>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading quotations…</p>
      </div>
    );
  }

  if (error) {
    if (error instanceof ApiError && error.status === 401) {
      router.push('/login');
      return null;
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load quotations. Please try again.</p>
      </div>
    );
  }

  const handleDownloadPdf = async (id: string) => {
    setPdfLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await getQuotationPdfUrl(id);
      window.open(res.pdfUrl, '_blank');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login');
      }
    } finally {
      setPdfLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleEmail = async (id: string) => {
    setEmailStatus((prev) => ({ ...prev, [id]: 'sending' }));
    try {
      await emailQuotation(id);
      setEmailStatus((prev) => ({ ...prev, [id]: 'sent' }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login');
        return;
      }
      setEmailStatus((prev) => ({ ...prev, [id]: 'error' }));
    }
  };

  const quotations = data?.items ?? [];

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quotation History</h1>
        <Link href="/quotation" className="text-sm text-blue-600 hover:underline font-medium">
          New Quotation
        </Link>
      </div>

      {quotations.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-gray-500 mb-4">You have no quotations yet.</p>
          <Link
            href="/cart"
            className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Cart
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {quotations.map((q) => (
            <div
              key={q._id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900 font-mono">{q.quotationNumber}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDate(q.createdAt)} · {q.items.length} item{q.items.length !== 1 ? 's' : ''} · {formatPrice(q.total)}
                  </p>
                  <span
                    className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      q.status === 'converted'
                        ? 'bg-green-100 text-green-700'
                        : q.status === 'generated'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {q.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDownloadPdf(q._id)}
                    disabled={pdfLoading[q._id]}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {pdfLoading[q._id] ? 'Opening…' : 'Download PDF'}
                  </button>

                  <button
                    onClick={() => handleEmail(q._id)}
                    disabled={emailStatus[q._id] === 'sending' || emailStatus[q._id] === 'sent'}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    {emailStatus[q._id] === 'sending'
                      ? 'Sending…'
                      : emailStatus[q._id] === 'sent'
                      ? 'Sent!'
                      : emailStatus[q._id] === 'error'
                      ? 'Retry Email'
                      : 'Email PDF'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {data && data.total > data.items.length && (
            <p className="text-center text-sm text-gray-400 pt-2">
              Showing {data.items.length} of {data.total} quotations.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
