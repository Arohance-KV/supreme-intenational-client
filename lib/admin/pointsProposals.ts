import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

// Points pool top-up requests a company submits; a superAdmin approves (funds the
// pool, optionally for less than requested) or rejects. See pointsProposal.model.ts.

export interface AdminPointsProposal {
  _id: string;
  companyId: string;
  requestedAmount: number;
  approvedAmount?: number;
  note?: string;
  decisionNote?: string;
  status: 'pending' | 'approved' | 'rejected';
  origin: 'company_request' | 'admin_grant';
  decidedBy?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DecideProposalBody {
  id: string;
  approve: boolean;
  approvedAmount?: number;
  note?: string;
}

const PROPOSALS_KEY = ['admin', 'points-proposals'] as const;

export function usePendingProposals() {
  return useQuery<AdminPointsProposal[]>({
    queryKey: PROPOSALS_KEY,
    queryFn: () => adminFetch<AdminPointsProposal[]>('/admin/points-proposals'),
  });
}

export function useDecideProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approve, approvedAmount, note }: DecideProposalBody) =>
      adminFetch<AdminPointsProposal>(`/admin/points-proposals/${id}/decide`, {
        method: 'POST',
        body: { approve, approvedAmount, note },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROPOSALS_KEY }),
  });
}
