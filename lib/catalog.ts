const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';

async function catalogFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message ?? 'Catalog fetch failed');
  }
  return json.data as T;
}

export interface ProductBadge {
  label: string;
  variant: 'primary' | 'accent';
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  badge: ProductBadge | null;
  rating: number;
  totalReviews: number;
  minPrice: number;
  originalMinPrice: number;
  category?: string;
  isFeatured?: boolean;
}

export interface CategoryAttribute {
  attributeId: string;
  displayOrder: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  attributes: CategoryAttribute[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function getFeatured(): Promise<Product[]> {
  return catalogFetch<Product[]>('/catalog/products/featured');
}

export function getBestsellers(): Promise<Product[]> {
  return catalogFetch<Product[]>('/catalog/products/bestsellers');
}

export function getCategories(): Promise<Category[]> {
  return catalogFetch<Category[]>('/catalog/categories');
}

export function getProducts(
  qs?: string,
): Promise<{ products: Product[]; pagination: Pagination }> {
  return catalogFetch<{ products: Product[]; pagination: Pagination }>(
    `/catalog/products${qs ?? ''}`,
  );
}

export function getProductBySlug(slug: string): Promise<Product> {
  return catalogFetch<Product>(`/catalog/products/${slug}`);
}

export function getRelated(slug: string): Promise<Product[]> {
  return catalogFetch<Product[]>(`/catalog/products/${slug}/related`);
}
