import Stripe from "stripe";
import type { CheckoutRequest, PaymentProvider } from "./types";

export class StripePaymentProvider implements PaymentProvider {
  readonly name = "stripe" as const;
  readonly stripe: Stripe;

  constructor(
    secretKey: string,
    private readonly appUrl: string,
  ) {
    this.stripe = new Stripe(secretKey);
  }

  async createCheckout({ orderId, amountCents, course, customerEmail }: CheckoutRequest) {
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      client_reference_id: orderId,
      metadata: { orderId },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: { name: course.title, description: course.subtitle || undefined },
          },
        },
      ],
      success_url: `${this.appUrl}/checkout/success?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.appUrl}/courses/${course.slug}?checkout=cancelled`,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url, sessionId: session.id };
  }
}
