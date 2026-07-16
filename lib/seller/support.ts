'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const T = { tokenKey: 'sellerToken' as const };

export type TicketStatus = 'open' | 'answered' | 'closed';

export interface TicketMessage {
  author: 'seller' | 'admin';
  body: string;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  subject: string;
  status: TicketStatus;
  messages: TicketMessage[];
  lastMessageAt: string;
  createdAt: string;
}

interface Paginated<U> {
  items: U[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export function useMyTickets() {
  return useQuery({
    queryKey: ['seller', 'tickets'],
    queryFn: () => apiFetch<Paginated<SupportTicket>>('/seller/support/tickets', T),
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['seller', 'ticket', id],
    queryFn: () => apiFetch<SupportTicket>(`/seller/support/tickets/${id}`, T),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { subject: string; body: string }) =>
      apiFetch<SupportTicket>('/seller/support/tickets', { method: 'POST', body, ...T }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller', 'tickets'] }),
  });
}

export function useReplyTicket(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      apiFetch<SupportTicket>(`/seller/support/tickets/${id}/reply`, { method: 'POST', body: { body }, ...T }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller', 'ticket', id] });
      qc.invalidateQueries({ queryKey: ['seller', 'tickets'] });
    },
  });
}
