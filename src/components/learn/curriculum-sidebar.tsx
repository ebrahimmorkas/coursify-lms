import Link from "next/link";
import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import type { CourseDetail } from "@/lib/queries/courses";
import { cn, formatDuration, percentage } from "@/lib/utils";

export function CurriculumSidebar({
  course,
  currentLessonId,
  completedIds,
  hasFullAccess,
}: {
  course: CourseDetail;
  currentLessonId: string;
  completedIds: Set<string>;
  hasFullAccess: boolean;
}) {
  const progress = percentage(completedIds.size, course.lessonCount);

  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <Link
          href={`/courses/${course.slug}`}
          className="line-clamp-2 font-semibold text-slate-900 hover:text-brand-700"
        >
          {course.title}
        </Link>
        {hasFullAccess && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-slate-600">
              <span>
                {completedIds.size} of {course.lessonCount} complete
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto" aria-label="Course curriculum">
        {course.sections.map((section) => (
          <div key={section.id}>
            <p className="bg-slate-50 px-5 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {section.title}
            </p>
            <ul>
              {section.lessons.map((lesson) => {
                const locked = !hasFullAccess && !lesson.isPreview;
                const done = completedIds.has(lesson.id);
                const active = lesson.id === currentLessonId;
                const Icon = locked ? Lock : done ? CheckCircle2 : active ? PlayCircle : Circle;

                const inner = (
                  <>
                    <Icon
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        done ? "text-emerald-500" : active ? "text-brand-600" : "text-slate-400",
                      )}
                      aria-hidden
                    />
                    <span className="flex-1">{lesson.title}</span>
                    <span className="text-xs text-slate-400">
                      {formatDuration(lesson.durationMinutes)}
                    </span>
                  </>
                );

                return (
                  <li key={lesson.id}>
                    {locked ? (
                      <span className="flex gap-3 px-5 py-2.5 text-sm text-slate-400">{inner}</span>
                    ) : (
                      <Link
                        href={`/learn/${course.slug}/${lesson.id}`}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex gap-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50",
                          active && "bg-brand-50 font-medium text-brand-700 hover:bg-brand-50",
                        )}
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
