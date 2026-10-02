import { describe, expect, it } from "vitest";
import { flattenLessons, getAdjacentLessons, resumeLesson } from "./curriculum";

const sections = [
  { lessons: [{ id: "a" }, { id: "b" }] },
  { lessons: [] },
  { lessons: [{ id: "c" }] },
];
const lessons = flattenLessons(sections);

describe("flattenLessons", () => {
  it("keeps curriculum order across sections", () => {
    expect(lessons.map((lesson) => lesson.id)).toEqual(["a", "b", "c"]);
  });
});

describe("getAdjacentLessons", () => {
  it("crosses section boundaries", () => {
    expect(getAdjacentLessons(lessons, "b")).toEqual({
      previous: { id: "a" },
      next: { id: "c" },
      index: 1,
    });
  });

  it("returns nulls at the edges and for unknown lessons", () => {
    expect(getAdjacentLessons(lessons, "a").previous).toBeNull();
    expect(getAdjacentLessons(lessons, "c").next).toBeNull();
    expect(getAdjacentLessons(lessons, "zzz").index).toBe(-1);
  });
});

describe("resumeLesson", () => {
  it("prefers the last viewed lesson", () => {
    expect(resumeLesson(lessons, new Set(), "c")?.id).toBe("c");
  });

  it("falls back to the first incomplete lesson", () => {
    expect(resumeLesson(lessons, new Set(["a"]), null)?.id).toBe("b");
    expect(resumeLesson(lessons, new Set(["a"]), "deleted-lesson")?.id).toBe("b");
  });

  it("returns the first lesson when everything is complete", () => {
    expect(resumeLesson(lessons, new Set(["a", "b", "c"]), null)?.id).toBe("a");
  });

  it("handles courses without lessons", () => {
    expect(resumeLesson([], new Set(), null)).toBeNull();
  });
});
