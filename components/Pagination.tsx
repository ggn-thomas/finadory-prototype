import Link from "next/link";
import { PAGE_SIZE, type PublicationFilters } from "@/lib/publications";

const button = "rounded-full bg-secondary px-4 py-1.5 text-sm text-text hover:bg-line";

// Builds a list URL that keeps the active filters and changes only the page.
function pageHref(filters: PublicationFilters, page: number): string {
  const params = new URLSearchParams();
  for (const key of ["company", "type", "subtype", "from", "to"] as const) {
    if (filters[key]) params.set(key, filters[key]);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

// "1–50 sur 390" counter with previous / next links.
export function Pagination({ filters, total }: { filters: PublicationFilters; total: number }) {
  if (total === 0) return null;
  const first = (filters.page - 1) * PAGE_SIZE + 1;
  const last = Math.min(filters.page * PAGE_SIZE, total);
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted">
      <span>
        {first}–{last} sur {total}
      </span>
      <div className="flex gap-2">
        {filters.page > 1 && (
          <Link className={button} href={pageHref(filters, filters.page - 1)}>
            ← Précédent
          </Link>
        )}
        {last < total && (
          <Link className={button} href={pageHref(filters, filters.page + 1)}>
            Suivant →
          </Link>
        )}
      </div>
    </div>
  );
}
