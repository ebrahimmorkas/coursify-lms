import type { CheckoutRequest, PaymentProvider } from "./types";

/**
 * Used when Stripe is not configured. Sends the user to an in-app checkout page
 * that simulates a successful payment, so the purchase flow can be demoed end to end.
 */
export class DemoPaymentProvider implements PaymentProvider {
  readonly name = "demo" as const;

  async createCheckout({ orderId }: CheckoutRequest) {
    return { url: `/checkout/demo/${orderId}`, sessionId: `demo_${orderId}` };
  }
}
