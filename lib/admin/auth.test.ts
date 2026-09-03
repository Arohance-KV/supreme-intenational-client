/**
 * Guards the session-switch fix in auth.ts: on login/logout, useAdminAuth runs
 * qc.removeQueries({ queryKey: ['admin'] }). This verifies that filter clears the
 * role-bearing ['admin','profile'] cache (the leak) while sparing unrelated caches.
 *
 * @testing-library/react is NOT installed, so we exercise the exact react-query
 * filter the hook uses against a real QueryClient rather than rendering the hook.
 */
import { QueryClient } from '@tanstack/react-query';

test("removeQueries(['admin']) clears the cached admin profile/role but spares other caches", () => {
  const qc = new QueryClient();
  qc.setQueryData(['admin', 'profile'], { role: 'superAdmin' });
  qc.setQueryData(['admin', 'analytics', 'summary'], { total: 5 });
  qc.setQueryData(['cart'], { items: 3 });

  // Same call useAdminAuth makes on login and logout.
  qc.removeQueries({ queryKey: ['admin'] });

  // Stale superAdmin identity is gone: next session must refetch its own role.
  expect(qc.getQueryData(['admin', 'profile'])).toBeUndefined();
  expect(qc.getQueryData(['admin', 'analytics', 'summary'])).toBeUndefined();
  // Non-admin caches are untouched.
  expect(qc.getQueryData(['cart'])).toEqual({ items: 3 });
});
