import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";

export async function EnrollCard({ slug }: { slug: string }) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/courses/${slug}`)}`}
        className={buttonVariants({ size: "lg", className: "w-full" })}
      >
        Log in to enroll
      </Link>
    );
  }

  return (
    <button type="button" disabled className={buttonVariants({ size: "lg", className: "w-full" })}>
      Enrollment opening soon
    </button>
  );
}
