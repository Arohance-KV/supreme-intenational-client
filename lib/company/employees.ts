'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const T = { tokenKey: 'companyToken' as const };

export interface EmployeeWallet {
  allocated: number;
  used: number;
  balance: number;
}

export interface Employee {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  employeeStatus: 'invited' | 'active' | 'deactivated';
  phoneNumber?: string;
  img?: string;
  createdAt: string;
  wallet: EmployeeWallet;
}

export interface AddEmployeeBody {
  firstName: string;
  lastName?: string;
  email: string;
  isdCode?: string;
  phoneNumber?: string;
}

const EMPLOYEES_KEY = ['company', 'employees'] as const;

export function useCompanyEmployees() {
  return useQuery<Employee[]>({
    queryKey: EMPLOYEES_KEY,
    queryFn: () => apiFetch<Employee[]>('/company/employees', T),
  });
}

export function useAddEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddEmployeeBody) =>
      apiFetch<Employee>('/company/employees', { method: 'POST', body, ...T }),
    onSuccess: () => qc.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
  });
}

export function useSetEmployeeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'deactivated' }) =>
      apiFetch<Employee>(`/company/employees/${id}/status`, {
        method: 'PATCH',
        body: { status },
        ...T,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
  });
}

/**
 * Pure helper deciding which wallet endpoint + body a signed point delta maps to.
 * Kept side-effect free so it's directly unit-testable without mounting react-query.
 */
export function buildWalletAdjustment(
  id: string,
  delta: number,
): { path: string; body: { amount: number } } {
  if (!Number.isFinite(delta) || delta === 0) {
    throw new Error('delta must be a non-zero finite number');
  }
  return delta > 0
    ? { path: `/company/employees/${id}/wallet/credit`, body: { amount: delta } }
    : { path: `/company/employees/${id}/wallet/debit`, body: { amount: -delta } };
}

export function useAdjustPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, delta }: { id: string; delta: number }) => {
      const { path, body } = buildWalletAdjustment(id, delta);
      return apiFetch(path, { method: 'POST', body, ...T });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      qc.invalidateQueries({ queryKey: ['company', 'dashboard'] });
    },
  });
}
