import type Stripe from "stripe";
import { env } from "@/lib/env";
import { fulfillOrder, markOrderFailed } from "@/lib/enrollment";
import { getStripe } from "@/lib/payments";

/**
 * Stripe webhook endpoint. The signature is verified against the raw request body,
 * so only genuine events from Stripe can fulfil orders.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Stripe is not configured" }, { status: 404 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await request.text(),
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId && session.payment_status === "paid") await fulfillOrder(orderId);
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const orderId = event.data.object.metadata?.orderId;
      if (orderId) await markOrderFailed(orderId);
      break;
    }
  }

  return Response.json({ received: true });
}
