import "server-only";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { flattenLessons } from "@/lib/curriculum";
import { getCourseBySlug } from "@/lib/queries/courses";
import { getCompletedLessonIds, getEnrollment } from "@/lib/queries/learn";

/** Loads everything the learning pages need and resolves the user's access level. */
export async function loadLearningContext(slug: string) {
  const user = await requireUser(`/learn/${slug}`);
  const course = await getCourseBySlug(slug);

  const isOwner = course?.instructorId === user.id;
  if (!course || (course.status !== "published" && !isOwner)) notFound();

  const [enrollment, completedIds] = await Promise.all([
    getEnrollment(user.id, course.id),
    getCompletedLessonIds(user.id, course.id),
  ]);

  return {
    user,
    course,
    enrollment,
    completedIds,
    lessons: flattenLessons(course.sections),
    hasFullAccess: isOwner || Boolean(enrollment),
    isOwner,
  };
}
