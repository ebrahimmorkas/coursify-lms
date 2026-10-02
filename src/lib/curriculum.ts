/** Pure helpers for navigating a course curriculum (shared by pages and tests). */

type LessonRef = { id: string };
type SectionRef<L extends LessonRef> = { lessons: L[] };

export function flattenLessons<L extends LessonRef>(sections: SectionRef<L>[]): L[] {
  return sections.flatMap((section) => section.lessons);
}

export function getAdjacentLessons<L extends LessonRef>(lessons: L[], lessonId: string) {
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index === -1) return { previous: null, next: null, index: -1 };
  return {
    previous: lessons[index - 1] ?? null,
    next: lessons[index + 1] ?? null,
    index,
  };
}

/**
 * Where a learner should land when opening a course: the lesson they last viewed,
 * otherwise the first lesson they have not completed, otherwise the first lesson.
 */
export function resumeLesson<L extends LessonRef>(
  lessons: L[],
  completedIds: Set<string>,
  lastLessonId: string | null,
): L | null {
  if (lastLessonId) {
    const last = lessons.find((lesson) => lesson.id === lastLessonId);
    if (last) return last;
  }
  return lessons.find((lesson) => !completedIds.has(lesson.id)) ?? lessons[0] ?? null;
}
