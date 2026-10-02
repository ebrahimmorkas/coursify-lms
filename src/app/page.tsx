import Link from "next/link";
import { BarChart3, BookOpenCheck, CreditCard, PlayCircle } from "lucide-react";
import { CourseCard } from "@/components/courses/course-card";
import { buttonVariants } from "@/components/ui/button";
import { getFeaturedCourses } from "@/lib/queries/courses";

const highlights = [
  {
    icon: PlayCircle,
    title: "Learn at your own pace",
    description: "Video lessons and rich written content, with progress saved automatically.",
  },
  {
    icon: BookOpenCheck,
    title: "Earn certificates",
    description: "Complete every lesson in a course to unlock a shareable certificate.",
  },
  {
    icon: CreditCard,
    title: "Secure checkout",
    description: "Paid courses are processed through Stripe Checkout.",
  },
  {
    icon: BarChart3,
    title: "Instructor analytics",
    description: "Track enrollments, revenue and ratings from your instructor studio.",
  },
];

export default async function HomePage() {
  const featured = await getFeaturedCourses(3);

  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 -z-0 h-96 bg-gradient-to-b from-brand-50 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:py-32">
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold tracking-wide text-brand-700 uppercase">
            Online learning, simplified
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Build real skills with courses from expert instructors
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Coursify connects curious learners with instructors who love to teach. Browse the
            catalog, enroll in a course and track your progress lesson by lesson.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/courses" className={buttonVariants({ size: "lg" })}>
              Explore courses
            </Link>
            <Link href="/register" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Start teaching
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-brand-50 p-2 text-brand-600">
                <Icon className="size-5" aria-hidden />
              </div>
              <h2 className="font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>
      {featured.length > 0 && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Most popular courses</h2>
                <p className="mt-1 text-slate-600">
                  Join thousands of learners in these top picks.
                </p>
              </div>
              <Link href="/courses" className={buttonVariants({ variant: "outline" })}>
                View all
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
