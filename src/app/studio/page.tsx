import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Presentation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireInstructor } from "@/lib/auth/guards";
import { getInstructorCourses } from "@/lib/queries/studio";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Instructor studio" };

export default async function StudioPage() {
  const user = await requireInstructor();
  const courses = await getInstructorCourses(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your courses</h1>
          <p className="mt-1 text-slate-600">Create, edit and publish your courses.</p>
        </div>
        <Link href="/studio/courses/new" className={buttonVariants()}>
          <Plus className="size-4" aria-hidden /> New course
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={Presentation}
          title="You have not created any courses yet"
          description="Share what you know. Your first course is only a few minutes away."
          action={
            <Link href="/studio/courses/new" className={buttonVariants()}>
              Create your first course
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 text-right font-medium">Lessons</th>
                <th className="px-5 py-3 text-right font-medium">Students</th>
                <th className="px-5 py-3 text-right font-medium">Revenue</th>
                <th className="px-5 py-3 text-right font-medium">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link
                      href={`/studio/courses/${course.id}`}
                      className="font-medium text-slate-900 hover:text-brand-700"
                    >
                      {course.title}
                    </Link>
                    <p className="text-xs text-slate-500">{course.category}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={course.status === "published" ? "success" : "warning"}>
                      {course.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{formatPrice(course.priceCents)}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{course.lessonCount}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{course.studentCount}</td>
                  <td className="px-5 py-4 text-right text-slate-700">
                    {course.revenueCents === 0 ? "—" : formatPrice(course.revenueCents)}
                  </td>
                  <td className="px-5 py-4 text-right text-slate-700">
                    {course.avgRating > 0 ? course.avgRating.toFixed(1) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
