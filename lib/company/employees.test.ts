import { buildWalletAdjustment } from './employees';

describe('buildWalletAdjustment', () => {
  test('routes positive deltas to the credit endpoint with a non-empty reason', () => {
    const { path, body } = buildWalletAdjustment('e1', 100);
    expect(path).toBe('/company/employees/e1/wallet/credit');
    expect(body.amount).toBe(100);
    expect(typeof body.reason).toBe('string');
    expect(body.reason.trim().length).toBeGreaterThan(0);
  });

  test('routes negative deltas to the debit endpoint with a positive amount and a non-empty reason', () => {
    const { path, body } = buildWalletAdjustment('e1', -100);
    expect(path).toBe('/company/employees/e1/wallet/debit');
    expect(body.amount).toBe(100);
    expect(typeof body.reason).toBe('string');
    expect(body.reason.trim().length).toBeGreaterThan(0);
  });

  test('rejects a zero delta', () => {
    expect(() => buildWalletAdjustment('e1', 0)).toThrow();
  });

  test('rejects a non-finite delta', () => {
    expect(() => buildWalletAdjustment('e1', NaN)).toThrow();
  });
});
