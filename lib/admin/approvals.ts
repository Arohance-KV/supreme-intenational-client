import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

export type ApprovalType = 'blog' | 'caseStudy' | 'clientLogo' | 'popup' | 'companyBranding';

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
    mutationFn: ({ type, id, decision }: { type: ApprovalType; id: string; decision: 'accept' | 'reject' }) =>
      adminFetch(`/admin/approvals/${type}/${id}/${decision}`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'approvals'] }),
  });
}
