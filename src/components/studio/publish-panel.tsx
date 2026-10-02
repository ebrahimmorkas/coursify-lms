"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { setCourseStatus } from "@/app/studio/actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

export function PublishPanel({
  courseId,
  slug,
  status,
}: {
  courseId: string;
  slug: string;
  status: "draft" | "published";
}) {
  const [pending, startTransition] = useTransition();
  const published = status === "published";

  function toggle() {
    startTransition(async () => {
      const result = await setCourseStatus(courseId, published ? "draft" : "published");
      if (result.error) toast.error(result.error);
      else toast.success(published ? "Course unpublished." : "Course published!");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">Status</span>
        <Badge tone={published ? "success" : "warning"}>{published ? "Published" : "Draft"}</Badge>
      </div>
      <p className="text-sm text-slate-500">
        {published
          ? "Your course is live in the catalog."
          : "Drafts are only visible to you. Publish when your curriculum is ready."}
      </p>
      <Button
        className="w-full"
        variant={published ? "outline" : "primary"}
        onClick={toggle}
        disabled={pending}
      >
        {pending ? "Saving…" : published ? "Unpublish" : "Publish course"}
      </Button>
      <Link
        href={`/courses/${slug}`}
        target="_blank"
        className={buttonVariants({ variant: "ghost", className: "w-full" })}
      >
        {published ? "View course page" : "Preview course page"}
        <ExternalLink className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
