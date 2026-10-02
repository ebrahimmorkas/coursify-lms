import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["student", "instructor", "admin"]);
export const courseLevel = pgEnum("course_level", ["beginner", "intermediate", "advanced"]);
export const courseStatus = pgEnum("course_status", ["draft", "published"]);
export const orderStatus = pgEnum("order_status", ["pending", "paid", "failed"]);
export const paymentProvider = pgEnum("payment_provider", ["stripe", "demo"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("student"),
  headline: varchar("headline", { length: 160 }),
  ...timestamps,
});

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 hash of the session token. The raw token only lives in the user's cookie. */
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    instructorId: uuid("instructor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    subtitle: varchar("subtitle", { length: 200 }).notNull().default(""),
    description: text("description").notNull().default(""),
    category: varchar("category", { length: 50 }).notNull(),
    level: courseLevel("level").notNull().default("beginner"),
    priceCents: integer("price_cents").notNull().default(0),
    status: courseStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("courses_instructor_idx").on(t.instructorId),
    index("courses_status_category_idx").on(t.status, t.category),
    check("courses_price_check", sql`${t.priceCents} >= 0`),
  ],
);

export const sections = pgTable(
  "sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 120 }).notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("sections_course_idx").on(t.courseId)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 120 }).notNull(),
    content: text("content").notNull().default(""),
    videoUrl: text("video_url"),
    durationMinutes: integer("duration_minutes").notNull().default(5),
    position: integer("position").notNull().default(0),
    isPreview: boolean("is_preview").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("lessons_section_idx").on(t.sectionId), index("lessons_course_idx").on(t.courseId)],
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    pricePaidCents: integer("price_paid_cents").notNull().default(0),
    lastLessonId: uuid("last_lesson_id").references(() => lessons.id, { onDelete: "set null" }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("enrollments_user_course_idx").on(t.userId, t.courseId),
    index("enrollments_course_idx").on(t.courseId),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    status: orderStatus("status").notNull().default("pending"),
    provider: paymentProvider("provider").notNull(),
    providerSessionId: text("provider_session_id").unique(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("orders_user_idx").on(t.userId), index("orders_course_idx").on(t.courseId)],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.lessonId] }),
    index("lesson_progress_user_course_idx").on(t.userId, t.courseId),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    rating: smallint("rating").notNull(),
    comment: text("comment").notNull().default(""),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("reviews_user_course_idx").on(t.userId, t.courseId),
    index("reviews_course_idx").on(t.courseId),
    check("reviews_rating_check", sql`${t.rating} between 1 and 5`),
  ],
);

// ---------------------------------------------------------------------------
// Relations (used by the relational query API)
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  enrollments: many(enrollments),
  reviews: many(reviews),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, { fields: [courses.instructorId], references: [users.id] }),
  sections: many(sections),
  lessons: many(lessons),
  enrollments: many(enrollments),
  reviews: many(reviews),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, { fields: [sections.courseId], references: [courses.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  section: one(sections, { fields: [lessons.sectionId], references: [sections.id] }),
  course: one(courses, { fields: [lessons.courseId], references: [courses.id] }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  course: one(courses, { fields: [reviews.courseId], references: [courses.id] }),
}));

export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type UserRole = (typeof userRole.enumValues)[number];
export type CourseLevel = (typeof courseLevel.enumValues)[number];
