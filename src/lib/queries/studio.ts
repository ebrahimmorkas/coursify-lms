import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { courses, lessons, sections } from "@/db/schema";

export async function getInstructorCourses(instructorId: string) {
  return db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      category: courses.category,
      status: courses.status,
      priceCents: courses.priceCents,
      updatedAt: courses.updatedAt,
      lessonCount:
        sql<number>`(select count(*) from lessons l where l.course_id = ${courses.id})`.mapWith(
          Number,
        ),
      studentCount:
        sql<number>`(select count(*) from enrollments e where e.course_id = ${courses.id})`.mapWith(
          Number,
        ),
      revenueCents:
        sql<number>`(select coalesce(sum(e.price_paid_cents), 0) from enrollments e where e.course_id = ${courses.id})`.mapWith(
          Number,
        ),
      avgRating:
        sql<number>`(select coalesce(round(avg(r.rating)::numeric, 1), 0) from reviews r where r.course_id = ${courses.id})`.mapWith(
          Number,
        ),
    })
    .from(courses)
    .where(eq(courses.instructorId, instructorId))
    .orderBy(desc(courses.updatedAt));
}

/** Loads a course with its curriculum, scoped to the owning instructor. */
export async function getCourseForEditing(courseId: string, instructorId: string) {
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.instructorId, instructorId)),
    with: {
      sections: {
        orderBy: [asc(sections.position)],
        with: {
          lessons: {
            orderBy: [asc(lessons.position)],
            columns: {
              id: true,
              title: true,
              durationMinutes: true,
              isPreview: true,
              videoUrl: true,
            },
          },
        },
      },
    },
  });
  return course ?? null;
}

export type EditableCourse = NonNullable<Awaited<ReturnType<typeof getCourseForEditing>>>;

export async function getLessonForEditing(lessonId: string, instructorId: string) {
  const [row] = await db
    .select({ lesson: lessons, courseTitle: courses.title, courseId: courses.id })
    .from(lessons)
    .innerJoin(courses, eq(lessons.courseId, courses.id))
    .where(and(eq(lessons.id, lessonId), eq(courses.instructorId, instructorId)))
    .limit(1);
  return row ?? null;
}
