"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { courses, enrollments, lessonProgress, lessons } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";

/**
 * Marks a lesson as complete (or not) and keeps the enrollment's completion date in sync.
 * Optionally continues to the next lesson.
 */
export async function setLessonComplete(
  lessonId: string,
  completed: boolean,
  nextLessonId: string | null,
) {
  if (!z.uuid().safeParse(lessonId).success) return;
  const user = await requireUser();

  const [row] = await db
    .select({ courseId: lessons.courseId, slug: courses.slug })
    .from(lessons)
    .innerJoin(courses, eq(lessons.courseId, courses.id))
    .where(eq(lessons.id, lessonId))
    .limit(1);
  if (!row) return;

  const enrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, user.id), eq(enrollments.courseId, row.courseId)),
  });
  // Instructors previewing their own course do not have an enrollment to track.
  if (!enrollment) return;

  await db.transaction(async (tx) => {
    if (completed) {
      await tx
        .insert(lessonProgress)
        .values({ userId: user.id, lessonId, courseId: row.courseId })
        .onConflictDoNothing();
    } else {
      await tx
        .delete(lessonProgress)
        .where(and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lessonId)));
    }

    const [[{ value: total }], [{ value: done }]] = await Promise.all([
      tx.select({ value: count() }).from(lessons).where(eq(lessons.courseId, row.courseId)),
      tx
        .select({ value: count() })
        .from(lessonProgress)
        .where(and(eq(lessonProgress.userId, user.id), eq(lessonProgress.courseId, row.courseId))),
    ]);

    const isComplete = total > 0 && done >= total;
    await tx
      .update(enrollments)
      .set({ completedAt: isComplete ? (enrollment.completedAt ?? new Date()) : null })
      .where(eq(enrollments.id, enrollment.id));
  });

  revalidatePath(`/learn/${row.slug}`, "layout");
  revalidatePath("/dashboard");

  if (completed && nextLessonId) redirect(`/learn/${row.slug}/${nextLessonId}`);
}
