import Link from "next/link";
import { Clock, PlayCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LEVEL_LABELS } from "@/lib/catalog";
import type { CourseCardData } from "@/lib/queries/courses";
import { formatDuration, formatPrice } from "@/lib/utils";
import { CourseCover } from "./course-cover";
import { RatingStars } from "./rating-stars";

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <CourseCover slug={course.slug} category={course.category} title={course.title} />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          <Badge tone="brand">{course.category}</Badge>
          <Badge>{LEVEL_LABELS[course.level]}</Badge>
        </div>
        <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-brand-700">
          {course.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{course.subtitle}</p>
        <p className="mt-2 text-xs text-slate-500">by {course.instructorName}</p>

        <div className="mt-3 flex items-center gap-1.5 text-sm">
          <span className="font-semibold text-amber-600">{course.avgRating.toFixed(1)}</span>
          <RatingStars rating={course.avgRating} />
          <span className="text-xs text-slate-500">({course.reviewCount})</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <PlayCircle className="size-3.5" aria-hidden /> {course.lessonCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden /> {formatDuration(course.totalMinutes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" aria-hidden /> {course.studentCount}
            </span>
          </div>
          <span className="font-bold text-slate-900">{formatPrice(course.priceCents)}</span>
        </div>
      </div>
    </Link>
  );
}
