import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

export type ApprovalType = 'blog' | 'caseStudy' | 'clientLogo' | 'popup' | 'companyBranding' | 'quotation' | 'product';

export interface ApprovalItem {
  type: ApprovalType;
  id: string;
  title: string;
  submittedBy: string | null;
  submittedAt: string | null;
  previewLink: string;
}

export function useApprovals() {
  return useQuery<ApprovalItem[]>({
    queryKey: ['admin', 'approvals'],
    queryFn: () => adminFetch<ApprovalItem[]>('/admin/approvals'),
  });
}

export function useDecideApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      id,
      decision,
      reason,
    }: {
      type: ApprovalType;
      id: string;
      decision: 'accept' | 'reject';
      reason?: string;
    }) =>
      adminFetch(`/admin/approvals/${type}/${id}/${decision}`, {
        method: 'POST',
        body: decision === 'reject' && reason ? { reason } : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'approvals'] });
      qc.invalidateQueries({ queryKey: ['admin', 'quotations'] });
    },
  });
}
