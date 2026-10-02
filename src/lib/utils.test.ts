import { describe, expect, it } from "vitest";
import { formatCurrency, formatDuration, formatPrice, percentage, slugify } from "./utils";

describe("formatPrice", () => {
  it("renders zero as Free", () => {
    expect(formatPrice(0)).toBe("Free");
  });

  it("formats cents as dollars", () => {
    expect(formatPrice(4999)).toBe("$49.99");
  });
});

describe("formatCurrency", () => {
  it("renders zero as an amount", () => {
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(123456)).toBe("$1,234.56");
  });
});

describe("slugify", () => {
  it("creates url-safe slugs", () => {
    expect(slugify("  Next.js 16: The Complete Guide!  ")).toBe("nextjs-16-the-complete-guide");
  });

  it("strips accents", () => {
    expect(slugify("Café Résumé")).toBe("cafe-resume");
  });
});

describe("formatDuration", () => {
  it("formats minutes and hours", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(120)).toBe("2h");
    expect(formatDuration(135)).toBe("2h 15m");
  });
});

describe("percentage", () => {
  it("handles empty totals", () => {
    expect(percentage(3, 0)).toBe(0);
  });

  it("rounds to the nearest integer", () => {
    expect(percentage(1, 3)).toBe(33);
  });
});
