import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreditCard, FlaskConical, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireUser } from "@/lib/auth/guards";
import { getOrderForUser } from "@/lib/enrollment";
import { formatPrice } from "@/lib/utils";
import { payDemoOrder } from "../../actions";

export const metadata: Metadata = { title: "Checkout" };

export default async function DemoCheckoutPage(props: PageProps<"/checkout/demo/[orderId]">) {
  const { orderId } = await props.params;
  const user = await requireUser();
  const row = await getOrderForUser(orderId, user.id).catch(() => null);

  if (!row || row.order.provider !== "demo") notFound();
  if (row.order.status === "paid") redirect(`/checkout/success?order=${row.order.id}`);

  const { order, course } = row;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <FlaskConical className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p>
          <strong>Demo checkout.</strong> Stripe is not configured, so this page simulates a
          successful payment. No card details are collected and no money is charged.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5 text-brand-600" aria-hidden /> Complete your purchase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
            <div>
              <p className="font-medium text-slate-900">{course.title}</p>
              <p className="text-sm text-slate-500">Lifetime access</p>
            </div>
            <p className="text-lg font-bold text-slate-900">{formatPrice(order.amountCents)}</p>
          </div>

          <fieldset disabled className="space-y-3 opacity-70">
            <div className="space-y-1.5">
              <Label htmlFor="card">Card number</Label>
              <Input id="card" value="4242 4242 4242 4242" readOnly />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input aria-label="Expiry" value="12 / 34" readOnly />
              <Input aria-label="CVC" value="123" readOnly />
            </div>
          </fieldset>

          <form action={payDemoOrder.bind(null, order.id)}>
            <SubmitButton size="lg" className="w-full" pendingText="Processing…">
              <Lock className="size-4" aria-hidden /> Pay {formatPrice(order.amountCents)}
            </SubmitButton>
          </form>

          <Link
            href={`/courses/${course.slug}`}
            className="block text-center text-sm text-slate-500 hover:text-slate-700"
          >
            Cancel and return to the course
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
