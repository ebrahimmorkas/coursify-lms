import { z } from "zod";
import { CATEGORIES, LEVELS } from "@/lib/catalog";
import { toEmbedUrl } from "@/lib/video";

export const courseSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  subtitle: z.string().trim().max(200, "Subtitle must be 200 characters or fewer").default(""),
  description: z.string().trim().max(5000, "Description is too long").default(""),
  category: z.enum(CATEGORIES, "Choose a category"),
  level: z.enum(LEVELS, "Choose a level"),
  /** Entered in dollars in the form, stored in cents. */
  price: z.coerce
    .number("Enter a valid price")
    .min(0, "Price cannot be negative")
    .max(999.99, "Price must be below $1,000")
    .transform((dollars) => Math.round(dollars * 100)),
});

export const sectionSchema = z.object({
  title: z.string().trim().min(2, "Section title is too short").max(120),
});

export const lessonSchema = z.object({
  title: z.string().trim().min(2, "Lesson title is too short").max(120),
  content: z.string().max(20_000, "Lesson content is too long").default(""),
  videoUrl: z
    .string()
    .trim()
    .transform((value) => value || null)
    .refine((value) => value === null || toEmbedUrl(value) !== null, {
      message: "Use a YouTube or Vimeo link",
    }),
  durationMinutes: z.coerce.number().int().min(1, "At least 1 minute").max(600),
  isPreview: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
