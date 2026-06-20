'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface WalletBalance {
  balance: number;
  currency: string;
}

export type LedgerEntry = Record<string, unknown>;

/** Normalise whatever the server returns to an array of entries. */
function normaliseLedger(raw: unknown): LedgerEntry[] {
  if (Array.isArray(raw)) return raw as LedgerEntry[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    for (const key of ['entries', 'ledger', 'data']) {
      if (Array.isArray(obj[key])) return obj[key] as LedgerEntry[];
    }
  }
  return [];
}

export function useWallet() {
  return useQuery<WalletBalance>({
    queryKey: ['employee', 'wallet'],
    queryFn: () => apiFetch<WalletBalance>('/employee/wallet', { tokenKey: 'employeeToken' }),
    retry: false,
  });
}

export function useWalletLedger(page?: number) {
  return useQuery<LedgerEntry[]>({
    queryKey: ['employee', 'wallet-ledger', page],
    queryFn: async () => {
      const url = page !== undefined
        ? `/employee/wallet/ledger?page=${page}`
        : '/employee/wallet/ledger';
      const raw = await apiFetch<unknown>(url, { tokenKey: 'employeeToken' });
      return normaliseLedger(raw);
    },
    retry: false,
  });
}
