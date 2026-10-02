import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/db";
import { courses, enrollments, orders, users } from "@/db/schema";
import { enrollFree, fulfillOrder, isEnrolled } from "./enrollment";

const run = randomUUID().slice(0, 8);
let instructorId: string;
let studentId: string;
let courseId: string;

beforeAll(async () => {
  const [instructor, student] = await db
    .insert(users)
    .values([
      {
        name: "Int Instructor",
        email: `instructor-${run}@test.dev`,
        passwordHash: "x",
        role: "instructor",
      },
      { name: "Int Student", email: `student-${run}@test.dev`, passwordHash: "x" },
    ])
    .returning();
  instructorId = instructor!.id;
  studentId = student!.id;

  const [course] = await db
    .insert(courses)
    .values({
      instructorId,
      title: "Integration Course",
      slug: `integration-course-${run}`,
      category: "Web Development",
      priceCents: 2500,
      status: "published",
    })
    .returning();
  courseId = course!.id;
});

afterAll(async () => {
  // Cascades remove the course, orders and enrollments.
  await db.delete(users).where(inArray(users.id, [instructorId, studentId]));
});

describe("fulfillOrder", () => {
  it("is idempotent under concurrent deliveries", async () => {
    const [order] = await db
      .insert(orders)
      .values({ userId: studentId, courseId, amountCents: 2500, provider: "demo" })
      .returning();

    // Simulates Stripe delivering the same webhook several times at once.
    const results = await Promise.all([1, 2, 3].map(() => fulfillOrder(order!.id)));

    expect(results.filter(Boolean)).toHaveLength(1);

    const saved = await db.query.orders.findFirst({ where: eq(orders.id, order!.id) });
    expect(saved?.status).toBe("paid");
    expect(saved?.paidAt).toBeInstanceOf(Date);

    const rows = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, studentId), eq(enrollments.courseId, courseId)));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.pricePaidCents).toBe(2500);
  });

  it("ignores unknown or already-paid orders", async () => {
    expect(await fulfillOrder(randomUUID())).toBe(false);
  });
});

describe("enrollFree", () => {
  it("does not create duplicate enrollments", async () => {
    await db.delete(enrollments).where(eq(enrollments.userId, studentId));
    await Promise.all([enrollFree(studentId, courseId), enrollFree(studentId, courseId)]);

    expect(await isEnrolled(studentId, courseId)).toBe(true);
    const rows = await db.select().from(enrollments).where(eq(enrollments.userId, studentId));
    expect(rows).toHaveLength(1);
  });
});
