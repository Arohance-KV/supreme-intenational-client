import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from './api';
import { ApiError } from '@/lib/api';
import { getSessionId } from '@/lib/session';

// ── Job openings ────────────────────────────────────────────────────────────

export interface JobOpening {
  _id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobOpeningInput {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description: string;
  isActive?: boolean;
}

export function useOpenings() {
  return useQuery<JobOpening[]>({
    queryKey: ['admin', 'careers', 'openings'],
    queryFn: () => adminFetch<JobOpening[]>('/admin/careers/jobs'),
  });
}

export function useSaveOpening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: JobOpeningInput }) =>
      adminFetch<JobOpening>(id ? `/admin/careers/jobs/${id}` : '/admin/careers/jobs', {
        method: id ? 'PATCH' : 'POST',
        body: input,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'careers', 'openings'] }),
  });
}

export function useDeleteOpening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch<unknown>(`/admin/careers/jobs/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'careers', 'openings'] }),
  });
}

// ── Applications ──────────────────────────────────────────────────────────────

export type ApplicationStatus = 'new' | 'reviewing' | 'shortlisted' | 'rejected';

export interface JobApplication {
  _id: string;
  fullName: string;
  email: string;
  isdCode?: string;
  phoneNumber?: string;
  position: string;
  coverLetter?: string;
  resumeUrl: string;
  iss?: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface ApplicationsResponse {
  items: JobApplication[];
  total: number;
  page: number;
  limit: number;
}

export function useApplications(page = 1) {
  const qs = page > 1 ? `?page=${page}` : '';
  return useQuery<ApplicationsResponse>({
    queryKey: ['admin', 'careers', 'applications', page],
    queryFn: () => adminFetch<ApplicationsResponse>(`/admin/careers/applications${qs}`),
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      adminFetch<JobApplication>(`/admin/careers/applications/${id}/status`, { method: 'PATCH', body: { status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'careers', 'applications'] }),
  });
}

// Create is multipart (resume PDF) — raw fetch, mirrors uploadAdminImage.
export interface CreateApplicationInput {
  fullName: string;
  email: string;
  isdCode?: string;
  phoneNumber?: string;
  position: string;
  coverLetter?: string;
  resume: File;
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateApplicationInput) => {
      const fd = new FormData();
      fd.append('resume', input.resume);
      fd.append('fullName', input.fullName);
      fd.append('email', input.email);
      fd.append('position', input.position);
      if (input.isdCode) fd.append('isdCode', input.isdCode);
      if (input.phoneNumber) fd.append('phoneNumber', input.phoneNumber);
      if (input.coverLetter) fd.append('coverLetter', input.coverLetter);
      fd.append('iss', 'admin');

      const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const res = await fetch(`${base}/admin/careers/applications`, {
        method: 'POST',
        headers: {
          'x-session-id': getSessionId(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new ApiError(json?.message ?? 'Failed to create application', res.status);
      }
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'careers', 'applications'] }),
  });
}
