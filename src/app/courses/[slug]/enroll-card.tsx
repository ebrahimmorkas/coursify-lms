import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessCourse } from "@/lib/enrollment";
import { features } from "@/lib/env";
import { enroll } from "./actions";

export async function EnrollCard({
  course,
}: {
  course: { id: string; slug: string; priceCents: number; instructorId: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`}
        className={buttonVariants({ size: "lg", className: "w-full" })}
      >
        Log in to enroll
      </Link>
    );
  }

  if (await canAccessCourse(user.id, course)) {
    return (
      <Link
        href={`/learn/${course.slug}`}
        className={buttonVariants({ size: "lg", className: "w-full" })}
      >
        {course.instructorId === user.id ? "View as learner" : "Go to course"}
      </Link>
    );
  }

  const isFree = course.priceCents === 0;

  return (
    <form action={enroll.bind(null, course.id)} className="space-y-2">
      <SubmitButton size="lg" className="w-full" pendingText="Redirecting…">
        {isFree ? "Enroll for free" : "Buy now"}
      </SubmitButton>
      {!isFree && (
        <p className="text-center text-xs text-slate-500">
          {features.stripe
            ? "Secure payment powered by Stripe."
            : "Demo mode: no real payment will be taken."}
        </p>
      )}
    </form>
  );
}
