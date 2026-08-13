'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import BulkImportWizard from '@/components/admin/BulkImportWizard';

// Seller bulk-import trigger: button + wizard + cache refresh, so My Products,
// Dashboard and Approval Status can each drop it in with one line.
export default function SellerBulkImportButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  function done() {
    setOpen(false);
    // The wizard batches its own commits, so nothing auto-invalidates — refresh
    // the whole seller namespace (products, submissions, dashboard) in one call.
    queryClient.invalidateQueries({ queryKey: ['seller'] });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className ?? 'rounded-xl border border-line bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate hover:bg-white'}
      >
        Bulk import
      </button>
      {open && <BulkImportWizard mode="seller" onDone={done} />}
    </>
  );
}
