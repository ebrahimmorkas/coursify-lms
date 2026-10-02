import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export type DailyPoint = { date: string; revenueCents: number; enrollments: number };

export type CoursePerformance = {
  id: string;
  title: string;
  status: "draft" | "published";
  students: number;
  revenueCents: number;
  completionRate: number;
  avgRating: number;
};

/** Headline numbers for an instructor across all of their courses. */
export async function getInstructorKpis(instructorId: string) {
  const [row] = await db.execute<{
    students: string;
    revenue_cents: string;
    completed: string;
    avg_rating: string | null;
    reviews: string;
    new_students_30d: string;
  }>(sql`
    select
      count(e.id)                                                    as students,
      coalesce(sum(e.price_paid_cents), 0)                           as revenue_cents,
      count(e.completed_at)                                          as completed,
      (select round(avg(r.rating)::numeric, 2)
         from reviews r join courses c2 on c2.id = r.course_id
        where c2.instructor_id = ${instructorId})                    as avg_rating,
      (select count(*)
         from reviews r join courses c3 on c3.id = r.course_id
        where c3.instructor_id = ${instructorId})                    as reviews,
      count(e.id) filter (where e.created_at >= now() - interval '30 days') as new_students_30d
    from courses c
    left join enrollments e on e.course_id = c.id
    where c.instructor_id = ${instructorId}
  `);

  const students = Number(row?.students ?? 0);
  return {
    students,
    revenueCents: Number(row?.revenue_cents ?? 0),
    completionRate: students === 0 ? 0 : Math.round((Number(row?.completed ?? 0) / students) * 100),
    avgRating: Number(row?.avg_rating ?? 0),
    reviews: Number(row?.reviews ?? 0),
    newStudents30d: Number(row?.new_students_30d ?? 0),
  };
}

/**
 * Daily revenue and enrollments for the last `days` days. `generate_series` produces
 * a row for every day so the chart has no gaps on days without sales.
 */
export async function getDailyRevenue(instructorId: string, days = 30): Promise<DailyPoint[]> {
  const rows = await db.execute<{ day: string; revenue_cents: string; enrollments: string }>(sql`
    with days as (
      select generate_series(
        date_trunc('day', now()) - (${days - 1} * interval '1 day'),
        date_trunc('day', now()),
        interval '1 day'
      )::date as day
    )
    select
      to_char(d.day, 'YYYY-MM-DD')               as day,
      coalesce(sum(e.price_paid_cents), 0)       as revenue_cents,
      count(e.id)                                as enrollments
    from days d
    left join enrollments e
      on e.created_at::date = d.day
     and e.course_id in (select id from courses where instructor_id = ${instructorId})
    group by d.day
    order by d.day
  `);

  return rows.map((row) => ({
    date: row.day,
    revenueCents: Number(row.revenue_cents),
    enrollments: Number(row.enrollments),
  }));
}

export async function getCoursePerformance(instructorId: string): Promise<CoursePerformance[]> {
  const rows = await db.execute<{
    id: string;
    title: string;
    status: "draft" | "published";
    students: string;
    revenue_cents: string;
    completed: string;
    avg_rating: string | null;
  }>(sql`
    select
      c.id, c.title, c.status,
      count(e.id)                           as students,
      coalesce(sum(e.price_paid_cents), 0)  as revenue_cents,
      count(e.completed_at)                 as completed,
      (select round(avg(r.rating)::numeric, 1) from reviews r where r.course_id = c.id) as avg_rating
    from courses c
    left join enrollments e on e.course_id = c.id
    where c.instructor_id = ${instructorId}
    group by c.id
    order by revenue_cents desc, students desc
  `);

  return rows.map((row) => {
    const students = Number(row.students);
    return {
      id: row.id,
      title: row.title,
      status: row.status,
      students,
      revenueCents: Number(row.revenue_cents),
      completionRate: students === 0 ? 0 : Math.round((Number(row.completed) / students) * 100),
      avgRating: Number(row.avg_rating ?? 0),
    };
  });
}
