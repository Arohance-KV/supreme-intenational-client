'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface SellerProfile {
  _id: string;
  businessName: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  marginPercent: number;
  description?: string;
  contact?: { email?: string; phone?: string };
}

export function useSellerMe(enabled: boolean) {
  return useQuery({
    queryKey: ['seller', 'me'],
    queryFn: () => apiFetch<SellerProfile>('/seller/me', { tokenKey: 'sellerToken' }),
    enabled,
    staleTime: 60_000,
  });
}
