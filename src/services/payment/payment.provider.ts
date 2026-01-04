export interface PaymentResult {
  success: boolean;
  providerRef: string;
}

export interface PaymentProvider {
  charge(amount: number): Promise<PaymentResult>;
}
