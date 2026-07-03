import { buildWalletAdjustment } from './employees';

describe('buildWalletAdjustment', () => {
  test('routes positive deltas to the credit endpoint', () => {
    expect(buildWalletAdjustment('e1', 100)).toEqual({
      path: '/company/employees/e1/wallet/credit',
      body: { amount: 100 },
    });
  });

  test('routes negative deltas to the debit endpoint with a positive amount', () => {
    expect(buildWalletAdjustment('e1', -100)).toEqual({
      path: '/company/employees/e1/wallet/debit',
      body: { amount: 100 },
    });
  });

  test('rejects a zero delta', () => {
    expect(() => buildWalletAdjustment('e1', 0)).toThrow();
  });

  test('rejects a non-finite delta', () => {
    expect(() => buildWalletAdjustment('e1', NaN)).toThrow();
  });
});
