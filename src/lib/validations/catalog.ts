import { z } from "zod";
import { CATEGORIES, LEVELS } from "@/lib/catalog";

export const SORT_OPTIONS = {
  popular: "Most popular",
  rating: "Highest rated",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;

export type SortOption = keyof typeof SORT_OPTIONS;

/** Ignores invalid values instead of failing, so a bad query string never breaks the page. */
const lenient = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined);

export const catalogFiltersSchema = z.object({
  q: lenient(z.string().trim().max(100)).transform((value) => value || undefined),
  category: lenient(z.enum(CATEGORIES)),
  level: lenient(z.enum(LEVELS)),
  price: lenient(z.enum(["free", "paid"])),
  sort: z
    .enum(Object.keys(SORT_OPTIONS) as [SortOption, ...SortOption[]])
    .catch("popular")
    .default("popular"),
  page: z.coerce.number().int().min(1).max(1000).catch(1).default(1),
});

export type CatalogFilters = z.infer<typeof catalogFiltersSchema>;

type SearchParams = Record<string, string | string[] | undefined>;

export function parseCatalogFilters(searchParams: SearchParams): CatalogFilters {
  const flat = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
  return catalogFiltersSchema.parse(flat);
}

/** Builds a catalog URL, dropping defaults so links stay short and cache-friendly. */
export function catalogHref(filters: Partial<CatalogFilters>) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.level) params.set("level", filters.level);
  if (filters.price) params.set("price", filters.price);
  if (filters.sort && filters.sort !== "popular") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `/courses?${query}` : "/courses";
}
