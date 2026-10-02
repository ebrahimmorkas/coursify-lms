/**
 * Seeds the database with demo users, courses, enrollments, progress and reviews.
 * Usage: npm run db:seed   (WARNING: wipes existing data)
 */
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { hashPassword } from "../src/lib/auth/password";
import { slugify } from "../src/lib/utils";
import { reviewComments, seedCourses, studentNames, type SeedCourse } from "./seed-data";

try {
  process.loadEnvFile();
} catch {
  // No .env file; use the process environment.
}

const DEMO_PASSWORD = "Password123";
const DAY = 24 * 60 * 60 * 1000;

const client = postgres(
  process.env.DATABASE_URL ?? "postgres://coursify:coursify@localhost:5432/coursify",
  { max: 1 },
);
const db = drizzle(client, { schema });

/** Small deterministic PRNG so every seed run produces the same dataset. */
function createRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = createRandom(42);
const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)]!;
const between = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;

function lessonContent(course: SeedCourse, lessonTitle: string) {
  const isTechnical = course.category !== "Design" && course.category !== "Business";
  const code = isTechnical
    ? `\n\n\`\`\`ts\n// ${lessonTitle}\nexport function example(input: string) {\n  return input.trim().toLowerCase();\n}\n\`\`\``
    : "";

  return `## ${lessonTitle}

In this lesson of **${course.title}** we focus on *${lessonTitle.toLowerCase()}*. You will learn the core idea, see it applied to a realistic example and finish with a short exercise.

### What you will learn

- The key concepts behind ${lessonTitle.toLowerCase()}
- Common mistakes and how to avoid them
- How this fits into the rest of the course${code}

> Tip: pause the lesson and try each step yourself before moving on.

### Exercise

Apply what you learned to your own project, then mark this lesson as complete to track your progress.`;
}

async function main() {
  console.log("Clearing existing data…");
  await db.execute(
    sql`truncate table reviews, lesson_progress, orders, enrollments, lessons, sections, courses, sessions, users restart identity cascade`,
  );

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  console.log("Creating users…");
  const [sarah, marcus, demoStudent] = await db
    .insert(schema.users)
    .values([
      {
        name: "Sarah Chen",
        email: "sarah@coursify.dev",
        passwordHash,
        role: "instructor",
        headline: "Senior Software Engineer & Educator",
      },
      {
        name: "Marcus Johnson",
        email: "marcus@coursify.dev",
        passwordHash,
        role: "instructor",
        headline: "Staff Engineer, Data & Platform",
      },
      { name: "Demo Student", email: "student@coursify.dev", passwordHash, role: "student" },
    ])
    .returning();

  const students = await db
    .insert(schema.users)
    .values(
      studentNames.map((name) => ({
        name,
        email: `${slugify(name).replace("-", ".")}@example.com`,
        passwordHash,
        role: "student" as const,
      })),
    )
    .returning();

  const instructors = { sarah: sarah!, marcus: marcus! };

  console.log("Creating courses…");
  for (const [index, course] of seedCourses.entries()) {
    const publishedAt = new Date(Date.now() - (90 - index * 6) * DAY);
    const [created] = await db
      .insert(schema.courses)
      .values({
        instructorId: instructors[course.instructor].id,
        title: course.title,
        slug: slugify(course.title),
        subtitle: course.subtitle,
        description: course.description,
        category: course.category,
        level: course.level,
        priceCents: course.priceCents,
        status: "published",
        publishedAt,
        createdAt: publishedAt,
      })
      .returning();

    const lessonIds: string[] = [];
    for (const [sectionIndex, section] of course.sections.entries()) {
      const [createdSection] = await db
        .insert(schema.sections)
        .values({ courseId: created!.id, title: section.title, position: sectionIndex })
        .returning();

      const lessons = await db
        .insert(schema.lessons)
        .values(
          section.lessons.map((title, lessonIndex) => ({
            sectionId: createdSection!.id,
            courseId: created!.id,
            title,
            content: lessonContent(course, title),
            videoUrl:
              sectionIndex === 0 && lessonIndex === 0 && course.videoId
                ? `https://www.youtube.com/watch?v=${course.videoId}`
                : null,
            durationMinutes: between(4, 18),
            position: lessonIndex,
            isPreview: sectionIndex === 0 && lessonIndex === 0,
          })),
        )
        .returning({ id: schema.lessons.id });
      lessonIds.push(...lessons.map((lesson) => lesson.id));
    }

    // Enroll a random subset of students with orders, progress and reviews.
    const learners = [...students].sort(() => random() - 0.5).slice(0, between(4, students.length));
    for (const learner of learners) {
      const enrolledAt = new Date(
        Math.min(Date.now() - DAY, publishedAt.getTime() + between(1, 85) * DAY),
      );
      const completedCount = between(0, lessonIds.length);
      const completed = completedCount === lessonIds.length;

      if (course.priceCents > 0) {
        await db.insert(schema.orders).values({
          userId: learner.id,
          courseId: created!.id,
          amountCents: course.priceCents,
          status: "paid",
          provider: "demo",
          paidAt: enrolledAt,
          createdAt: enrolledAt,
        });
      }

      await db.insert(schema.enrollments).values({
        userId: learner.id,
        courseId: created!.id,
        pricePaidCents: course.priceCents,
        lastLessonId: completedCount > 0 ? lessonIds[completedCount - 1] : null,
        completedAt: completed ? new Date(enrolledAt.getTime() + 7 * DAY) : null,
        createdAt: enrolledAt,
      });

      if (completedCount > 0) {
        await db.insert(schema.lessonProgress).values(
          lessonIds.slice(0, completedCount).map((lessonId) => ({
            userId: learner.id,
            lessonId,
            courseId: created!.id,
            completedAt: enrolledAt,
          })),
        );
      }

      if (random() > 0.35) {
        await db.insert(schema.reviews).values({
          userId: learner.id,
          courseId: created!.id,
          rating: pick([3, 4, 4, 5, 5, 5]),
          comment: pick(reviewComments),
          createdAt: new Date(enrolledAt.getTime() + 3 * DAY),
        });
      }
    }
  }

  console.log("\nSeed complete. Demo accounts (password: %s):", DEMO_PASSWORD);
  console.log("  Instructor: %s", sarah!.email);
  console.log("  Instructor: %s", marcus!.email);
  console.log("  Student:    %s", demoStudent!.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
