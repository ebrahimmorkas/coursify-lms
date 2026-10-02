import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "size-3.5",
            rating >= star - 0.25
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200",
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}
