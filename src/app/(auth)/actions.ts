"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/auth/tokens";
import { loginSchema, registerSchema, type FormState } from "@/lib/validations/auth";

// Used to keep response times similar whether or not an account exists,
// which makes it harder to enumerate registered email addresses.
const DUMMY_HASH = "scrypt$00000000000000000000000000000000$" + "0".repeat(128);

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData);
  const fields = { email: String(raw.email ?? "") };
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, fields };
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });
  const passwordOk = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordOk) {
    return { message: "Invalid email or password.", fields };
  }

  await createSession(user.id);
  redirect(safeRedirectPath(formData.get("next")?.toString()));
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData);
  const fields = { name: String(raw.name ?? ""), email: String(raw.email ?? "") };
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, fields };
  }

  const { name, email, password, role } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });
  if (existing) {
    return { errors: { email: ["An account with this email already exists."] }, fields };
  }

  const [user] = await db
    .insert(users)
    .values({ name, email, role, passwordHash: await hashPassword(password) })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  if (!user) {
    return { errors: { email: ["An account with this email already exists."] }, fields };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
