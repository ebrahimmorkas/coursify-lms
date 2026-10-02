"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, count, eq, gt, like, lt, desc, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { courses, lessons, sections } from "@/db/schema";
import { requireInstructor } from "@/lib/auth/guards";
import type { SessionUser } from "@/lib/auth/session";
import { bumpCacheVersion } from "@/lib/cache";
import { CATALOG_CACHE_NAMESPACE } from "@/lib/queries/courses";
import { slugify } from "@/lib/utils";
import type { FormState } from "@/lib/validations/auth";
import { courseSchema, lessonSchema, sectionSchema } from "@/lib/validations/course";

const uuid = z.uuid();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Throws unless the course exists and belongs to the user. Never trust IDs sent by the client. */
async function assertCourseOwner(courseId: string, user: SessionUser) {
  if (!uuid.safeParse(courseId).success) throw new Error("Course not found");
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.instructorId, user.id)),
    columns: { id: true, slug: true, status: true },
  });
  if (!course) throw new Error("Course not found");
  return course;
}

async function assertSectionOwner(sectionId: string, user: SessionUser) {
  if (!uuid.safeParse(sectionId).success) throw new Error("Section not found");
  const [row] = await db
    .select({ id: sections.id, courseId: sections.courseId, position: sections.position })
    .from(sections)
    .innerJoin(courses, eq(sections.courseId, courses.id))
    .where(and(eq(sections.id, sectionId), eq(courses.instructorId, user.id)))
    .limit(1);
  if (!row) throw new Error("Section not found");
  return row;
}

async function assertLessonOwner(lessonId: string, user: SessionUser) {
  if (!uuid.safeParse(lessonId).success) throw new Error("Lesson not found");
  const [row] = await db
    .select({
      id: lessons.id,
      courseId: lessons.courseId,
      sectionId: lessons.sectionId,
      position: lessons.position,
    })
    .from(lessons)
    .innerJoin(courses, eq(lessons.courseId, courses.id))
    .where(and(eq(lessons.id, lessonId), eq(courses.instructorId, user.id)))
    .limit(1);
  if (!row) throw new Error("Lesson not found");
  return row;
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || "course";
  const taken = await db
    .select({ slug: courses.slug })
    .from(courses)
    .where(like(courses.slug, `${base}%`));
  const existing = new Set(taken.map((row) => row.slug));
  if (!existing.has(base)) return base;
  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}

/** Public pages are cached, so every change that affects them invalidates the catalog cache. */
async function afterCourseChange(courseId: string) {
  await bumpCacheVersion(CATALOG_CACHE_NAMESPACE);
  revalidatePath(`/studio/courses/${courseId}`);
  revalidatePath("/studio");
}

