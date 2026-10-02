import { MessageSquare } from "lucide-react";
import { RatingStars } from "@/components/courses/rating-stars";
import { ReviewForm } from "@/components/courses/review-form";
import { getCurrentUser } from "@/lib/auth/session";
import { isEnrolled } from "@/lib/enrollment";
import { getCourseReviews, getUserReview } from "@/lib/queries/reviews";
import { saveReview } from "./review-actions";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export async function ReviewsSection({
  course,
}: {
  course: { id: string; instructorId: string; avgRating: number; reviewCount: number };
}) {
  const user = await getCurrentUser();
  const [{ items, distribution }, canReview, existing] = await Promise.all([
    getCourseReviews(course.id),
    user && user.id !== course.instructorId ? isEnrolled(user.id, course.id) : false,
    user ? getUserReview(user.id, course.id) : null,
  ]);

  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900">Student reviews</h2>

      <div className="mt-4 grid gap-6 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-[160px_1fr]">
        <div className="text-center">
          <p className="text-5xl font-bold text-slate-900">{course.avgRating.toFixed(1)}</p>
          <RatingStars rating={course.avgRating} className="mt-2 justify-center" />
          <p className="mt-1 text-sm text-slate-500">{course.reviewCount} reviews</p>
        </div>
        <ul className="space-y-2">
          {distribution.map((row) => (
            <li key={row.rating} className="flex items-center gap-3 text-sm">
              <span className="w-12 text-slate-600">{row.rating} stars</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <span className="w-10 text-right text-slate-500">{row.percent}%</span>
            </li>
          ))}
        </ul>
      </div>

      {canReview && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-slate-900">
            {existing ? "Update your review" : "Leave a review"}
          </h3>
          <ReviewForm action={saveReview.bind(null, course.id)} initial={existing} />
        </div>
      )}

      {items.length === 0 ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-slate-500">
          <MessageSquare className="size-4" aria-hidden /> No reviews yet.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-200">
          {items.map((review) => (
            <li key={review.id} className="py-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                  {review.authorName.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {review.authorName}
                    {review.authorId === user?.id && (
                      <span className="ml-2 text-xs text-brand-600">(you)</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={review.rating} />
                    <span className="text-xs text-slate-500">
                      {dateFormat.format(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              {review.comment && <p className="mt-3 text-sm text-slate-700">{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
