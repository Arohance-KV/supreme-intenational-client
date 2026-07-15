import { useMutation } from '@tanstack/react-query';
import { adminFetch } from './api';

// SuperAdmin catalogue/quotation generation with per-product additional-charge options.
// Docs are not persisted server-side, so the result is just a PDF URL.

export interface AdditionalCharge {
  label: string;
  amount: number;
}

export interface ProductVariant {
  label: string;
  price: number;
}

interface GenerateBody {
  productIds: string[];
  charges: AdditionalCharge[];
  variants: Record<string, ProductVariant[]>;
}

export interface CatalogueResult {
  pdfUrl: string;
  catalogueNumber: string;
}

export interface QuotationResult {
  pdfUrl: string;
  quotationNumber: string;
}

export function useAdminGenerateCatalogue() {
  return useMutation<CatalogueResult, Error, GenerateBody>({
    mutationFn: (body) =>
      adminFetch<CatalogueResult>('/admin/generate/catalogue', { method: 'POST', body }),
  });
}

export function useAdminGenerateQuotation() {
  return useMutation<QuotationResult, Error, GenerateBody>({
    mutationFn: (body) =>
      adminFetch<QuotationResult>('/admin/generate/quotation', { method: 'POST', body }),
  });
}
