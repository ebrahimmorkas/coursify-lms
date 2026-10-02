import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, Pencil, PlayCircle, Plus, Trash2 } from "lucide-react";
import {
  addLesson,
  addSection,
  deleteSection,
  moveLesson,
  moveSection,
  renameSection,
} from "@/app/studio/actions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { EditableCourse } from "@/lib/queries/studio";
import { formatDuration } from "@/lib/utils";

const iconButton =
  "rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30";

/**
 * Server-rendered curriculum editor. Every control is a small form bound to a
 * Server Action, so it works without client-side JavaScript.
 */
export function CurriculumEditor({ course }: { course: EditableCourse }) {
  return (
    <div className="space-y-4">
      {course.sections.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No sections yet. Add your first section below.
        </p>
      )}

      {course.sections.map((section, sectionIndex) => (
        <div key={section.id} className="rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
            <span className="text-xs font-semibold text-slate-500">Section {sectionIndex + 1}</span>
            <form action={renameSection.bind(null, section.id)} className="flex flex-1 gap-2">
              <Input
                name="title"
                defaultValue={section.title}
                aria-label="Section title"
                className="h-8 min-w-40 flex-1 bg-white"
                required
              />
              <SubmitButton size="sm" variant="outline">
                Rename
              </SubmitButton>
            </form>
            <div className="flex items-center">
              <form action={moveSection.bind(null, section.id, "up")}>
                <button className={iconButton} disabled={sectionIndex === 0} aria-label="Move up">
                  <ArrowUp className="size-4" />
                </button>
              </form>
              <form action={moveSection.bind(null, section.id, "down")}>
                <button
                  className={iconButton}
                  disabled={sectionIndex === course.sections.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-4" />
                </button>
              </form>
              <form action={deleteSection.bind(null, section.id)}>
                <button
                  className={iconButton}
                  aria-label="Delete section"
                  title="Delete section and its lessons"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>
          </div>

          <ul className="divide-y divide-slate-100">
            {section.lessons.map((lesson, lessonIndex) => (
              <li key={lesson.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <PlayCircle className="size-4 shrink-0 text-slate-400" aria-hidden />
                <span className="flex-1 truncate text-slate-800">{lesson.title}</span>
                {lesson.isPreview && (
                  <Badge tone="brand">
                    <Eye className="mr-1 size-3" aria-hidden /> Preview
                  </Badge>
                )}
                <span className="text-xs text-slate-500">
                  {formatDuration(lesson.durationMinutes)}
                </span>
                <form action={moveLesson.bind(null, lesson.id, "up")}>
                  <button className={iconButton} disabled={lessonIndex === 0} aria-label="Move up">
                    <ArrowUp className="size-4" />
                  </button>
                </form>
                <form action={moveLesson.bind(null, lesson.id, "down")}>
                  <button
                    className={iconButton}
                    disabled={lessonIndex === section.lessons.length - 1}
                    aria-label="Move down"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </form>
                <Link
                  href={`/studio/courses/${course.id}/lessons/${lesson.id}`}
                  className={iconButton}
                  aria-label={`Edit ${lesson.title}`}
                >
                  <Pencil className="size-4" />
                </Link>
              </li>
            ))}
          </ul>

          <form
            action={addLesson.bind(null, section.id)}
            className="flex gap-2 border-t border-slate-100 px-4 py-3"
          >
            <Input
              name="title"
              placeholder="New lesson title"
              aria-label="New lesson title"
              className="h-8"
              required
              minLength={2}
            />
            <SubmitButton size="sm" variant="secondary">
              <Plus className="size-4" aria-hidden /> Lesson
            </SubmitButton>
          </form>
        </div>
      ))}

      <form
        action={addSection.bind(null, course.id)}
        className="flex gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-4"
      >
        <Input
          name="title"
          placeholder="New section title, e.g. Getting started"
          aria-label="New section title"
          required
          minLength={2}
        />
        <SubmitButton>
          <Plus className="size-4" aria-hidden /> Add section
        </SubmitButton>
      </form>
    </div>
  );
}
