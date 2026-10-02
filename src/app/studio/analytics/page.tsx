import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, GraduationCap, Star, TrendingUp, Users } from "lucide-react";
import { EnrollmentsChart, RevenueChart } from "@/components/studio/revenue-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireInstructor } from "@/lib/auth/guards";
import { getCoursePerformance, getDailyRevenue, getInstructorKpis } from "@/lib/queries/analytics";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await requireInstructor();
  const [kpis, daily, performance] = await Promise.all([
    getInstructorKpis(user.id),
    getDailyRevenue(user.id, 30),
    getCoursePerformance(user.id),
  ]);

  const revenue30d = daily.reduce((sum, day) => sum + day.revenueCents, 0);

  const cards = [
    {
      label: "Total revenue",
      value: formatCurrency(kpis.revenueCents),
      hint: `${formatCurrency(revenue30d)} in the last 30 days`,
      icon: DollarSign,
    },
    {
      label: "Students",
      value: kpis.students.toLocaleString(),
      hint: `+${kpis.newStudents30d} in the last 30 days`,
      icon: Users,
    },
    {
      label: "Average rating",
      value: kpis.avgRating ? kpis.avgRating.toFixed(2) : "—",
      hint: `${kpis.reviews} reviews`,
      icon: Star,
    },
    {
      label: "Completion rate",
      value: `${kpis.completionRate}%`,
      hint: "of enrolled students finished",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-slate-600">How your courses are performing.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, hint, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-500">
                {label}
                <Icon className="size-4" aria-hidden />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-brand-600" aria-hidden /> Revenue
            </CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={daily} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New enrollments</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <EnrollmentsChart data={daily} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course performance</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-slate-500 uppercase">
              <tr className="border-b border-slate-200">
                <th className="py-2 font-medium">Course</th>
                <th className="py-2 text-right font-medium">Students</th>
                <th className="py-2 text-right font-medium">Revenue</th>
                <th className="py-2 font-medium">Completion</th>
                <th className="py-2 text-right font-medium">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {performance.map((course) => (
                <tr key={course.id}>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/studio/courses/${course.id}`}
                      className="font-medium text-slate-900 hover:text-brand-700"
                    >
                      {course.title}
                    </Link>
                    {course.status === "draft" && (
                      <Badge tone="warning" className="ml-2">
                        Draft
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 text-right text-slate-700">{course.students}</td>
                  <td className="py-3 text-right text-slate-700">
                    {formatCurrency(course.revenueCents)}
                  </td>
                  <td className="py-3 pl-6">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">{course.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-slate-700">
                    {course.avgRating ? course.avgRating.toFixed(1) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
