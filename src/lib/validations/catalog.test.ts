import { describe, expect, it } from "vitest";
import { catalogHref, parseCatalogFilters } from "./catalog";

describe("parseCatalogFilters", () => {
  it("applies defaults for an empty query", () => {
    expect(parseCatalogFilters({})).toEqual({ sort: "popular", page: 1 });
  });

  it("parses valid filters", () => {
    const filters = parseCatalogFilters({
      q: "  react ",
      category: "Web Development",
      level: "advanced",
      price: "paid",
      sort: "rating",
      page: "3",
    });
    expect(filters).toEqual({
      q: "react",
      category: "Web Development",
      level: "advanced",
      price: "paid",
      sort: "rating",
      page: 3,
    });
  });

  it("ignores invalid values instead of throwing", () => {
    const filters = parseCatalogFilters({
      category: "Cooking",
      level: "expert",
      sort: "random",
      page: "-4",
    });
    expect(filters).toEqual({ sort: "popular", page: 1 });
  });

  it("uses the first value of repeated params", () => {
    expect(parseCatalogFilters({ level: ["beginner", "advanced"] }).level).toBe("beginner");
  });
});

describe("catalogHref", () => {
  it("omits default values", () => {
    expect(catalogHref({ sort: "popular", page: 1 })).toBe("/courses");
  });

  it("serialises active filters", () => {
    expect(catalogHref({ q: "sql", level: "beginner", page: 2 })).toBe(
      "/courses?q=sql&level=beginner&page=2",
    );
  });
});
