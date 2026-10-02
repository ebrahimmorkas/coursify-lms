import { describe, expect, it } from "vitest";
import { toEmbedUrl } from "./video";

describe("toEmbedUrl", () => {
  it.each([
    [
      "https://www.youtube.com/watch?v=Sklc_fQBmcs",
      "https://www.youtube-nocookie.com/embed/Sklc_fQBmcs",
    ],
    ["https://youtu.be/Sklc_fQBmcs", "https://www.youtube-nocookie.com/embed/Sklc_fQBmcs"],
    [
      "https://www.youtube.com/embed/Sklc_fQBmcs",
      "https://www.youtube-nocookie.com/embed/Sklc_fQBmcs",
    ],
    [
      "https://m.youtube.com/watch?v=Sklc_fQBmcs&t=10",
      "https://www.youtube-nocookie.com/embed/Sklc_fQBmcs",
    ],
    ["https://vimeo.com/76979871", "https://player.vimeo.com/video/76979871"],
  ])("converts %s", (input, expected) => {
    expect(toEmbedUrl(input)).toBe(expected);
  });

  it.each([
    "",
    "not a url",
    "https://example.com/video.mp4",
    "https://www.youtube.com/watch?v=short",
    "javascript:alert(1)",
  ])("rejects %s", (input) => {
    expect(toEmbedUrl(input)).toBeNull();
  });
});
