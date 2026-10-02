import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { CatalogFilterForm } from "@/components/courses/catalog-filters";
import { CourseCard } from "@/components/courses/course-card";
import { Pagination } from "@/components/courses/pagination";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listCourses } from "@/lib/queries/courses";
import { parseCatalogFilters } from "@/lib/validations/catalog";

export const metadata: Metadata = {
  title: "Browse courses",
  description: "Explore courses in web development, data science, DevOps, design and more.",
};

export default async function CoursesPage(props: PageProps<"/courses">) {
  const filters = parseCatalogFilters(await props.searchParams);
  const { items, total, pageCount } = await listCourses(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Browse courses</h1>
        <p className="mt-1 text-slate-600">
          {total} {total === 1 ? "course" : "courses"}
          {filters.q ? ` matching “${filters.q}”` : " available"}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          {/* Re-mount when the URL changes so inputs always reflect the active filters */}
          <CatalogFilterForm key={JSON.stringify(filters)} filters={filters} />
        </aside>

        <section className="space-y-8">
          {items.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No courses found"
              description="Try a different search term or remove some filters."
              action={
                <Link href="/courses" className={buttonVariants({ variant: "outline" })}>
                  Clear filters
                </Link>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
          <Pagination filters={filters} pageCount={pageCount} />
        </section>
      </div>
    </div>
  );
}
