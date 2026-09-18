/**
 * Regression test for the seller bulk-import logout bug: BulkImportWizard in seller mode
 * used to fetch /admin/attributes via adminFetch, whose 401 handler hard-redirects the
 * browser to /admin/login (invisible to anyone who happened to also be logged in as admin
 * in the same browser). Seller/public callers must hit the public catalog endpoint instead.
 *
 * Logic-only (no @testing-library/react): tests the fetcher useAttributes delegates to.
 */

jest.mock('@/lib/api', () => ({ apiFetch: jest.fn() }));
jest.mock('./api', () => ({ adminFetch: jest.fn() }));

import { fetchAttributes } from './taxonomy';
import { apiFetch } from '@/lib/api';
import { adminFetch } from './api';

const mockApiFetch = apiFetch as jest.Mock;
const mockAdminFetch = adminFetch as jest.Mock;

beforeEach(() => {
  mockApiFetch.mockReset().mockResolvedValue([]);
  mockAdminFetch.mockReset().mockResolvedValue([]);
});

test('public mode reads /catalog/attributes and never touches adminFetch', async () => {
  await fetchAttributes({ public: true });
  expect(mockApiFetch).toHaveBeenCalledWith('/catalog/attributes');
  expect(mockAdminFetch).not.toHaveBeenCalled();
});

test('admin mode (default) still reads /admin/attributes via adminFetch', async () => {
  await fetchAttributes();
  expect(mockAdminFetch).toHaveBeenCalledWith('/admin/attributes');
  expect(mockApiFetch).not.toHaveBeenCalled();
});
