'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface EmployeeProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isdCode: string;
  img: string | null;
  employeeStatus: 'invited' | 'active' | 'deactivated' | null;
  memberSince: string | null;
  company: { name: string; logo: string | null; walletMode: 'points' | 'coupon' } | null;
}

export function useEmployeeProfile() {
  return useQuery<EmployeeProfile>({
    queryKey: ['employee', 'profile'],
    queryFn: () => apiFetch<EmployeeProfile>('/employee/profile', { tokenKey: 'employeeToken' }),
    staleTime: 5 * 60_000,
  });
}
