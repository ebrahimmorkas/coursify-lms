import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { Award, ChevronLeft, ChevronRight, PartyPopper } from "lucide-react";
import { CurriculumSidebar } from "@/components/learn/curriculum-sidebar";
import { LessonContent } from "@/components/learn/lesson-content";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { db } from "@/db";
import { enrollments } from "@/db/schema";
import { getAdjacentLessons } from "@/lib/curriculum";
import { getLesson } from "@/lib/queries/learn";
import { toEmbedUrl } from "@/lib/video";
import { setLessonComplete } from "../../actions";
import { loadLearningContext } from "../load";

export const metadata: Metadata = { title: "Learning", robots: { index: false } };

export default async function LessonPage(props: PageProps<"/learn/[slug]/[lessonId]">) {
  const { slug, lessonId } = await props.params;
  const { welcome } = await props.searchParams;
  const { course, enrollment, completedIds, lessons, hasFullAccess } =
    await loadLearningContext(slug);

  const { previous, next, index } = getAdjacentLessons(lessons, lessonId);
  if (index === -1) notFound();

  const outline = lessons[index]!;
  if (!hasFullAccess && !outline.isPreview) redirect(`/courses/${course.slug}`);

  const lesson = await getLesson(lessonId, course.id);
  if (!lesson) notFound();

  // Remember where the learner is so "Continue" resumes here.
  if (enrollment && enrollment.lastLessonId !== lesson.id) {
    await db
      .update(enrollments)
      .set({ lastLessonId: lesson.id })
      .where(and(eq(enrollments.id, enrollment.id)));
  }

  const embedUrl = toEmbedUrl(lesson.videoUrl);
  const isDone = completedIds.has(lesson.id);
  const courseComplete = Boolean(enrollment?.completedAt);

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[320px_1fr]">
      <div className="hidden lg:block">
        <div className="sticky top-16 h-[calc(100vh-4rem)]">
          <CurriculumSidebar
            course={course}
            currentLessonId={lesson.id}
            completedIds={completedIds}
            hasFullAccess={hasFullAccess}
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8">
        {welcome && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <PartyPopper className="size-5" aria-hidden />
            Welcome to {course.title}! Your progress is saved automatically.
          </div>
        )}

        {!hasFullAccess && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-700">
            <span>You are watching a free preview lesson.</span>
            <Link href={`/courses/${course.slug}`} className={buttonVariants({ size: "sm" })}>
              Enroll to unlock all lessons
            </Link>
          </div>
        )}

        {courseComplete && enrollment && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <span className="flex items-center gap-2">
              <Award className="size-5" aria-hidden /> You completed this course. Congratulations!
            </span>
            <Link
              href={`/certificates/${enrollment.id}`}
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              View certificate
            </Link>
          </div>
        )}

        <p className="text-sm text-slate-500">
          Lesson {index + 1} of {lessons.length}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{lesson.title}</h1>

        {embedUrl && (
          <div className="mt-6 aspect-video overflow-hidden rounded-xl bg-slate-900 shadow-lg">
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="size-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}

        <div className="mt-6">
          <LessonContent content={lesson.content} />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
          {previous ? (
            <Link
              href={`/learn/${course.slug}/${previous.id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              <ChevronLeft className="size-4" aria-hidden /> Previous
            </Link>
          ) : (
            <span />
          )}

          <div className="flex flex-wrap gap-2">
            {enrollment && (
              <form
                action={setLessonComplete.bind(
                  null,
                  lesson.id,
                  !isDone,
                  isDone ? null : (next?.id ?? null),
                )}
              >
                <SubmitButton variant={isDone ? "outline" : "primary"} pendingText="Saving…">
                  {isDone ? "Mark as incomplete" : next ? "Complete & continue" : "Complete course"}
                </SubmitButton>
              </form>
            )}
            {next && (isDone || !enrollment) && (
              <Link
                href={`/learn/${course.slug}/${next.id}`}
                className={buttonVariants({ variant: "secondary" })}
              >
                Next <ChevronRight className="size-4" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
