"use client";

import { useActionState, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError, Label, Textarea } from "@/components/ui/input";
import type { FormState } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

const labels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function ReviewForm({
  action,
  initial,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initial?: { rating: number; comment: string } | null;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (state?.success && state.message) toast.success(state.message);
    else if (state?.message) toast.error(state.message);
  }, [state]);

  const shown = hover || rating;

  return (
    <form action={formAction} className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Your rating</legend>
        <div className="mt-1 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer" onMouseEnter={() => setHover(value)}>
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="peer sr-only"
              />
              <Star
                className={cn(
                  "size-7 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500",
                  shown >= value ? "fill-amber-400 text-amber-400" : "text-slate-300",
                )}
                aria-hidden
              />
              <span className="sr-only">
                {value} star{value > 1 ? "s" : ""}
              </span>
            </label>
          ))}
          <span className="ml-2 text-sm text-slate-600">{labels[shown]}</span>
        </div>
        <FieldError messages={state?.errors?.rating} />
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="comment">Your review (optional)</Label>
        <Textarea
          id="comment"
          name="comment"
          rows={4}
          maxLength={1000}
          placeholder="What did you like? What could be better?"
          defaultValue={state?.fields?.comment ?? initial?.comment ?? ""}
        />
        <FieldError messages={state?.errors?.comment} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : initial ? "Update review" : "Submit review"}
      </Button>
    </form>
  );
}
