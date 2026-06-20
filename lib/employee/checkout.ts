'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

type CheckoutWalletOnlyResponse = {
  orderId: string;
  walletApplied: number;
  remainder: 0;
  fullyPaidByWallet: true;
};

type CheckoutRazorpayResponse = {
  orderId: string;
  walletApplied: number;
  remainder: number;
  fullyPaidByWallet: false;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amountInPaise: number;
  currency: string;
};

export type CheckoutResponse = CheckoutWalletOnlyResponse | CheckoutRazorpayResponse;

export interface CheckoutPayload {
  shippingAddress: ShippingAddress;
  couponCode?: string;
}

export function useEmployeeCheckout() {
  const queryClient = useQueryClient();

  return useMutation<CheckoutResponse, Error, CheckoutPayload>({
    mutationFn: (payload) =>
      apiFetch<CheckoutResponse>('/employee/checkout', {
        method: 'POST',
        body: payload,
        tokenKey: 'employeeToken',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', 'cart'] });
      queryClient.invalidateQueries({ queryKey: ['employee', 'wallet'] });
    },
  });
}
