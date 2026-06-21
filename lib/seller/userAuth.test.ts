import * as m from './userAuth';

test('exports four seller auth hooks', () => {
  ['useSellerApply','useSellerLogin','useSellerForgotPassword','useSellerResetPassword']
    .forEach((k) => expect(typeof (m as Record<string, unknown>)[k]).toBe('function'));
});
