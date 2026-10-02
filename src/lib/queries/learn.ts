import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments, lessonProgress, lessons, users } from "@/db/schema";

export async function getLesson(lessonId: string, courseId: string) {
  const lesson = await db.query.lessons.findFirst({
    where: and(eq(lessons.id, lessonId), eq(lessons.courseId, courseId)),
  });
  return lesson ?? null;
}

export async function getCompletedLessonIds(userId: string, courseId: string) {
  const rows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.courseId, courseId)));
  return new Set(rows.map((row) => row.lessonId));
}

export async function getEnrollment(userId: string, courseId: string) {
  const enrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
  });
  return enrollment ?? null;
}

export async function getCertificate(enrollmentId: string) {
  const [row] = await db
    .select({
      id: enrollments.id,
      completedAt: enrollments.completedAt,
      learnerName: users.name,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      instructorId: courses.instructorId,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.id, enrollmentId))
    .limit(1);

  if (!row?.completedAt) return null;

  const instructor = await db.query.users.findFirst({
    where: eq(users.id, row.instructorId),
    columns: { name: true },
  });

  return { ...row, completedAt: row.completedAt, instructorName: instructor?.name ?? "" };
}
