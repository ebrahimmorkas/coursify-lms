import Link from "next/link";
import { requireInstructor } from "@/lib/auth/guards";

export default async function StudioLayout({ children }: LayoutProps<"/studio">) {
  await requireInstructor();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase">
            Instructor studio
          </p>
          <nav className="mt-1 flex gap-6 text-sm font-medium text-slate-600">
            <Link href="/studio" className="hover:text-slate-900">
              Courses
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
