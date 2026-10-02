"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, orders } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { getCache } from "@/lib/cache";
import { canAccessCourse, enrollFree } from "@/lib/enrollment";
import { getPaymentProvider } from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";

export async function enroll(courseId: string) {
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.status, "published")),
  });
  if (!course) redirect("/courses");

  const user = await requireUser(`/courses/${course.slug}`);
  const learnUrl = `/learn/${course.slug}`;

  if (await canAccessCourse(user.id, course)) redirect(learnUrl);

  if (course.priceCents === 0) {
    await enrollFree(user.id, course.id);
    redirect(`${learnUrl}?welcome=1`);
  }

  const limit = await rateLimit(getCache(), {
    key: `checkout:${user.id}`,
    limit: 10,
    windowSeconds: 60 * 10,
  });
  if (!limit.success) redirect(`/courses/${course.slug}?checkout=rate-limited`);

  // Reuse an open order instead of creating a new one on every click.
  const provider = getPaymentProvider();
  let order = await db.query.orders.findFirst({
    where: and(
      eq(orders.userId, user.id),
      eq(orders.courseId, course.id),
      eq(orders.status, "pending"),
      eq(orders.provider, provider.name),
    ),
  });
  order ??= (
    await db
      .insert(orders)
      .values({
        userId: user.id,
        courseId: course.id,
        amountCents: course.priceCents,
        provider: provider.name,
      })
      .returning()
  )[0]!;

  const checkout = await provider.createCheckout({
    orderId: order.id,
    amountCents: order.amountCents,
    course,
    customerEmail: user.email,
  });

  await db
    .update(orders)
    .set({ providerSessionId: checkout.sessionId })
    .where(eq(orders.id, order.id));

  redirect(checkout.url);
}
