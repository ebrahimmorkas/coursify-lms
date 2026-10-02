import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "./session";

/** Ensures a user is signed in, otherwise redirects to the login page. */
export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const query = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
    redirect(`/login${query}`);
  }
  return user;
}

/** Ensures the signed-in user can manage courses. */
export async function requireInstructor(): Promise<SessionUser> {
  const user = await requireUser("/studio");
  if (user.role !== "instructor" && user.role !== "admin") {
    redirect("/dashboard?notice=instructor-only");
  }
  return user;
}

export function isInstructor(user: SessionUser | null) {
  return user?.role === "instructor" || user?.role === "admin";
}
