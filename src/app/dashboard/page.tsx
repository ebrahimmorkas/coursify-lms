import type { Metadata } from "next";
import Link from "next/link";
import { Award, BookOpen, Receipt } from "lucide-react";
import { CourseCover } from "@/components/courses/course-cover";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/guards";
import { getLearnerEnrollments, getLearnerOrders } from "@/lib/queries/learner";
import { formatPrice, percentage } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const [enrollments, orders] = await Promise.all([
    getLearnerEnrollments(user.id),
    getLearnerOrders(user.id),
  ]);

  const completed = enrollments.filter((enrollment) => enrollment.completedAt).length;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-slate-600">
          {enrollments.length > 0
            ? `You are enrolled in ${enrollments.length} ${enrollments.length === 1 ? "course" : "courses"} and have completed ${completed}.`
            : "Pick up where you left off."}
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">My learning</h2>
        {enrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="You are not enrolled in any courses yet"
            description="Browse the catalog to find your next course."
            action={
              <Link href="/courses" className={buttonVariants()}>
                Browse courses
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => {
              const progress = percentage(enrollment.completedLessons, enrollment.totalLessons);
              return (
                <div
                  key={enrollment.enrollmentId}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <CourseCover
                    slug={enrollment.course.slug}
                    category={enrollment.course.category}
                    title={enrollment.course.title}
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-semibold text-slate-900">{enrollment.course.title}</h3>
                    <p className="text-xs text-slate-500">by {enrollment.instructorName}</p>

                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs text-slate-600">
                        <span>
                          {enrollment.completedLessons}/{enrollment.totalLessons} lessons
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <div
                        className="h-2 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full rounded-full bg-brand-600 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-auto flex gap-2 pt-5">
                      <Link
                        href={`/learn/${enrollment.course.slug}`}
                        className={buttonVariants({ size: "sm", className: "flex-1" })}
                      >
                        {progress === 0 ? "Start course" : progress === 100 ? "Review" : "Continue"}
                      </Link>
                      {enrollment.completedAt && (
                        <Link
                          href={`/certificates/${enrollment.enrollmentId}`}
                          className={buttonVariants({ size: "sm", variant: "outline" })}
                          aria-label="View certificate"
                        >
                          <Award className="size-4" aria-hidden />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {orders.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Receipt className="size-5" aria-hidden /> Purchase history
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-3">
                      <Link
                        href={`/courses/${order.courseSlug}`}
                        className="text-slate-900 hover:text-brand-700"
                      >
                        {order.courseTitle}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {dateFormat.format(order.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        tone={
                          order.status === "paid"
                            ? "success"
                            : order.status === "failed"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {order.status}
                      </Badge>
                      {order.provider === "demo" && (
                        <span className="ml-2 text-xs text-slate-400">demo</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900">
                      {formatPrice(order.amountCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
