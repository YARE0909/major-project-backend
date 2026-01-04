import { PaymentProvider } from "./payment.provider";

export class MockPaymentProvider implements PaymentProvider {
  async charge(amount: number) {
    return {
      success: true,
      providerRef: `MOCK_PAY_${Date.now()}`,
    };
  }
}
