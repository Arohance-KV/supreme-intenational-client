import { useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const KEY = 'adminToken';
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

export function useAdminAuth() {
  const qc = useQueryClient();
  const token = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => (typeof window !== 'undefined' ? localStorage.getItem(KEY) : null),
    () => null,
  );
  // Purge every ['admin', …] query on both auth boundaries. The cached ['admin','profile']
  // (role) drives the nav tabs + AdminGuard; without this it survives a logout→login and a
  // higher-privilege role's UI leaks into the next session until a manual refresh. Clearing on
  // login too covers sessions that ended via a 401 redirect (which bypasses logout()).
  return {
    token,
    isLoggedIn: !!token,
    login: (t: string) => { localStorage.setItem(KEY, t); qc.removeQueries({ queryKey: ['admin'] }); emit(); },
    logout: () => { localStorage.removeItem(KEY); qc.removeQueries({ queryKey: ['admin'] }); emit(); },
  };
}
