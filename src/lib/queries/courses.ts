import "server-only";
import { and, asc, desc, eq, gt, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { courses, lessons, sections, users } from "@/db/schema";
import { cached, getCacheVersion } from "@/lib/cache";
import type { CatalogFilters } from "@/lib/validations/catalog";

export const CATALOG_PAGE_SIZE = 9;
export const CATALOG_CACHE_NAMESPACE = "catalog";

/**
 * Aggregates computed with correlated subqueries; each one is backed by an index on course_id.
 * The outer column is written as "courses"."id" on purpose: in single-table selects Drizzle
 * renders column references unqualified, which would bind to the subquery's own "id".
 */
const courseStats = {
  lessonCount:
    sql<number>`(select count(*) from lessons l where l.course_id = "courses"."id")`.mapWith(
      Number,
    ),
  totalMinutes:
    sql<number>`(select coalesce(sum(l.duration_minutes), 0) from lessons l where l.course_id = "courses"."id")`.mapWith(
      Number,
    ),
  studentCount:
    sql<number>`(select count(*) from enrollments e where e.course_id = "courses"."id")`.mapWith(
      Number,
    ),
  avgRating:
    sql<number>`(select coalesce(round(avg(r.rating)::numeric, 1), 0) from reviews r where r.course_id = "courses"."id")`.mapWith(
      Number,
    ),
  reviewCount:
    sql<number>`(select count(*) from reviews r where r.course_id = "courses"."id")`.mapWith(
      Number,
    ),
};

const cardFields = {
  id: courses.id,
  slug: courses.slug,
  title: courses.title,
  subtitle: courses.subtitle,
  category: courses.category,
  level: courses.level,
  priceCents: courses.priceCents,
  instructorName: users.name,
  ...courseStats,
};

export type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  priceCents: number;
  instructorName: string;
  lessonCount: number;
  totalMinutes: number;
  studentCount: number;
  avgRating: number;
  reviewCount: number;
};

function buildWhere(filters: CatalogFilters): SQL | undefined {
  const conditions: (SQL | undefined)[] = [eq(courses.status, "published")];

  if (filters.q) {
    const pattern = `%${filters.q.replace(/[%_\\]/g, "\\$&")}%`;
    conditions.push(or(ilike(courses.title, pattern), ilike(courses.subtitle, pattern)));
  }
  if (filters.category) conditions.push(eq(courses.category, filters.category));
  if (filters.level) conditions.push(eq(courses.level, filters.level));
  if (filters.price === "free") conditions.push(eq(courses.priceCents, 0));
  if (filters.price === "paid") conditions.push(gt(courses.priceCents, 0));

  return and(...conditions);
}

function buildOrder(sort: CatalogFilters["sort"]) {
  switch (sort) {
    case "newest":
      return [desc(courses.publishedAt)];
    case "rating":
      return [desc(courseStats.avgRating), desc(courseStats.reviewCount)];
    case "price-asc":
      return [asc(courses.priceCents), desc(courses.publishedAt)];
    case "price-desc":
      return [desc(courses.priceCents), desc(courses.publishedAt)];
    default:
      return [desc(courseStats.studentCount), desc(courses.publishedAt)];
  }
}

async function queryCatalog(filters: CatalogFilters) {
  const where = buildWhere(filters);

  const [items, [{ total }]] = await Promise.all([
    db
      .select(cardFields)
      .from(courses)
      .innerJoin(users, eq(courses.instructorId, users.id))
      .where(where)
      .orderBy(...buildOrder(filters.sort))
      .limit(CATALOG_PAGE_SIZE)
      .offset((filters.page - 1) * CATALOG_PAGE_SIZE),
    db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(courses)
      .where(where),
  ]);

  return {
    items: items as CourseCardData[],
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE)),
  };
}

/** Paginated, filterable catalog. Results are cached and invalidated by bumping the catalog version. */
export async function listCourses(filters: CatalogFilters) {
  const version = await getCacheVersion(CATALOG_CACHE_NAMESPACE);
  return cached(`catalog:v${version}:list:${JSON.stringify(filters)}`, 120, () =>
    queryCatalog(filters),
  );
}

export async function getFeaturedCourses(limit = 3) {
  const version = await getCacheVersion(CATALOG_CACHE_NAMESPACE);
  return cached(`catalog:v${version}:featured:${limit}`, 300, async () => {
    const rows = await db
      .select(cardFields)
      .from(courses)
      .innerJoin(users, eq(courses.instructorId, users.id))
      .where(eq(courses.status, "published"))
      .orderBy(desc(courseStats.studentCount))
      .limit(limit);
    return rows as CourseCardData[];
  });
}

async function queryCourseBySlug(slug: string) {
  const [course] = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      subtitle: courses.subtitle,
      description: courses.description,
      category: courses.category,
      level: courses.level,
      priceCents: courses.priceCents,
      status: courses.status,
      instructorId: courses.instructorId,
      updatedAt: sql<string>`${courses.updatedAt}::text`,
      instructor: { name: users.name, headline: users.headline },
      ...courseStats,
    })
    .from(courses)
    .innerJoin(users, eq(courses.instructorId, users.id))
    .where(eq(courses.slug, slug))
    .limit(1);

  if (!course) return null;

  const [sectionRows, lessonRows] = await Promise.all([
    db
      .select({ id: sections.id, title: sections.title })
      .from(sections)
      .where(eq(sections.courseId, course.id))
      .orderBy(asc(sections.position)),
    db
      .select({
        id: lessons.id,
        sectionId: lessons.sectionId,
        title: lessons.title,
        durationMinutes: lessons.durationMinutes,
        isPreview: lessons.isPreview,
      })
      .from(lessons)
      .where(eq(lessons.courseId, course.id))
      .orderBy(asc(lessons.position)),
  ]);

  return {
    ...course,
    sections: sectionRows.map((section) => ({
      ...section,
      lessons: lessonRows.filter((lesson) => lesson.sectionId === section.id),
    })),
  };
}

export type CourseDetail = NonNullable<Awaited<ReturnType<typeof queryCourseBySlug>>>;

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const version = await getCacheVersion(CATALOG_CACHE_NAMESPACE);
  return cached(`catalog:v${version}:course:${slug}`, 300, () => queryCourseBySlug(slug));
}
