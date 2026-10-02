import Link from "next/link";
import { BookOpen, LayoutDashboard, LogOut, Presentation } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { isInstructor } from "@/lib/auth/guards";
import type { SessionUser } from "@/lib/auth/session";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ user }: { user: SessionUser }) {
  const itemClass =
    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100";

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full p-1 hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          {initials(user.name)}
        </span>
        <span className="hidden text-sm font-medium text-slate-700 sm:inline">{user.name}</span>
      </summary>
      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
        <div className="border-b border-slate-100 px-3 py-2">
          <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
        <div className="py-1">
          <Link href="/dashboard" className={itemClass}>
            <LayoutDashboard className="size-4" aria-hidden /> Dashboard
          </Link>
          <Link href="/courses" className={itemClass}>
            <BookOpen className="size-4" aria-hidden /> Browse courses
          </Link>
          {isInstructor(user) && (
            <Link href="/studio" className={itemClass}>
              <Presentation className="size-4" aria-hidden /> Instructor studio
            </Link>
          )}
        </div>
        <form action={logout} className="border-t border-slate-100 pt-1">
          <button type="submit" className={itemClass}>
            <LogOut className="size-4" aria-hidden /> Log out
          </button>
        </form>
      </div>
    </details>
  );
}
