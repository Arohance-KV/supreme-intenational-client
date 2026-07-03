'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const T = { tokenKey: 'companyToken' as const };

// Mirrors server/src/models/quotation.model.ts QuotationStatus.
export type QuotationStatus = 'generated' | 'sent' | 'viewed' | 'converted' | 'archived';

// Mirrors server/src/models/quotation.model.ts IQuotationItem.
export interface CompanyQuotationItem {
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

// Mirrors server/src/models/quotation.model.ts IQuotationContact.
export interface CompanyQuotationContact {
  name: string;
  email: string;
  phoneNumber: string;
  isdCode: string;
  company: string;
}

// Mirrors the full Quotation document returned by
// quotationService.listByCompany (server/src/services/quotation.service.ts) —
// findByCompany returns whole docs, no field projection, so pdfUrl is always
// present and can be used directly as the "View" link.
export interface CompanyQuotation {
  _id: string;
  quotationNumber: string;
  status: QuotationStatus;
  subtotal: number;
  discountAmount: number;
  total: number;
  currency: string;
  pdfUrl: string;
  items: CompanyQuotationItem[];
  contact: CompanyQuotationContact;
  createdAt: string;
}

export interface CompanyQuotationsResult {
  items: CompanyQuotation[];
  total: number;
  page: number;
  limit: number;
}

// Mirrors server/src/models/enquiry.model.ts EnquiryType/EnquiryStatus.
export type EnquiryType = 'merchandising' | 'product-request';
export type EnquiryStatus = 'new' | 'in_progress' | 'resolved';

export interface EnquiryItem {
  productId: string | null;
  productName: string;
  qty: number | null;
}

// Mirrors the Enquiry document returned by enquiryService.listByCompany, always
// filtered to type 'merchandising' by the /company/enquiries route.
export interface Enquiry {
  _id: string;
  companyId: string;
  raisedBy: string | null;
  type: EnquiryType;
  subject: string;
  message: string;
  items: EnquiryItem[];
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiriesResult {
  items: Enquiry[];
  total: number;
  page: number;
  limit: number;
}

// Mirrors raiseEnquiryValidator (server/src/middlewares/validators/company.validator.ts):
// subject required, message optional.
export interface RaiseEnquiryBody {
  subject: string;
  message?: string;
}

const QUOTATIONS_KEY = ['company', 'quotations'] as const;
const ENQUIRIES_KEY = ['company', 'enquiries'] as const;

export function useCompanyQuotations() {
  return useQuery<CompanyQuotationsResult>({
    queryKey: QUOTATIONS_KEY,
    queryFn: () => apiFetch<CompanyQuotationsResult>('/company/quotations', T),
  });
}

export function useCompanyEnquiries() {
  return useQuery<EnquiriesResult>({
    queryKey: ENQUIRIES_KEY,
    queryFn: () => apiFetch<EnquiriesResult>('/company/enquiries', T),
  });
}

export function useRaiseEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RaiseEnquiryBody) =>
      apiFetch<Enquiry>('/company/enquiries', { method: 'POST', body, ...T }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ENQUIRIES_KEY }),
  });
}
