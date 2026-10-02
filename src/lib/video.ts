/**
 * Converts a YouTube or Vimeo URL into an embeddable player URL.
 * Returns null for unsupported URLs so they can be rejected during validation.
 */
export function toEmbedUrl(input: string | null | undefined): string | null {
  if (!input) return null;

  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "");
  const youtubeId = /^[\w-]{11}$/;

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const id = url.pathname.startsWith("/embed/")
      ? url.pathname.split("/")[2]
      : url.pathname.startsWith("/shorts/")
        ? url.pathname.split("/")[2]
        : url.searchParams.get("v");
    return id && youtubeId.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return youtubeId.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).pop();
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }

  return null;
}
