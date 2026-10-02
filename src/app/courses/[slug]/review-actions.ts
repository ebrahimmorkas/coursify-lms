"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { courses, reviews } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { bumpCacheVersion } from "@/lib/cache";
import { isEnrolled } from "@/lib/enrollment";
import { CATALOG_CACHE_NAMESPACE } from "@/lib/queries/courses";
import type { FormState } from "@/lib/validations/auth";
import { reviewSchema } from "@/lib/validations/review";

/** Creates or updates the signed-in learner's review. Only enrolled learners may review. */
export async function saveReview(
  courseId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    columns: { id: true, slug: true, instructorId: true },
  });
  if (!course) return { message: "Course not found." };
  if (course.instructorId === user.id) return { message: "You cannot review your own course." };
  if (!(await isEnrolled(user.id, course.id))) {
    return { message: "Enroll in this course to leave a review." };
  }

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, fields: raw };

  await db
    .insert(reviews)
    .values({ userId: user.id, courseId, ...parsed.data })
    .onConflictDoUpdate({
      target: [reviews.userId, reviews.courseId],
      set: { ...parsed.data, updatedAt: new Date() },
    });

  await bumpCacheVersion(CATALOG_CACHE_NAMESPACE);
  revalidatePath(`/courses/${course.slug}`);
  return { success: true, message: "Thanks! Your review has been saved." };
}
