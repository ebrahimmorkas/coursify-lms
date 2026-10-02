import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments, orders } from "@/db/schema";
import { bumpCacheVersion } from "@/lib/cache";
import { CATALOG_CACHE_NAMESPACE } from "@/lib/queries/courses";

export async function isEnrolled(userId: string, courseId: string) {
  const row = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
    columns: { id: true },
  });
  return Boolean(row);
}

/** Learners and the course's own instructor can access the lessons. */
export async function canAccessCourse(
  userId: string,
  course: { id: string; instructorId: string },
) {
  return course.instructorId === userId || (await isEnrolled(userId, course.id));
}

export async function enrollFree(userId: string, courseId: string) {
  await db
    .insert(enrollments)
    .values({ userId, courseId, pricePaidCents: 0 })
    .onConflictDoNothing({ target: [enrollments.userId, enrollments.courseId] });
  await bumpCacheVersion(CATALOG_CACHE_NAMESPACE);
}

/**
 * Marks an order as paid and enrolls the buyer.
 *
 * Idempotent: Stripe may deliver the same webhook more than once, and the success
 * page may also try to fulfil the order. The conditional update guarantees the
 * order transitions pending → paid exactly once, and the enrollment insert ignores
 * duplicates.
 */
export async function fulfillOrder(orderId: string) {
  const fulfilled = await db.transaction(async (tx) => {
    const [order] = await tx
      .update(orders)
      .set({ status: "paid", paidAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.status, "pending")))
      .returning();

    if (!order) return false;

    await tx
      .insert(enrollments)
      .values({ userId: order.userId, courseId: order.courseId, pricePaidCents: order.amountCents })
      .onConflictDoNothing({ target: [enrollments.userId, enrollments.courseId] });
    return true;
  });

  if (fulfilled) await bumpCacheVersion(CATALOG_CACHE_NAMESPACE);
  return fulfilled;
}

export async function markOrderFailed(orderId: string) {
  await db
    .update(orders)
    .set({ status: "failed" })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending")));
}

export async function getOrderForUser(orderId: string, userId: string) {
  const [row] = await db
    .select({
      order: orders,
      course: {
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        subtitle: courses.subtitle,
      },
    })
    .from(orders)
    .innerJoin(courses, eq(orders.courseId, courses.id))
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);
  return row ?? null;
}
