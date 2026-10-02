export type CheckoutRequest = {
  orderId: string;
  amountCents: number;
  course: { title: string; subtitle: string; slug: string };
  customerEmail: string;
};

export type CheckoutSession = {
  /** Where the browser should be sent to complete payment. */
  url: string;
  /** Provider reference stored on the order (Stripe session id or demo id). */
  sessionId: string;
};

export interface PaymentProvider {
  readonly name: "stripe" | "demo";
  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;
}
