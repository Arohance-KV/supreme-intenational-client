'use client';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Product, Pagination, ProductDetail, ProductVariant } from '@/lib/catalog';
import type {
  PortalHero, PortalAnnouncement, PortalContentBlock, PortalPromotion, PortalTheme, PortalAbout,
} from '@/lib/admin/companies';

export type { ProductDetail, ProductVariant };

export interface EmployeeCompany {
  name: string;
  slug: string;
  logo: string;
  portalHero?: PortalHero | null;
  portalAnnouncements?: PortalAnnouncement[];
  portalContentBlocks?: PortalContentBlock[];
  portalPromotion?: PortalPromotion | null;
  portalTheme?: PortalTheme | null;
  portalAbout?: PortalAbout | null;
  featuredProducts?: Product[];
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
  // attribute slug → selected value slugs (e.g. { colour: ['red','blue'] })
  attributeFilters?: Record<string, string[]>;
}

type ProductPage = { products: Product[]; pagination: Pagination };

function fetchEmployeeProducts(params: EmployeeProductsParams, page: number): Promise<ProductPage> {
  const qs = new URLSearchParams();
  (params.categoryIds ?? []).forEach((c) => qs.append('category', c));
  if (params.minPrice != null) qs.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null) qs.set('maxPrice', String(params.maxPrice));
  if (params.sort) qs.set('sort', params.sort);
  qs.set('page', String(page));
  if (params.limit != null) qs.set('limit', String(params.limit));
  Object.entries(params.attributeFilters ?? {}).forEach(([slug, vals]) =>
    vals.forEach((v) => qs.append(slug, v)),
  );
  const search = qs.toString();
  return apiFetch<ProductPage>(
    `/employee/catalog/products${search ? '?' + search : ''}`,
    { tokenKey: 'employeeToken' },
  );
}

// Next page = current + 1 until the API says we're on the last one.
const nextPage = (last: ProductPage) =>
  last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined;

// Infinite variants back the catalog's scroll-to-load list. The params object is
// part of the query key, so changing a filter starts a fresh list automatically.
export function useEmployeeProductsInfinite(params: EmployeeProductsParams = {}, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['employee', 'products', params],
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchEmployeeProducts(params, pageParam),
    getNextPageParam: nextPage,
  });
}

export interface EmployeeAttributeValue {
  _id: string;
  slug: string;
  label: string;
  isActive: boolean;
}

export interface EmployeeAttribute {
  _id: string;
  name: string;
  slug: string;
  unit?: string;
  values: EmployeeAttributeValue[];
}

export interface EmployeeCatalogFilters {
  categories: { _id: string; name: string }[];
  priceRange: { min: number; max: number };
  attributes: EmployeeAttribute[];
}

// Filter options scoped to what this employee can see (whitelisted categories + price bounds).
export function useEmployeeFilters() {
  return useQuery<EmployeeCatalogFilters>({
    queryKey: ['employee', 'filters'],
    queryFn: () => apiFetch<EmployeeCatalogFilters>('/employee/catalog/filters', { tokenKey: 'employeeToken' }),
    staleTime: 5 * 60_000,
  });
}

export function useEmployeeSearchInfinite(q: string) {
  return useInfiniteQuery({
    queryKey: ['employee', 'search', q],
    enabled: q.trim().length > 0,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const qs = new URLSearchParams({ q, page: String(pageParam), limit: '12' });
      return apiFetch<ProductPage>(
        `/employee/catalog/search?${qs.toString()}`,
        { tokenKey: 'employeeToken' },
      );
    },
    getNextPageParam: nextPage,
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
