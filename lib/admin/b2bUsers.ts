import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

export type B2BStatus = 'pending' | 'approved' | 'rejected';

export interface B2BUser {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  isdCode?: string;
  phoneNumber?: string;
  company?: { name?: string; url?: string };
  b2bStatus: B2BStatus;
  assignedAdminIds: string[];
  createdAt: string;
}

interface B2BUserPage {
  items: B2BUser[];
  total: number;
  page: number;
  limit: number;
}

export interface SetB2BApprovalBody {
  status: B2BStatus;
  assignedAdminIds?: string[];
}

export function useB2BUsers(status: B2BStatus) {
  return useQuery<B2BUserPage>({
    queryKey: ['admin', 'b2b-users', status],
    queryFn: () => adminFetch<B2BUserPage>(`/admin/b2b-users?status=${status}&limit=100`),
  });
}

export function useSetB2BApproval(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SetB2BApprovalBody) =>
      adminFetch<B2BUser>(`/admin/b2b-users/${userId}/approval`, { method: 'PATCH', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'b2b-users'] }),
  });
}
