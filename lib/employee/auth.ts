'use client';
import { useSyncExternalStore } from 'react';

const KEY = 'employeeToken';
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

export function useEmployeeAuth() {
  const token = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => (typeof window !== 'undefined' ? localStorage.getItem(KEY) : null),
    () => null,
  );
  return {
    token,
    isLoggedIn: !!token,
    login: (t: string) => { localStorage.setItem(KEY, t); emit(); },
    logout: () => { localStorage.removeItem(KEY); emit(); },
  };
}
