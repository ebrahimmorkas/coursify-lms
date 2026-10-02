import { describe, expect, it } from "vitest";
import { ratingDistribution, reviewSchema } from "./review";

describe("reviewSchema", () => {
  it("accepts ratings from 1 to 5", () => {
    expect(reviewSchema.parse({ rating: "4", comment: " Great " })).toEqual({
      rating: 4,
      comment: "Great",
    });
  });

  it.each(["0", "6", "3.5", "", undefined])("rejects rating %s", (rating) => {
    expect(reviewSchema.safeParse({ rating }).success).toBe(false);
  });
});

describe("ratingDistribution", () => {
  it("fills missing ratings and computes percentages", () => {
    expect(
      ratingDistribution([
        { rating: 5, count: 3 },
        { rating: 3, count: 1 },
      ]),
    ).toEqual([
      { rating: 5, count: 3, percent: 75 },
      { rating: 4, count: 0, percent: 0 },
      { rating: 3, count: 1, percent: 25 },
      { rating: 2, count: 0, percent: 0 },
      { rating: 1, count: 0, percent: 0 },
    ]);
  });

  it("handles courses without reviews", () => {
    expect(ratingDistribution([]).every((row) => row.percent === 0)).toBe(true);
  });
});
