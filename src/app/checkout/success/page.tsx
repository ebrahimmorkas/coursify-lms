import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/guards";
import { fulfillOrder, getOrderForUser } from "@/lib/enrollment";
import { getStripe } from "@/lib/payments";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Payment complete" };

export default async function CheckoutSuccessPage(props: PageProps<"/checkout/success">) {
  const { order: orderId } = await props.searchParams;
  const user = await requireUser();
  if (typeof orderId !== "string") notFound();

  let row = await getOrderForUser(orderId, user.id).catch(() => null);
  if (!row) notFound();

  // The webhook is the source of truth, but it can arrive after the redirect (or not at all
  // in local development). Verify the session with Stripe directly as a fallback.
  const stripe = getStripe();
  if (row.order.status === "pending" && row.order.provider === "stripe" && stripe) {
    const session = await stripe.checkout.sessions.retrieve(row.order.providerSessionId!);
    if (session.payment_status === "paid" && session.metadata?.orderId === row.order.id) {
      await fulfillOrder(row.order.id);
      row = await getOrderForUser(orderId, user.id);
    }
  }

  const paid = row!.order.status === "paid";

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      {paid ? (
        <CheckCircle2 className="size-14 text-emerald-500" aria-hidden />
      ) : (
        <Clock className="size-14 text-amber-500" aria-hidden />
      )}
      <h1 className="mt-6 text-3xl font-bold text-slate-900">
        {paid ? "You're enrolled!" : "Payment processing"}
      </h1>
      <p className="mt-3 text-slate-600">
        {paid
          ? `Your payment of ${formatPrice(row!.order.amountCents)} for “${row!.course.title}” was successful.`
          : "We are confirming your payment. This usually takes a few seconds — refresh the page shortly."}
      </p>
      <div className="mt-8 flex gap-3">
        {paid && (
          <Link href={`/learn/${row!.course.slug}?welcome=1`} className={buttonVariants()}>
            Start learning
          </Link>
        )}
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
