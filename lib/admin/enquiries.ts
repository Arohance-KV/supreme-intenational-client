import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

// ── Quotation types ────────────────────────────────────────────────────────────

export type QuotationStatus = 'generated' | 'sent' | 'viewed' | 'converted' | 'archived';
export type LeadFollowUpStatus = 'new' | 'followed_up' | 'closed';
export type LeadType = 'quotation' | 'catalogue';

export interface QuotationContact {
  name: string;
  email: string;
  phoneNumber: string;
  isdCode: string;
  company: string;
}

export interface QuotationItem {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  attributeLabels: string[];
  unitPrice: number;
  qty: number;
  moq: number;
  lineTotal: number;
}

export interface Quotation {
  _id: string;
  quotationNumber: string;
  user: string;
  contact: QuotationContact;
  items: QuotationItem[];
  subtotal: number;
  couponCode: string | null;
  discountAmount: number;
  total: number;
  currency: string;
  pdfUrl: string;
  status: QuotationStatus;
  downloadCount: number;
  lastDownloadedAt: string | null;
  source: 'b2b';
  followUpStatus: LeadFollowUpStatus;
  sourceType: 'cart' | 'filters';
  filtersApplied: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationsResponse {
  items: Quotation[];
  total: number;
}

export interface QuotationFilters {
  status?: QuotationStatus | '';
  search?: string;
  page?: number;
}

export interface QuotationAnalytics {
  totalQuotations: number;
  totalDownloads: number;
  converted: number;
}

// ── Lead types ─────────────────────────────────────────────────────────────────

export interface LeadContact {
  name: string;
  email: string;
  phoneNumber?: string;
  isdCode?: string;
  company?: string;
}

export interface LeadItem {
  type: LeadType;
  refId: string;
  contact: LeadContact;
  productNames: string[];
  itemCount: number;
  status: LeadFollowUpStatus;
  pdfUrl: string;
  createdAt: string;
}

export interface LeadsResponse {
  items: LeadItem[];
  total: number;
}

export interface LeadFilters {
  type?: LeadType | '';
  status?: LeadFollowUpStatus | '';
  search?: string;
  page?: number;
}

// ── Quotation hooks ────────────────────────────────────────────────────────────

export function useQuotations(filters: QuotationFilters = {}) {
  const qs = new URLSearchParams();
  if (filters.status) qs.set('status', filters.status);
  if (filters.search) qs.set('search', filters.search);
  if (filters.page && filters.page > 1) qs.set('page', String(filters.page));
  const qsStr = qs.toString();

  return useQuery<QuotationsResponse>({
    queryKey: ['admin', 'quotations', 'list', filters.status ?? 'all', filters.search ?? '', filters.page ?? 1],
    queryFn: () =>
      adminFetch<QuotationsResponse>(`/admin/quotations${qsStr ? `?${qsStr}` : ''}`),
  });
}

export function useQuotation(id: string) {
  return useQuery<Quotation>({
    queryKey: ['admin', 'quotations', 'detail', id],
    queryFn: () => adminFetch<Quotation>(`/admin/quotations/${id}`),
    enabled: !!id,
  });
}

export function useUpdateQuotationStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: QuotationStatus) =>
      adminFetch<Quotation>(`/admin/quotations/${id}/status`, {
        method: 'PATCH',
        body: { status },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'quotations', 'detail', id] });
      qc.invalidateQueries({ queryKey: ['admin', 'quotations'] });
    },
  });
}

export function useQuotationAnalytics() {
  return useQuery<QuotationAnalytics>({
    queryKey: ['admin', 'quotations', 'analytics', 'summary'],
    queryFn: () => adminFetch<QuotationAnalytics>('/admin/quotations/analytics'),
  });
}

// ── Lead hooks ─────────────────────────────────────────────────────────────────

export function useLeads(filters: LeadFilters = {}) {
  const qs = new URLSearchParams();
  if (filters.type) qs.set('type', filters.type);
  if (filters.status) qs.set('status', filters.status);
  if (filters.search) qs.set('search', filters.search);
  if (filters.page && filters.page > 1) qs.set('page', String(filters.page));
  const qsStr = qs.toString();

  return useQuery<LeadsResponse>({
    queryKey: ['admin', 'leads', filters.type ?? 'all', filters.status ?? 'all', filters.search ?? '', filters.page ?? 1],
    queryFn: () =>
      adminFetch<LeadsResponse>(`/admin/leads${qsStr ? `?${qsStr}` : ''}`),
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id, status }: { type: LeadType; id: string; status: LeadFollowUpStatus }) =>
      adminFetch<unknown>(`/admin/leads/${type}/${id}/status`, {
        method: 'PATCH',
        body: { status },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'leads'] });
    },
  });
}
