import * as m from './userAuth';

test('exports the company login hook', () => {
  expect(typeof (m as Record<string, unknown>).useCompanyLogin).toBe('function');
});