function formErrors(error: z.ZodError, fields: Record<string, string>): FormState {
  return { errors: z.flattenError(error).fieldErrors, fields };
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export async function createCourse(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireInstructor();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = courseSchema.safeParse(raw);
  if (!parsed.success) return formErrors(parsed.error, raw);

  const { price, ...data } = parsed.data;
  const [course] = await db
    .insert(courses)
    .values({
      ...data,
      priceCents: price,
      instructorId: user.id,
      slug: await uniqueSlug(data.title),
    })
    .returning({ id: courses.id });

  revalidatePath("/studio");
  redirect(`/studio/courses/${course!.id}`);
}

export async function updateCourse(
  courseId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireInstructor();
  await assertCourseOwner(courseId, user);

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = courseSchema.safeParse(raw);
  if (!parsed.success) return formErrors(parsed.error, raw);

  const { price, ...data } = parsed.data;
  // The slug is intentionally not regenerated so published URLs stay stable.
  await db
    .update(courses)
    .set({ ...data, priceCents: price })
    .where(eq(courses.id, courseId));

  await afterCourseChange(courseId);
  return { success: true, message: "Course details saved." };
}

export async function setCourseStatus(courseId: string, status: "draft" | "published") {
  const user = await requireInstructor();
  await assertCourseOwner(courseId, user);

  if (status === "published") {
    const [{ value: lessonCount }] = await db
      .select({ value: count() })
      .from(lessons)
      .where(eq(lessons.courseId, courseId));
    if (lessonCount === 0) {
      return { error: "Add at least one lesson before publishing." };
    }
  }

  await db
    .update(courses)
    .set({ status, ...(status === "published" && { publishedAt: new Date() }) })
    .where(eq(courses.id, courseId));

  await afterCourseChange(courseId);
  return { error: null };
}

export async function deleteCourse(courseId: string) {
  const user = await requireInstructor();
  await assertCourseOwner(courseId, user);
  await db.delete(courses).where(eq(courses.id, courseId));
  await bumpCacheVersion(CATALOG_CACHE_NAMESPACE);
  revalidatePath("/studio");
  redirect("/studio?deleted=1");
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export async function addSection(courseId: string, formData: FormData) {
  const user = await requireInstructor();
  await assertCourseOwner(courseId, user);
  const parsed = sectionSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return;

  const [{ value: last }] = await db
    .select({ value: max(sections.position) })
    .from(sections)
    .where(eq(sections.courseId, courseId));

  await db
    .insert(sections)
    .values({ courseId, title: parsed.data.title, position: (last ?? -1) + 1 });
  await afterCourseChange(courseId);
}

export async function renameSection(sectionId: string, formData: FormData) {
  const user = await requireInstructor();
  const section = await assertSectionOwner(sectionId, user);
  const parsed = sectionSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return;

  await db.update(sections).set({ title: parsed.data.title }).where(eq(sections.id, sectionId));
  await afterCourseChange(section.courseId);
}

export async function deleteSection(sectionId: string) {
  const user = await requireInstructor();
  const section = await assertSectionOwner(sectionId, user);
  await db.delete(sections).where(eq(sections.id, sectionId));
  await afterCourseChange(section.courseId);
}

export async function moveSection(sectionId: string, direction: "up" | "down") {
  const user = await requireInstructor();
  const section = await assertSectionOwner(sectionId, user);

  const [neighbour] = await db
    .select({ id: sections.id, position: sections.position })
    .from(sections)
    .where(
      and(
        eq(sections.courseId, section.courseId),
        direction === "up"
          ? lt(sections.position, section.position)
          : gt(sections.position, section.position),
      ),
    )
    .orderBy(direction === "up" ? desc(sections.position) : asc(sections.position))
    .limit(1);
  if (!neighbour) return;

  await db.transaction(async (tx) => {
    await tx
      .update(sections)
      .set({ position: neighbour.position })
      .where(eq(sections.id, section.id));
    await tx
      .update(sections)
      .set({ position: section.position })
      .where(eq(sections.id, neighbour.id));
  });
  await afterCourseChange(section.courseId);
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export async function addLesson(sectionId: string, formData: FormData) {
  const user = await requireInstructor();
  const section = await assertSectionOwner(sectionId, user);
  const title = z.string().trim().min(2).max(120).safeParse(formData.get("title"));
  if (!title.success) return;

  const [{ value: last }] = await db
    .select({ value: max(lessons.position) })
    .from(lessons)
    .where(eq(lessons.sectionId, sectionId));

  const [lesson] = await db
    .insert(lessons)
    .values({
      sectionId,
      courseId: section.courseId,
      title: title.data,
      position: (last ?? -1) + 1,
    })
    .returning({ id: lessons.id });

  await afterCourseChange(section.courseId);
  redirect(`/studio/courses/${section.courseId}/lessons/${lesson!.id}`);
}

export async function updateLesson(
  lessonId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireInstructor();
  const lesson = await assertLessonOwner(lessonId, user);

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = lessonSchema.safeParse(raw);
  if (!parsed.success) return formErrors(parsed.error, raw);

  await db.update(lessons).set(parsed.data).where(eq(lessons.id, lessonId));
  await afterCourseChange(lesson.courseId);
  return { success: true, message: "Lesson saved." };
}

export async function deleteLesson(lessonId: string) {
  const user = await requireInstructor();
  const lesson = await assertLessonOwner(lessonId, user);
  await db.delete(lessons).where(eq(lessons.id, lessonId));
  await afterCourseChange(lesson.courseId);
  redirect(`/studio/courses/${lesson.courseId}`);
}

export async function moveLesson(lessonId: string, direction: "up" | "down") {
  const user = await requireInstructor();
  const lesson = await assertLessonOwner(lessonId, user);

  const [neighbour] = await db
    .select({ id: lessons.id, position: lessons.position })
    .from(lessons)
    .where(
      and(
        eq(lessons.sectionId, lesson.sectionId),
        direction === "up"
          ? lt(lessons.position, lesson.position)
          : gt(lessons.position, lesson.position),
      ),
    )
    .orderBy(direction === "up" ? desc(lessons.position) : asc(lessons.position))
    .limit(1);
  if (!neighbour) return;

  await db.transaction(async (tx) => {
    await tx.update(lessons).set({ position: neighbour.position }).where(eq(lessons.id, lesson.id));
    await tx.update(lessons).set({ position: lesson.position }).where(eq(lessons.id, neighbour.id));
  });
  await afterCourseChange(lesson.courseId);
}
