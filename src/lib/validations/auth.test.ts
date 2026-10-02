import { describe, expect, it } from "vitest";
import { registerSchema } from "./auth";

describe("registerSchema", () => {
  const valid = { name: "Ada Lovelace", email: "ADA@Example.com ", password: "analytical1" };

  it("normalizes email addresses", () => {
    const result = registerSchema.parse(valid);
    expect(result.email).toBe("ada@example.com");
    expect(result.role).toBe("student");
  });

  it("requires passwords with letters and numbers", () => {
    const result = registerSchema.safeParse({ ...valid, password: "onlyletters" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown roles", () => {
    const result = registerSchema.safeParse({ ...valid, role: "admin" });
    expect(result.success).toBe(false);
  });
});
