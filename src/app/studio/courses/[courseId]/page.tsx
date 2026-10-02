import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ConfirmDelete } from "@/components/studio/confirm-delete";
import { CourseForm } from "@/components/studio/course-form";
import { CurriculumEditor } from "@/components/studio/curriculum-editor";
import { PublishPanel } from "@/components/studio/publish-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireInstructor } from "@/lib/auth/guards";
import { getCourseForEditing } from "@/lib/queries/studio";
import { deleteCourse, updateCourse } from "../../actions";

export const metadata: Metadata = { title: "Edit course" };

export default async function EditCoursePage(props: PageProps<"/studio/courses/[courseId]">) {
  const { courseId } = await props.params;
  const user = await requireInstructor();
  const course = await getCourseForEditing(courseId, user.id).catch(() => null);
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/studio"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ChevronLeft className="size-4" aria-hidden /> All courses
      </Link>
      <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              <CurriculumEditor course={course} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course details</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseForm
                action={updateCourse.bind(null, course.id)}
                submitLabel="Save changes"
                defaultValues={course}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent>
              <PublishPanel courseId={course.id} slug={course.slug} status={course.status} />
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Danger zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Deleting a course removes its lessons, enrollments and reviews. This cannot be
                undone.
              </p>
              <ConfirmDelete label="Delete course" onConfirm={deleteCourse.bind(null, course.id)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
