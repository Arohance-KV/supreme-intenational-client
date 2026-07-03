'use client';

import { use } from 'react';
import Link from 'next/link';
import { Card } from '@/components/company/Card';
import { StatusPill } from '@/components/company/StatusPill';
import { useCompanyOrder } from '@/lib/company/orders';
import { formatIN, formatDate } from '@/lib/company/format';

// Note: the company-scoped order endpoint returns the same flat DTO for both the
// list and the detail view (server/src/services/order.service.ts _toCompanyOrderDTO)
// — items are already joined into a single string and qty/points already summed,
// so there is no per-line-item breakdown to render here.
export default function CompanyOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { data: order, isLoading, isError } = useCompanyOrder(orderId);

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-7">
      <Link
        href="/company/orders"
        className="mb-5 inline-flex items-center gap-1 text-[13px] font-semibold text-slate no-underline hover:text-ink"
      >
        &larr; Back to Orders
      </Link>

      {isLoading && <Card className="p-6 text-[13px] text-muted">Loading…</Card>}

      {isError && !isLoading && (
        <Card className="p-6 text-[13px] text-muted">
          Could not load this order. It may not exist, or may not belong to your company.
        </Card>
      )}

      {order && !isLoading && !isError && (
        <div className="flex flex-col gap-5">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[.05em] text-muted">Order #</p>
                <p className="mt-1 font-jbmono text-[18px] font-bold text-ink">{order.orderId}</p>
              </div>
              <StatusPill status={order.status} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[.05em] text-muted">Employee</p>
                <p className="mt-1 text-[13.5px] font-semibold text-ink">{order.employeeName}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[.05em] text-muted">Placed on</p>
                <p className="mt-1 text-[13.5px] font-semibold text-ink">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[.05em] text-muted">Quantity</p>
                <p className="mt-1 text-[13.5px] font-semibold text-ink">{order.qty}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-[14px] font-bold text-ink">Items</h2>
            <p className="mt-2 text-[13.5px] text-slate">{order.item}</p>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <span className="text-[13.5px] font-semibold text-slate">Total points</span>
              <span className="text-[16px] font-extrabold text-ink">{formatIN(order.points)}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
