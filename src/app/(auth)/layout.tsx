import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  // Validated against the database, so a stale cookie never causes a redirect loop.
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
