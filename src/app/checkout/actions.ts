"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { fulfillOrder, getOrderForUser } from "@/lib/enrollment";

/** Completes a demo-mode order. Only valid for the signed-in buyer's own demo orders. */
export async function payDemoOrder(orderId: string) {
  const user = await requireUser();
  const row = await getOrderForUser(orderId, user.id);

  if (!row || row.order.provider !== "demo") redirect("/dashboard");
  if (row.order.status === "pending") await fulfillOrder(row.order.id);

  redirect(`/checkout/success?order=${row.order.id}`);
}
