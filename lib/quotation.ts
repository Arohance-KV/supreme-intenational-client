'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from './api';

export interface GenerateQuotationBody {
  source?: 'cart' | 'filters';
  filters?: Record<string, unknown>;
}

export interface GenerateQuotationResult {
  quotationId: string;
  quotationNumber: string;
  pdfUrl: string;
  whatsappUrl: string;
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
  status: string;
  total: number;
  currency: string;
  pdfUrl: string;
  items: QuotationItem[];
  createdAt: string;
  contact: {
    name: string;
    email: string;
    phoneNumber: string;
    company: string;
  };
}

export interface MyQuotationsResult {
  items: Quotation[];
  total: number;
  page: number;
  limit: number;
}

export interface QuotationPdfResult {
  pdfUrl: string;
  quotationNumber: string;
}

export function useGenerateQuotation() {
  return useMutation<GenerateQuotationResult, Error, GenerateQuotationBody>({
    mutationFn: (body) =>
      apiFetch<GenerateQuotationResult>('/quotations', { method: 'POST', body }),
  });
}

export function useMyQuotations() {
  return useQuery<MyQuotationsResult>({
    queryKey: ['quotations'],
    queryFn: () => apiFetch<MyQuotationsResult>('/quotations/mine'),
  });
}

export function getQuotationPdfUrl(id: string) {
  return apiFetch<QuotationPdfResult>(`/quotations/${id}/pdf`);
}

export function emailQuotation(id: string) {
  return apiFetch<{ sent: true }>(`/quotations/${id}/email`, { method: 'POST' });
}
