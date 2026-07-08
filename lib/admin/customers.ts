import { useQuery } from '@tanstack/react-query';
import { adminFetch } from './api';

export type CustomerAccountType = 'company' | 'employee' | 'individual';

export interface AdminCustomer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isdCode?: string;
  accountType: CustomerAccountType;
  employeeStatus?: 'invited' | 'active' | 'deactivated';
  verified: boolean;
  companyId?: string | null;
  companyName?: string;
  createdAt: string;
}

export interface CustomersResponse {
  items: AdminCustomer[];
  total: number;
  page: number;
  limit: number;
}

// type '' → backend default (B2B: company + employee)
export function useCustomers(filters: { type?: CustomerAccountType | ''; search?: string; page?: number } = {}) {
  const qs = new URLSearchParams();
  if (filters.type) qs.set('type', filters.type);
  if (filters.search) qs.set('search', filters.search);
  if (filters.page && filters.page > 1) qs.set('page', String(filters.page));
  const qsStr = qs.toString();

  return useQuery<CustomersResponse>({
    queryKey: ['admin', 'customers', filters.type ?? 'b2b', filters.search ?? '', filters.page ?? 1],
    queryFn: () => adminFetch<CustomersResponse>(`/admin/customers${qsStr ? `?${qsStr}` : ''}`),
  });
}
