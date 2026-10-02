import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ConfirmDelete } from "@/components/studio/confirm-delete";
import { LessonForm } from "@/components/studio/lesson-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireInstructor } from "@/lib/auth/guards";
import { getLessonForEditing } from "@/lib/queries/studio";
import { deleteLesson, updateLesson } from "@/app/studio/actions";

export const metadata: Metadata = { title: "Edit lesson" };

export default async function EditLessonPage(
  props: PageProps<"/studio/courses/[courseId]/lessons/[lessonId]">,
) {
  const { lessonId } = await props.params;
  const user = await requireInstructor();
  const row = await getLessonForEditing(lessonId, user.id).catch(() => null);
  if (!row) notFound();

  const { lesson, courseTitle, courseId } = row;

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href={`/studio/courses/${courseId}`}
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ChevronLeft className="size-4" aria-hidden /> {courseTitle}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit lesson</CardTitle>
        </CardHeader>
        <CardContent>
          <LessonForm action={updateLesson.bind(null, lesson.id)} defaultValues={lesson} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-5">
        <p className="text-sm text-slate-600">Delete this lesson and its learner progress.</p>
        <ConfirmDelete label="Delete lesson" onConfirm={deleteLesson.bind(null, lesson.id)} />
      </div>
    </div>
  );
}
