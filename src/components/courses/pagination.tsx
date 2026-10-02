import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { catalogHref, type CatalogFilters } from "@/lib/validations/catalog";

export function Pagination({ filters, pageCount }: { filters: CatalogFilters; pageCount: number }) {
  if (pageCount <= 1) return null;
  const { page } = filters;

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link
          href={catalogHref({ ...filters, page: page - 1 })}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronLeft className="size-4" aria-hidden /> Previous
        </Link>
      ) : null}
      <span className="px-3 text-sm text-slate-600">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link
          href={catalogHref({ ...filters, page: page + 1 })}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Next <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
