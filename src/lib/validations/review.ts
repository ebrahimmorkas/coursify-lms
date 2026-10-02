import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.coerce
    .number("Choose a rating")
    .int()
    .min(1, "Choose a rating between 1 and 5")
    .max(5, "Choose a rating between 1 and 5"),
  comment: z.string().trim().max(1000, "Reviews are limited to 1000 characters").default(""),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

/** Converts grouped counts into a complete 5→1 distribution with percentages. */
export function ratingDistribution(rows: { rating: number; count: number }[]) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return [5, 4, 3, 2, 1].map((rating) => {
    const count = rows.find((row) => row.rating === rating)?.count ?? 0;
    return { rating, count, percent: total === 0 ? 0 : Math.round((count / total) * 100) };
  });
}
