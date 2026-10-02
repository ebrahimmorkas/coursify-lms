import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments, orders, users } from "@/db/schema";

export async function getLearnerEnrollments(userId: string) {
  return db
    .select({
      enrollmentId: enrollments.id,
      enrolledAt: enrollments.createdAt,
      completedAt: enrollments.completedAt,
      course: {
        id: courses.id,
        slug: courses.slug,
        title: courses.title,
        category: courses.category,
      },
      instructorName: users.name,
      totalLessons:
        sql<number>`(select count(*) from lessons l where l.course_id = "courses"."id")`.mapWith(
          Number,
        ),
      completedLessons: sql<number>`(
        select count(*) from lesson_progress p
        where p.course_id = "courses"."id" and p.user_id = ${userId}
      )`.mapWith(Number),
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(users, eq(courses.instructorId, users.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.createdAt));
}

export type LearnerEnrollment = Awaited<ReturnType<typeof getLearnerEnrollments>>[number];

export async function getLearnerOrders(userId: string) {
  return db
    .select({
      id: orders.id,
      amountCents: orders.amountCents,
      status: orders.status,
      provider: orders.provider,
      createdAt: orders.createdAt,
      courseTitle: courses.title,
      courseSlug: courses.slug,
    })
    .from(orders)
    .innerJoin(courses, eq(orders.courseId, courses.id))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(20);
}
