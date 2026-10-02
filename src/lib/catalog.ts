/** Static catalog metadata shared by the UI, validation schemas and the seed script. */

export const CATEGORIES = [
  "Web Development",
  "Data Science",
  "Mobile Development",
  "DevOps",
  "Design",
  "Business",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;

export const LEVEL_LABELS: Record<(typeof LEVELS)[number], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
