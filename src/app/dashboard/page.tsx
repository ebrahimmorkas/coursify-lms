import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name.split(" ")[0]}</h1>
      <p className="mt-1 text-slate-600">Pick up where you left off.</p>

      <div className="mt-8">
        <EmptyState
          icon={BookOpen}
          title="You are not enrolled in any courses yet"
          description="Browse the catalog to find your next course."
          action={
            <Link href="/courses" className={buttonVariants()}>
              Browse courses
            </Link>
          }
        />
      </div>
    </div>
  );
}
