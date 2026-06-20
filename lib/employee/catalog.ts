'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Product, Pagination } from '@/lib/catalog';

interface EmployeeProductsParams {
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useEmployeeProducts(params: EmployeeProductsParams = {}) {
  return useQuery<{ products: Product[]; pagination: Pagination }>({
    queryKey: ['employee', 'products', params],
    queryFn: () => {
      const qs = new URLSearchParams();
      if (params.category) qs.set('category', params.category);
      if (params.sort) qs.set('sort', params.sort);
      if (params.page != null) qs.set('page', String(params.page));
      if (params.limit != null) qs.set('limit', String(params.limit));
      const search = qs.toString();
      return apiFetch<{ products: Product[]; pagination: Pagination }>(
        `/employee/catalog/products${search ? '?' + search : ''}`,
        { tokenKey: 'employeeToken' },
      );
    },
  });
}

export function useEmployeeSearch(q: string) {
  return useQuery<{ products: Product[]; pagination: Pagination }>({
    queryKey: ['employee', 'search', q],
    enabled: q.trim().length > 0,
    queryFn: () => {
      const qs = new URLSearchParams({ q });
      return apiFetch<{ products: Product[]; pagination: Pagination }>(
        `/employee/catalog/search?${qs.toString()}`,
        { tokenKey: 'employeeToken' },
      );
    },
  });
}

export function useRecentlyViewed() {
  return useQuery<{ products: Product[] }>({
    queryKey: ['employee', 'recently-viewed'],
    queryFn: () =>
      apiFetch<{ products: Product[] }>('/employee/catalog/recently-viewed', {
        tokenKey: 'employeeToken',
      }),
  });
}
