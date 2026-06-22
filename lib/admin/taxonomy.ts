import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

/** Mirrors server IAttributeValue (sub-document _id is ObjectId serialised to string) */
export interface AttributeValue {
  _id: string;
  label: string;
  slug: string;
  meta?: Record<string, string>;
  displayOrder: number;
  isActive: boolean;
}

/** Mirrors server IAttribute */
export interface AdminAttribute {
  _id: string;
  name: string;
  slug: string;
  unit: string;
  values: AttributeValue[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors server ICategory */
export interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  /** Each entry is { attributeId: string; displayOrder: number } — no _id (schema has _id:false) */
  attributes: { attributeId: string; displayOrder: number }[];
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ── Create / Update bodies ────────────────────────────────────────────────────

export interface CreateCategoryBody {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  attributes?: { attributeId: string; displayOrder: number }[];
  displayOrder?: number;
}

export interface UpdateCategoryBody {
  name?: string;
  description?: string;
  image?: string;
  attributes?: { attributeId: string; displayOrder: number }[];
  displayOrder?: number;
  isActive?: boolean;
}

export interface CreateAttributeBody {
  name: string;
  slug?: string;
  unit?: string;
}

export interface UpdateAttributeBody {
  name?: string;
  unit?: string;
}

export interface AddAttributeValueBody {
  label: string;
  slug?: string;
  meta?: Record<string, string>;
  displayOrder?: number;
}

export interface UpdateAttributeValueBody {
  label?: string;
  slug?: string;
  meta?: Record<string, string>;
  displayOrder?: number;
}

// ── Query keys ────────────────────────────────────────────────────────────────

const CATEGORIES_KEY = ['admin', 'categories'] as const;
const ATTRIBUTES_KEY = ['admin', 'attributes'] as const;

// ── Category hooks ────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery<AdminCategory[]>({
    queryKey: CATEGORIES_KEY,
    queryFn: () => adminFetch<AdminCategory[]>('/admin/categories'),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCategoryBody) =>
      adminFetch<AdminCategory>('/admin/categories', { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryBody }) =>
      adminFetch<AdminCategory>(`/admin/categories/${id}`, { method: 'PATCH', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

// ── Attribute hooks ───────────────────────────────────────────────────────────

export function useAttributes() {
  return useQuery<AdminAttribute[]>({
    queryKey: ATTRIBUTES_KEY,
    queryFn: () => adminFetch<AdminAttribute[]>('/admin/attributes'),
  });
}

export function useCreateAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAttributeBody) =>
      adminFetch<AdminAttribute>('/admin/attributes', { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ATTRIBUTES_KEY }),
  });
}

export function useUpdateAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAttributeBody }) =>
      adminFetch<AdminAttribute>(`/admin/attributes/${id}`, { method: 'PATCH', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ATTRIBUTES_KEY }),
  });
}

export function useAddAttributeValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AddAttributeValueBody }) =>
      adminFetch<AdminAttribute>(`/admin/attributes/${id}/values`, { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ATTRIBUTES_KEY }),
  });
}

export function useUpdateAttributeValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      valueId,
      body,
    }: {
      id: string;
      valueId: string;
      body: UpdateAttributeValueBody;
    }) =>
      adminFetch<AdminAttribute>(`/admin/attributes/${id}/values/${valueId}`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ATTRIBUTES_KEY }),
  });
}

export function useRemoveAttributeValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, valueId }: { id: string; valueId: string }) =>
      adminFetch<AdminAttribute>(`/admin/attributes/${id}/values/${valueId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ATTRIBUTES_KEY }),
  });
}
