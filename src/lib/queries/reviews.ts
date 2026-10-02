import "server-only";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { ratingDistribution } from "@/lib/validations/review";

export async function getCourseReviews(courseId: string, limit = 10) {
  const [items, grouped] = await Promise.all([
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        authorName: users.name,
        authorId: users.id,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.courseId, courseId))
      .orderBy(desc(reviews.createdAt))
      .limit(limit),
    db
      .select({ rating: reviews.rating, count: count() })
      .from(reviews)
      .where(eq(reviews.courseId, courseId))
      .groupBy(reviews.rating),
  ]);

  return { items, distribution: ratingDistribution(grouped) };
}

export async function getUserReview(userId: string, courseId: string) {
  const review = await db.query.reviews.findFirst({
    where: and(eq(reviews.userId, userId), eq(reviews.courseId, courseId)),
  });
  return review ?? null;
}
