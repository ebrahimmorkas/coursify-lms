import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { SESSION_COOKIE } from "@/lib/auth/tokens";
import { proxy } from "./proxy";

function request(path: string, withCookie = false) {
  const req = new NextRequest(new URL(path, "http://localhost:3000"));
  if (withCookie) req.cookies.set(SESSION_COOKIE, "token");
  return req;
}

describe("proxy", () => {
  it("redirects anonymous users from protected pages to login with a return path", () => {
    const response = proxy(request("/studio/courses?tab=1"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Fstudio%2Fcourses%3Ftab%3D1",
    );
  });

  it("lets requests with a session cookie through to protected pages", () => {
    expect(proxy(request("/dashboard", true)).headers.get("location")).toBeNull();
  });

  it("never redirects away from /login based on the cookie alone (stale cookie loop)", () => {
    expect(proxy(request("/login", true)).headers.get("location")).toBeNull();
  });

  it("ignores public pages", () => {
    expect(proxy(request("/courses")).headers.get("location")).toBeNull();
  });
});
