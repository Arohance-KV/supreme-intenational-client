import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';

// ── Client logos ────────────────────────────────────────────────────────────
export interface ClientLogo {
  _id: string;
  name: string;
  logoUrl: string;
  website: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}
export type ClientLogoInput = Partial<Omit<ClientLogo, '_id' | 'createdAt'>>;

export function useClientLogos() {
  return useQuery<ClientLogo[]>({
    queryKey: ['admin', 'client-logos'],
    queryFn: () => adminFetch<ClientLogo[]>('/admin/client-logos'),
  });
}
export function useSaveClientLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: ClientLogoInput & { id?: string }) =>
      adminFetch<ClientLogo>(`/admin/client-logos${id ? `/${id}` : ''}`, { method: id ? 'PATCH' : 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'client-logos'] }),
  });
}
export function useDeleteClientLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch<unknown>(`/admin/client-logos/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'client-logos'] }),
  });
}

// ── Case studies ────────────────────────────────────────────────────────────
export interface CaseStudy {
  _id: string;
  title: string;
  industry: string;
  summary: string;
  coverImage: string;
  result: string;
  order: number;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}
export type CaseStudyInput = Partial<Omit<CaseStudy, '_id' | 'createdAt' | 'publishedAt'>>;

export function useCaseStudies() {
  return useQuery<CaseStudy[]>({
    queryKey: ['admin', 'case-studies'],
    queryFn: () => adminFetch<CaseStudy[]>('/admin/case-studies'),
  });
}
export function useSaveCaseStudy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: CaseStudyInput & { id?: string }) =>
      adminFetch<CaseStudy>(`/admin/case-studies${id ? `/${id}` : ''}`, { method: id ? 'PATCH' : 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'case-studies'] }),
  });
}
export function useDeleteCaseStudy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch<unknown>(`/admin/case-studies/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'case-studies'] }),
  });
}

// ── Marketing pop-ups ─────────────────────────────────────────────────────────
export type PopupTrigger = 'immediate' | 'after_delay' | 'exit_intent';
export interface SitePopup {
  _id: string;
  title: string;
  message: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  trigger: PopupTrigger;
  delaySeconds: number;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
}
export type SitePopupInput = Partial<Omit<SitePopup, '_id' | 'createdAt'>>;

export function usePopups() {
  return useQuery<SitePopup[]>({
    queryKey: ['admin', 'popups'],
    queryFn: () => adminFetch<SitePopup[]>('/admin/popups'),
  });
}
export function useSavePopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: SitePopupInput & { id?: string }) =>
      adminFetch<SitePopup>(`/admin/popups${id ? `/${id}` : ''}`, { method: id ? 'PATCH' : 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'popups'] }),
  });
}
export function useDeletePopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch<unknown>(`/admin/popups/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'popups'] }),
  });
}
