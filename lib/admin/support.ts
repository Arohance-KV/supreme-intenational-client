import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

export type TicketStatus = 'open' | 'answered' | 'closed';

export interface AdminTicket {
  _id: string;
  ticketNumber: string;
  sellerId: string;
  subject: string;
  status: TicketStatus;
  messages: { author: 'seller' | 'admin'; body: string; createdAt: string }[];
  lastMessageAt: string;
  createdAt: string;
}

interface Paginated<U> {
  items: U[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export function useAdminTickets(status?: TicketStatus) {
  const qs = status ? `?status=${status}` : '';
  return useQuery({
    queryKey: ['admin', 'tickets', status ?? 'all'],
    queryFn: () => adminFetch<Paginated<AdminTicket>>(`/admin/support/tickets${qs}`),
  });
}

export function useAdminTicket(id: string) {
  return useQuery({
    queryKey: ['admin', 'ticket', id],
    queryFn: () => adminFetch<AdminTicket>(`/admin/support/tickets/${id}`),
    enabled: !!id,
  });
}

function useInvalidate(id: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['admin', 'ticket', id] });
    qc.invalidateQueries({ queryKey: ['admin', 'tickets'] });
  };
}

export function useAdminReply(id: string) {
  const inv = useInvalidate(id);
  return useMutation({
    mutationFn: (body: string) =>
      adminFetch<AdminTicket>(`/admin/support/tickets/${id}/reply`, { method: 'POST', body: { body } }),
    onSuccess: inv,
  });
}

export function useAdminClose(id: string) {
  const inv = useInvalidate(id);
  return useMutation({
    mutationFn: () => adminFetch<AdminTicket>(`/admin/support/tickets/${id}/close`, { method: 'PATCH' }),
    onSuccess: inv,
  });
}
