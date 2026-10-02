import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Eye, Globe, PlayCircle, Signal, Users } from "lucide-react";
import { CourseCover } from "@/components/courses/course-cover";
import { RatingStars } from "@/components/courses/rating-stars";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth/session";
import { LEVEL_LABELS } from "@/lib/catalog";
import { env } from "@/lib/env";
import { getCourseBySlug, type CourseDetail } from "@/lib/queries/courses";
import { formatDuration, formatPrice } from "@/lib/utils";
import { EnrollCard } from "./enroll-card";

async function loadCourse(slug: string) {
  const course = await getCourseBySlug(slug);
  if (!course) return null;
  if (course.status === "published") return course;

  // Drafts are only visible to their instructor (for previewing).
  const user = await getCurrentUser();
  return user?.id === course.instructorId ? course : null;
}

export async function generateMetadata(props: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const course = await getCourseBySlug(slug);
  if (!course || course.status !== "published") return { title: "Course not found" };

  return {
    title: course.title,
    description: course.subtitle,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: { title: course.title, description: course.subtitle, type: "website" },
  };
}

function courseJsonLd(course: CourseDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.subtitle,
    url: `${env.NEXT_PUBLIC_APP_URL}/courses/${course.slug}`,
    provider: { "@type": "Organization", name: "Coursify", sameAs: env.NEXT_PUBLIC_APP_URL },
    instructor: { "@type": "Person", name: course.instructor.name },
    offers: {
      "@type": "Offer",
      category: course.priceCents === 0 ? "Free" : "Paid",
      price: (course.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
    },
    ...(course.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: course.avgRating,
        reviewCount: course.reviewCount,
      },
    }),
  };
}

export default async function CoursePage(props: PageProps<"/courses/[slug]">) {
  const { slug } = await props.params;
  const course = await loadCourse(slug);
  if (!course) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output is safe here; "<" is escaped to prevent breaking out of the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(courseJsonLd(course)).replace(/</g, "\\u003c"),
        }}
      />

      <section className="bg-slate-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px]">
          <div>
            {course.status !== "published" && (
              <Badge tone="warning" className="mb-3">
                <Eye className="mr-1 size-3" aria-hidden /> Draft preview
              </Badge>
            )}
            <p className="text-sm font-medium text-brand-100">{course.category}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>
            <p className="mt-4 text-lg text-slate-300">{course.subtitle}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <span className="font-semibold text-amber-400">{course.avgRating.toFixed(1)}</span>
                <RatingStars rating={course.avgRating} />
                <span>({course.reviewCount} reviews)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" aria-hidden /> {course.studentCount} students
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Signal className="size-4" aria-hidden /> {LEVEL_LABELS[course.level]}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe className="size-4" aria-hidden /> English
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Created by <span className="font-medium text-white">{course.instructor.name}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold text-slate-900">About this course</h2>
            <p className="mt-3 leading-7 whitespace-pre-line text-slate-700">
              {course.description}
            </p>
          </section>

          <section>
            <div className="flex items-end justify-between">
              <h2 className="text-xl font-bold text-slate-900">Course content</h2>
              <p className="text-sm text-slate-500">
                {course.sections.length} sections · {course.lessonCount} lessons ·{" "}
                {formatDuration(course.totalMinutes)}
              </p>
            </div>
            <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {course.sections.map((section, index) => (
                <details key={section.id} open={index === 0} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between bg-slate-50 px-5 py-4 font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                    <span>{section.title}</span>
                    <span className="text-sm font-normal text-slate-500">
                      {section.lessons.length} lessons
                    </span>
                  </summary>
                  <ul className="divide-y divide-slate-100">
                    {section.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between px-5 py-3 text-sm"
                      >
                        <span className="flex items-center gap-3 text-slate-700">
                          <PlayCircle className="size-4 text-slate-400" aria-hidden />
                          {lesson.title}
                          {lesson.isPreview && <Badge tone="brand">Preview</Badge>}
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Clock className="size-3.5" aria-hidden />
                          {formatDuration(lesson.durationMinutes)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Your instructor</h2>
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
              <span className="flex size-14 items-center justify-center rounded-full bg-brand-600 text-lg font-semibold text-white">
                {course.instructor.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <div>
                <p className="font-semibold text-slate-900">{course.instructor.name}</p>
                {course.instructor.headline && (
                  <p className="text-sm text-slate-600">{course.instructor.headline}</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:-mt-64">
          <div className="sticky top-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <CourseCover
              slug={course.slug}
              category={course.category}
              title={course.title}
              size="lg"
            />
            <div className="space-y-5 p-6">
              <p className="text-3xl font-bold text-slate-900">{formatPrice(course.priceCents)}</p>
              <EnrollCard course={course} />
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  `${course.lessonCount} lessons (${formatDuration(course.totalMinutes)})`,
                  "Full lifetime access",
                  "Learn at your own pace",
                  "Certificate of completion",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500" aria-hidden /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
