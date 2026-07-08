import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch, ApiError } from './api';
import { getSessionId } from './session';

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

// Public: active openings for the careers page.
export function useJobs() {
  return useQuery<JobOpening[]>({
    queryKey: ['careers', 'jobs'],
    queryFn: () => apiFetch<JobOpening[]>('/careers/jobs'),
  });
}

// Public: single opening for the detail page.
export function useJob(id: string) {
  return useQuery<JobOpening>({
    queryKey: ['careers', 'job', id],
    queryFn: () => apiFetch<JobOpening>(`/careers/jobs/${id}`),
    enabled: !!id,
  });
}

// Public: submit an application (multipart — resume PDF). Raw fetch, no auth.
export interface ApplyInput {
  fullName: string;
  email: string;
  isdCode?: string;
  phoneNumber?: string;
  position: string;
  openingId?: string;
  coverLetter?: string;
  resume: File;
}

export function useApplyToJob() {
  return useMutation({
    mutationFn: async (input: ApplyInput) => {
      const fd = new FormData();
      fd.append('resume', input.resume);
      fd.append('fullName', input.fullName);
      fd.append('email', input.email);
      fd.append('position', input.position);
      if (input.openingId) fd.append('openingId', input.openingId);
      if (input.isdCode) fd.append('isdCode', input.isdCode);
      if (input.phoneNumber) fd.append('phoneNumber', input.phoneNumber);
      if (input.coverLetter) fd.append('coverLetter', input.coverLetter);
      fd.append('iss', 'careers');

      const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010';
      const res = await fetch(`${base}/careers/apply`, {
        method: 'POST',
        headers: { 'x-session-id': getSessionId() },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new ApiError(json?.message ?? 'Failed to submit application', res.status);
      }
      return json.data;
    },
  });
}
