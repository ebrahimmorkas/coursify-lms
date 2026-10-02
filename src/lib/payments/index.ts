import "server-only";
import { env } from "@/lib/env";
import { DemoPaymentProvider } from "./demo-provider";
import { StripePaymentProvider } from "./stripe-provider";
import type { PaymentProvider } from "./types";

const globalForPayments = globalThis as unknown as { paymentProvider?: PaymentProvider };

/** Stripe when `STRIPE_SECRET_KEY` is set, otherwise the built-in demo checkout. */
export function getPaymentProvider(): PaymentProvider {
  globalForPayments.paymentProvider ??= env.STRIPE_SECRET_KEY
    ? new StripePaymentProvider(env.STRIPE_SECRET_KEY, env.NEXT_PUBLIC_APP_URL)
    : new DemoPaymentProvider();
  return globalForPayments.paymentProvider;
}

export function getStripe() {
  const provider = getPaymentProvider();
  return provider instanceof StripePaymentProvider ? provider.stripe : null;
}
