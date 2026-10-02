"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";
import { Input, Label, Select } from "@/components/ui/input";
import { CATEGORIES, LEVEL_LABELS, LEVELS } from "@/lib/catalog";
import { SORT_OPTIONS, catalogHref, type CatalogFilters } from "@/lib/validations/catalog";
import { cn } from "@/lib/utils";

/**
 * Filters are a plain GET form (works without JavaScript); with JavaScript enabled
 * changes are applied immediately using a client-side navigation.
 */
export function CatalogFilterForm({ filters }: { filters: CatalogFilters }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function apply(form: HTMLFormElement) {
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const next = {
      q: data.q || undefined,
      category: (data.category || undefined) as CatalogFilters["category"],
      level: (data.level || undefined) as CatalogFilters["level"],
      price: (data.price || undefined) as CatalogFilters["price"],
      sort: (data.sort || "popular") as CatalogFilters["sort"],
      page: 1,
    };
    startTransition(() => router.push(catalogHref(next)));
  }

  return (
    <form
      action="/courses"
      onSubmit={(event) => {
        event.preventDefault();
        apply(event.currentTarget);
      }}
      onChange={(event) => {
        // Text search applies on submit; dropdowns apply immediately.
        if ((event.target as HTMLElement).tagName === "SELECT") apply(event.currentTarget);
      }}
      className={cn("space-y-5 transition-opacity", pending && "opacity-60")}
    >
      <div className="space-y-1.5">
        <Label htmlFor="q">Search</Label>
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            id="q"
            name="q"
            type="search"
            placeholder="Search courses…"
            defaultValue={filters.q}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select id="category" name="category" defaultValue={filters.category ?? ""}>
          <option value="">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="level">Level</Label>
        <Select id="level" name="level" defaultValue={filters.level ?? ""}>
          <option value="">All levels</option>
          {LEVELS.map((level) => (
            <option key={level} value={level}>
              {LEVEL_LABELS[level]}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="price">Price</Label>
        <Select id="price" name="price" defaultValue={filters.price ?? ""}>
          <option value="">Any price</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sort">Sort by</Label>
        <Select id="sort" name="sort" defaultValue={filters.sort}>
          {Object.entries(SORT_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
    </form>
  );
}
