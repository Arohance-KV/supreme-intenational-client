'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Product, Pagination, ProductDetail, ProductVariant } from '@/lib/catalog';

export type { ProductDetail, ProductVariant };

export interface EmployeeCompany {
  name: string;
  slug: string;
  logo: string;
}

// The company the signed-in employee belongs to — drives the portal header branding.
export function useEmployeeCompany() {
  return useQuery<EmployeeCompany>({
    queryKey: ['employee', 'company'],
    queryFn: () => apiFetch<EmployeeCompany>('/employee/catalog/company'),
    staleTime: 5 * 60_000,
  });
}

interface EmployeeProductsParams {
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useEmployeeProducts(params: EmployeeProductsParams = {}) {
  return useQuery<{ products: Product[]; pagination: Pagination }>({
    queryKey: ['employee', 'products', params],
    queryFn: () => {
      const qs = new URLSearchParams();
      (params.categoryIds ?? []).forEach((c) => qs.append('category', c));
      if (params.minPrice != null) qs.set('minPrice', String(params.minPrice));
      if (params.maxPrice != null) qs.set('maxPrice', String(params.maxPrice));
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

export interface EmployeeCatalogFilters {
  categories: { _id: string; name: string }[];
  priceRange: { min: number; max: number };
}

// Filter options scoped to what this employee can see (whitelisted categories + price bounds).
export function useEmployeeFilters() {
  return useQuery<EmployeeCatalogFilters>({
    queryKey: ['employee', 'filters'],
    queryFn: () => apiFetch<EmployeeCatalogFilters>('/employee/catalog/filters', { tokenKey: 'employeeToken' }),
    staleTime: 5 * 60_000,
  });
}

export function useEmployeeSearch(q: string, page: number = 1) {
  return useQuery<{ products: Product[]; pagination: Pagination }>({
    queryKey: ['employee', 'search', q, page],
    enabled: q.trim().length > 0,
    queryFn: () => {
      const qs = new URLSearchParams();
      qs.set('q', q);
      qs.set('page', String(page));
      qs.set('limit', '12');
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

export function useEmployeeProduct(slug: string) {
  return useQuery<ProductDetail>({
    queryKey: ['employee', 'product', slug],
    queryFn: () =>
      apiFetch<ProductDetail>(`/employee/catalog/products/${slug}`, {
        tokenKey: 'employeeToken',
      }),
    enabled: !!slug,
  });
}

export function useEmployeeRelated(slug: string) {
  return useQuery<Product[]>({
    queryKey: ['employee', 'product', slug, 'related'],
    queryFn: () =>
      apiFetch<Product[]>(`/employee/catalog/products/${slug}/related`, {
        tokenKey: 'employeeToken',
      }),
    enabled: !!slug,
  });
}
