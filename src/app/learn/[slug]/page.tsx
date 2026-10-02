import { redirect } from "next/navigation";
import { resumeLesson } from "@/lib/curriculum";
import { loadLearningContext } from "./load";

/** Entry point for a course: sends the learner to the right lesson. */
export default async function LearnCoursePage(props: PageProps<"/learn/[slug]">) {
  const { slug } = await props.params;
  const { welcome } = await props.searchParams;
  const { course, enrollment, completedIds, lessons, hasFullAccess } =
    await loadLearningContext(slug);

  if (!hasFullAccess) redirect(`/courses/${course.slug}`);

  const lesson = resumeLesson(lessons, completedIds, enrollment?.lastLessonId ?? null);
  if (!lesson) redirect(`/courses/${course.slug}`);

  redirect(`/learn/${course.slug}/${lesson.id}${welcome ? "?welcome=1" : ""}`);
}
