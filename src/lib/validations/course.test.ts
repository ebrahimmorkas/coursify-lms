import { describe, expect, it } from "vitest";
import { courseSchema, lessonSchema } from "./course";

describe("courseSchema", () => {
  const base = {
    title: "Learn Rust",
    subtitle: "",
    description: "",
    category: "Web Development",
    level: "beginner",
  };

  it("converts dollar prices to cents", () => {
    expect(courseSchema.parse({ ...base, price: "49.99" }).price).toBe(4999);
    expect(courseSchema.parse({ ...base, price: "0" }).price).toBe(0);
  });

  it("rejects negative prices and unknown categories", () => {
    expect(courseSchema.safeParse({ ...base, price: "-1" }).success).toBe(false);
    expect(courseSchema.safeParse({ ...base, price: "10", category: "Cooking" }).success).toBe(
      false,
    );
  });
});

describe("lessonSchema", () => {
  const base = { title: "Intro", content: "Hello", durationMinutes: "10" };

  it("accepts empty video urls and checkbox values", () => {
    const lesson = lessonSchema.parse({ ...base, videoUrl: "", isPreview: "on" });
    expect(lesson.videoUrl).toBeNull();
    expect(lesson.isPreview).toBe(true);
    expect(lesson.durationMinutes).toBe(10);
  });

  it("rejects unsupported video hosts", () => {
    const result = lessonSchema.safeParse({ ...base, videoUrl: "https://example.com/a.mp4" });
    expect(result.success).toBe(false);
  });
});
