import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} Coursify. Built with Next.js.</p>
        <nav className="flex gap-6">
          <Link href="/courses" className="hover:text-slate-900">
            Courses
          </Link>
          <Link href="/register" className="hover:text-slate-900">
            Become an instructor
          </Link>
        </nav>
      </div>
    </footer>
  );
}
